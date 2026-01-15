import pdfplumber
from openai import OpenAI
import json
import os
from dotenv import load_dotenv
import re
import requests
from io import BytesIO

load_dotenv()
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

if not GROQ_API_KEY:
    print("Error: GROQ_API_KEY not found in environment variables.")
    exit(1)

client = OpenAI(
    api_key=GROQ_API_KEY,
    base_url="https://api.groq.com/openai/v1",
)

def extract_text_from_pdf(pdf_source):
    """
    Extract text from PDF either from file path or URL.
    
    Args:
        pdf_source: Either a local file path or a Cloudinary URL
    
    Returns:
        Extracted text from the PDF
    """
    text = ""
    try:
        if pdf_source.startswith(('http://', 'https://')):
            # Download PDF from URL
            response = requests.get(pdf_source)
            response.raise_for_status()
            pdf_file = BytesIO(response.content)
            with pdfplumber.open(pdf_file) as pdf:
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + "\n"
        else:
            # Read from local file path
            with pdfplumber.open(pdf_source) as pdf:
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + "\n"
        return text.strip()
    except Exception as e:
        return f"Error extracting text: {str(e)}"


def clean_json_response(response_text):
    cleaned = re.sub(r'```(?:json)?\n?|```', '', response_text).strip()
    json_match = re.search(r'\{[\s\S]*\}', cleaned)
    if json_match:
        cleaned = json_match.group(0)
    else:
        raise ValueError("No valid JSON object found in response")
    print("Cleaned response:", cleaned)
    return cleaned

def generate_flashcards(pdf_source):
    """
    Generate flashcards from a PDF.
    
    Args:
        pdf_source: Either a local file path or a Cloudinary URL
    
    Returns:
        Dictionary with flashcards or error message
    """
    # Validate source
    if not pdf_source:
        return {"error": "PDF source not provided"}
    
    # For local paths, check if file exists
    if not pdf_source.startswith(('http://', 'https://')) and not os.path.exists(pdf_source):
        return {"error": f"PDF file not found: {pdf_source}"}
    
    extracted_text = extract_text_from_pdf(pdf_source)
    if "Error" in extracted_text:
        return {"error": extracted_text}
    
    max_text_length = 4000 
    if len(extracted_text) > max_text_length:
        extracted_text = extracted_text[:max_text_length]
    
    try:
        response = client.chat.completions.create(
            model="moonshotai/kimi-k2-instruct-0905",
            messages=[
                {
                    "role": "system",
                    "content": """You are an expert educator tasked with creating flashcards from provided text. 
                    Analyze the text and generate 3-5 concise question-answer pairs focusing on key concepts, definitions, or facts. 
                    Return *only* valid JSON in the format: {"flashcards": [{"question": "", "answer": ""}, ...]}.
                    Do not include any extra text, explanations, or code fences (e.g., ```). Ensure the output is valid JSON."""
                },
                {
                    "role": "user",
                    "content": f"Text: {extracted_text}\nGenerate flashcards in JSON format."
                }
            ]
        )
        
        print("Raw LLM response:", response.choices[0].message.content)
        cleaned_response = clean_json_response(response.choices[0].message.content)
        flashcards_json = json.loads(cleaned_response)
        return flashcards_json
    except json.JSONDecodeError as e:
        return {"error": f"Error parsing JSON response: {str(e)}"}
    except Exception as e:
        return {"error": f"Error generating flashcards: {str(e)}"}

if __name__ == "__main__":
    # Example with Cloudinary URL
    # Replace with your actual Cloudinary URL
    pdf_url = "https://res.cloudinary.com/your_cloud_name/raw/upload/v1234567890/flashcards/your-file.pdf"
    
    # Or use a local file path for testing
    # pdf_path = "../uploads/58d24e5f-aa66-49bd-a416-7bc9f23cdcda.pdf"
    
    result = generate_flashcards(pdf_url)
    print(json.dumps(result, indent=2))

    with open("flashcards.json", "w") as f:
        json.dump(result, f, indent=2)