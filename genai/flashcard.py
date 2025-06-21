import pdfplumber
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
import json
import os
from dotenv import load_dotenv
import re

load_dotenv()
GROQ_API_KEY = os.getenv("GROQ_API_KEY")


if not GROQ_API_KEY:
    print("Error: GROQ_API_KEY not found in environment variables.")
    exit(1)

llm = ChatGroq(model="llama3-8b-8192", api_key=GROQ_API_KEY)

def extract_text_from_pdf(pdf_path):
    text = ""
    try:
        with pdfplumber.open(pdf_path) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
        return text.strip()
    except Exception as e:
        return f"Error extracting text: {str(e)}"

prompt_template = ChatPromptTemplate.from_messages([
    ("system", """You are an expert educator tasked with creating flashcards from provided text. 
    Analyze the text and generate 3-5 concise question-answer pairs focusing on key concepts, definitions, or facts. 
    Return *only* valid JSON in the format: {{"flashcards": [{{"question": "", "answer": ""}}, ...]}}.
    Do not include any extra text, explanations, or code fences (e.g., ```). Ensure the output is valid JSON."""),
    ("human", "Text: {text}\nGenerate flashcards in JSON format.")
])

chain = prompt_template | llm

def clean_json_response(response_text):
    cleaned = re.sub(r'```(?:json)?\n?|```', '', response_text).strip()
    json_match = re.search(r'\{[\s\S]*\}', cleaned)
    if json_match:
        cleaned = json_match.group(0)
    else:
        raise ValueError("No valid JSON object found in response")
    print("Cleaned response:", cleaned)
    return cleaned

def generate_flashcards(pdf_path):
    if not os.path.exists(pdf_path):
        return {"error": f"PDF file not found: {pdf_path}"}
    
    extracted_text = extract_text_from_pdf(pdf_path)
    if "Error" in extracted_text:
        return {"error": extracted_text}
    
    max_text_length = 4000 
    if len(extracted_text) > max_text_length:
        extracted_text = extracted_text[:max_text_length]
    
    try:
        response = chain.invoke({"text": extracted_text})
        print("Raw LLM response:", response.content)
        cleaned_response = clean_json_response(response.content)
        flashcards_json = json.loads(cleaned_response)
        return flashcards_json
    except json.JSONDecodeError as e:
        return {"error": f"Error parsing JSON response: {str(e)}. Cleaned response: {cleaned_response}"}
    except Exception as e:
        return {"error": f"Error generating flashcards: {str(e)}"}

if __name__ == "__main__":
    pdf_path = "../uploads/58d24e5f-aa66-49bd-a416-7bc9f23cdcda.pdf"  # Verify this path
    result = generate_flashcards(pdf_path)
    print(json.dumps(result, indent=2))

    with open("flashcards.json", "w") as f:
        json.dump(result, f, indent=2)