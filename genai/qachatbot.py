import os
import time
import numpy as np
import fitz
from dotenv import load_dotenv
import google.generativeai as genai
import pinecone


load_dotenv()

# Configuration from environment (set these in .env or environment)
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
EMBED_MODEL = os.getenv("GEMINI_EMBED_MODEL", "embed-text-embedding-001")
CHAT_MODEL = os.getenv("GEMINI_CHAT_MODEL", "models/gemini-1.0")

PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
PINECONE_ENV = os.getenv("PINECONE_ENV")
PINECONE_INDEX = os.getenv("PINECONE_INDEX", "genai-index")

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    
if PINECONE_API_KEY:
    pinecone.init(api_key=PINECONE_API_KEY, environment=PINECONE_ENV)


_chat_history = []


def _extract_text(pdf_path: str) -> str:
    doc = fitz.open(pdf_path)
    parts = []
    for page in doc:
        parts.append(page.get_text("text"))
    return "\n\n".join(parts)


def _chunk_text(text: str, max_chars: int = 1000):
    chunks = []
    start = 0
    length = len(text)
    while start < length:
        end = min(start + max_chars, length)
        cut = text.rfind("\n", start, end)
        if cut <= start:
            cut = text.rfind(" ", start, end)
        if cut <= start:
            cut = end
        chunk = text[start:cut].strip()
        if chunk:
            chunks.append(chunk)
        start = cut
    return chunks


def _embed_texts(texts):
    if not GEMINI_API_KEY:
        raise EnvironmentError("GEMINI_API_KEY not set in environment")
    resp = genai.embeddings.create(model=EMBED_MODEL, input=texts)
    embs = [np.array(item["embedding"], dtype=np.float32) for item in resp["data"]]
    return embs


def _ensure_pinecone_index(dim: int):
    if not PINECONE_API_KEY:
        raise EnvironmentError("PINECONE_API_KEY not set in environment")
    existing = pinecone.list_indexes()
    if PINECONE_INDEX not in existing:
        pinecone.create_index(PINECONE_INDEX, dimension=dim, metric="cosine")
    return pinecone.Index(PINECONE_INDEX)


def process_document(document_path: str, namespace: str = None):
    """Extracts text from a PDF, chunks it, computes Gemini embeddings, and upserts vectors to Pinecone."""
    text = _extract_text(document_path)
    chunks = _chunk_text(text, max_chars=1200)
    if not chunks:
        raise ValueError("No text found in the provided PDF.")
    embeddings = _embed_texts(chunks)

    # ensure index exists and upsert
    idx = _ensure_pinecone_index(dim=len(embeddings[0]))
    vectors = []
    ts = int(time.time())
    for i, (chunk, emb) in enumerate(zip(chunks, embeddings)):
        vid = f"doc-{ts}-{i}"
        vectors.append((vid, emb.tolist(), {"text": chunk}))

    # use an optional namespace to separate documents
    if namespace:
        idx.upsert(vectors=vectors, namespace=namespace)
    else:
        idx.upsert(vectors=vectors)


def process_prompt(prompt: str, top_k: int = 4, namespace: str = None) -> str:
    """Answers a user prompt by querying Pinecone for relevant chunks and calling Gemini chat."""
    if not PINECONE_API_KEY:
        raise EnvironmentError("PINECONE_API_KEY not set in environment")

    # embed the query
    qresp = genai.embeddings.create(model=EMBED_MODEL, input=prompt)
    q_vec = qresp["data"][0]["embedding"]

    idx = pinecone.Index(PINECONE_INDEX)
    query_args = {"top_k": top_k, "include_metadata": True}
    if namespace:
        query_args["namespace"] = namespace

    # query may accept vector or queries depending on client version
    try:
        res = idx.query(vector=q_vec, **query_args)
    except TypeError:
        # fallback signature
        res = idx.query(queries=[q_vec], **query_args)

    matches = []
    if isinstance(res, dict):
        matches = res.get("matches", [])
    elif hasattr(res, "matches"):
        matches = res.matches

    context_chunks = []
    for m in matches[:top_k]:
        md = m.get("metadata") if isinstance(m, dict) else getattr(m, "metadata", None)
        if md and "text" in md:
            context_chunks.append(md["text"])

    if not context_chunks:
        context = ""
    else:
        context = "\n\n---\n\n".join(context_chunks)

    system_prompt = (
        "You are Disha Mitra, an educational mentor who helps students understand study material clearly and confidently. "
        "Answer concisely and supportively; when relevant, indicate which part of the provided context supports your answer."
    )
    user_prompt = f"CONTEXT:\n{context}\n\nQUESTION: {prompt}\n\nAnswer:"

    resp = genai.chat.create(model=CHAT_MODEL, messages=[{"role": "system", "content": system_prompt}, {"role": "user", "content": user_prompt}])

    # extract assistant text
    text = None
    if isinstance(resp, dict):
        if "candidates" in resp and len(resp["candidates"]) > 0:
            text = resp["candidates"][0].get("content") or resp["candidates"][0].get("message")
        elif "output" in resp and isinstance(resp["output"], dict):
            out = resp["output"].get("content")
            if isinstance(out, list) and len(out) > 0:
                text = out[0].get("text") if isinstance(out[0], dict) else str(out[0])
    if text is None:
        text = str(resp)

    _chat_history.append((prompt, text))
    return text


if __name__ == "__main__":
    print("This module now uses Pinecone for vector storage. Use `process_document(path)` and `process_prompt(prompt)`.")