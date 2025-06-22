import pdfplumber
import os
import json
import json5
from dotenv import load_dotenv
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate

load_dotenv()
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

def generate_mcqs_from_pdf(pdf_path: str):
    if not GROQ_API_KEY:
        raise ValueError("GROQ_API_KEY not found in environment variables.")

    try:
        with pdfplumber.open(pdf_path) as pdf:
            content = "\n".join(
                page.extract_text() for page in pdf.pages if page.extract_text()
            )
    except Exception as e:
        raise RuntimeError(f"Failed to read PDF: {e}")

    llm = ChatGroq(api_key=GROQ_API_KEY, model="llama3-70b-8192")
    prompt = ChatPromptTemplate.from_template("""
You are an educational AI that generates MCQs. Return ONLY valid JSON — no explanations, no markdown, no headings.

Format:
[
  {{
    "question": "...",
    "options": ["...", "...", "...", "..."],
    "answer": "..."
  }},
  ...
]

IMPORTANT: Do not add extra text before or after the JSON.

Content:
{text}
""")
    chain = prompt | llm

    print("Generating MCQs from LLM...")
    result = chain.invoke({"text": content})
    raw_output = result.content.strip()

    try:
        return json.loads(raw_output)
    except json.JSONDecodeError:
        try:
            return json5.loads(raw_output)
        except Exception:
            print("Failed to parse JSON. Raw output:\n", raw_output)
            return None
