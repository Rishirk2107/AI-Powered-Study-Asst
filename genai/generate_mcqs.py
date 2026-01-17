import pdfplumber
import os
import json
import json5
import requests
from io import BytesIO
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

if not GROQ_API_KEY:
    raise ValueError("GROQ_API_KEY not found in environment variables.")

client = OpenAI(
    api_key=GROQ_API_KEY,
    base_url="https://api.groq.com/openai/v1",
)

def generate_mcqs_from_pdf(pdf_source: str):
    """
    Generate MCQs from a PDF.
    
    Args:
        pdf_source: Either a local file path or a Cloudinary URL
    
    Returns:
        List of MCQ dictionaries or None if parsing fails
    """
    try:
        if pdf_source.startswith(('http://', 'https://')):
            # Download PDF from URL
            response = requests.get(pdf_source)
            response.raise_for_status()
            pdf_file = BytesIO(response.content)
            with pdfplumber.open(pdf_file) as pdf:
                content = "\n".join(
                    page.extract_text() for page in pdf.pages if page.extract_text()
                )
        else:
            # Read from local file path
            with pdfplumber.open(pdf_source) as pdf:
                content = "\n".join(
                    page.extract_text() for page in pdf.pages if page.extract_text()
                )
    except Exception as e:
        raise RuntimeError(f"Failed to read PDF: {e}")

    print("Generating MCQs from LLM...")
    
    try:
        result = client.chat.completions.create(
            model="moonshotai/kimi-k2-instruct-0905",
            messages=[
                {
                    "role": "system",
                    "content": """You are an educational AI that generates MCQs. Return ONLY valid JSON — no explanations, no markdown, no headings.

Format:
[
  {
    "question": "...",
    "options": ["...", "...", "...", "..."],
    "answer": "..."
  },
  ...
]

IMPORTANT: Do not add extra text before or after the JSON."""
                },
                {
                    "role": "user",
                    "content": f"Content:\n{content}"
                }
            ]
        )
        
        raw_output = result.choices[0].message.content.strip()
        
        try:
            return json.loads(raw_output)
        except json.JSONDecodeError:
            try:
                return json5.loads(raw_output)
            except Exception:
                print("Failed to parse JSON. Raw output:\n", raw_output)
                return None
    except Exception as e:
        print(f"Error generating MCQs: {str(e)}")
        return None


def generate_mcqs_from_text(text: str):
    print("Generating MCQs from LLM (text)...")
    try:
        result = client.chat.completions.create(
            model="moonshotai/kimi-k2-instruct-0905",
            messages=[
                {
                    "role": "system",
                    "content": """You are an educational AI that generates MCQs. Return ONLY valid JSON — no explanations, no markdown, no headings.

Format:
[
  {
    "question": "...",
    "options": ["...", "...", "...", "..."],
    "answer": "..."
  },
  ...
]

IMPORTANT: Do not add extra text before or after the JSON."""
                },
                {
                    "role": "user",
                    "content": f"Content:\n{text}"
                }
            ]
        )

        raw_output = result.choices[0].message.content.strip()

        try:
            return json.loads(raw_output)
        except json.JSONDecodeError:
            try:
                return json5.loads(raw_output)
            except Exception:
                print("Failed to parse JSON. Raw output:\n", raw_output)
                return None
    except Exception as e:
        print(f"Error generating MCQs: {str(e)}")
        return None
