import os
import time
import numpy as np
import pdfplumber
import requests
from io import BytesIO
from dotenv import load_dotenv
from google import genai
from pinecone import Pinecone, ServerlessSpec


load_dotenv()

# Configuration from environment (set these in .env or environment)
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
EMBED_MODEL = "text-embedding-004"  # New Gemini embedding model
CHAT_MODEL = "gemini-3-flash-preview"  # New Gemini chat model

PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
PINECONE_ENV = os.getenv("PINECONE_ENV")
PINECONE_INDEX = os.getenv("PINECONE_INDEX", "genai-index")



# Gemini API key setup
genai_client = None
if GEMINI_API_KEY:
    genai_client = genai.Client(api_key=GEMINI_API_KEY)

# Pinecone client setup
pc = None
if PINECONE_API_KEY:
    pc = Pinecone(api_key=PINECONE_API_KEY)


_chat_history = []


def _extract_text(pdf_source: str) -> str:
    """
    Extract text from PDF either from file path or URL.
    Args:
        pdf_source: Either a local file path or a Cloudinary URL
    Returns:
        Extracted text from the PDF
    """
    try:
        if pdf_source.startswith(('http://', 'https://')):
            # Download PDF from URL
            response = requests.get(pdf_source)
            response.raise_for_status()
            pdf_file = BytesIO(response.content)
            with pdfplumber.open(pdf_file) as pdf:
                parts = [page.extract_text() for page in pdf.pages if page.extract_text()]
        else:
            # Open local file
            with pdfplumber.open(pdf_source) as pdf:
                parts = [page.extract_text() for page in pdf.pages if page.extract_text()]
        return "\n\n".join(parts)
    except Exception as e:
        raise ValueError(f"Error extracting text from PDF: {str(e)}")


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
    """Generate embeddings for a list of text chunks using Gemini."""
    if not GEMINI_API_KEY:
        raise EnvironmentError("GEMINI_API_KEY not set")
    if genai_client is None:
        raise EnvironmentError("genai_client not initialized")

    embeddings = []
    for text in texts:
        resp = genai_client.models.embed_content(
            model=EMBED_MODEL,
            contents=text
        )
        # Extract embedding values as float32 numpy array
        vec = np.array(resp.embeddings[0].values, dtype=np.float32)
        embeddings.append(vec)
    return embeddings


def _ensure_pinecone_index(dim: int):
    if not PINECONE_API_KEY:
        raise EnvironmentError("PINECONE_API_KEY not set in environment")
    if pc is None:
        raise EnvironmentError("Pinecone client not initialized")
    existing = pc.list_indexes().names()
    if PINECONE_INDEX not in existing:
        # You may want to update cloud/region as needed
        pc.create_index(
            name=PINECONE_INDEX,
            dimension=dim,
            metric="cosine",
            spec=ServerlessSpec(cloud="aws", region="us-west-2")
        )
    return pc.Index(PINECONE_INDEX)


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
    if genai_client is None:
        raise EnvironmentError("genai_client not initialized")

    # Embed the query using new API
    qresp = genai_client.models.embed_content(
        model=EMBED_MODEL,
        contents=prompt
    )
    q_vec = qresp.embeddings[0].values

    idx = pc.Index(PINECONE_INDEX)
    query_args = {"top_k": top_k, "include_metadata": True}
    if namespace:
        query_args["namespace"] = namespace

    # Query Pinecone
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

    # Concatenate system and user prompts into single string (new SDK doesn't use roles)
    combined_prompt = (
        "You are Disha Mitra, an educational mentor who helps students understand study material clearly and confidently. "
        "Answer concisely and supportively; when relevant, indicate which part of the provided context supports your answer.\n\n"
        f"CONTEXT:\n{context}\n\n"
        f"QUESTION: {prompt}\n\n"
        f"Answer:"
    )

    # Generate response using new API
    resp = genai_client.models.generate_content(
        model=CHAT_MODEL,
        contents=combined_prompt
    )

    # Extract the text from response
    answer = resp.text

    _chat_history.append((prompt, answer))
    return answer


if __name__ == "__main__":
    print("This module now uses Pinecone for vector storage. Use `process_document(path)` and `process_prompt(prompt)`.")