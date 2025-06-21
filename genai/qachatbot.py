import os
import torch
import fitz  
from dotenv import load_dotenv
from langchain_core.prompts import PromptTemplate
from langchain.chains import RetrievalQA
from langchain_community.embeddings import HuggingFaceEmbeddings 
from langchain_community.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.vectorstores import FAISS
from langchain_community.llms import HuggingFaceEndpoint
from langchain.docstore.document import Document
import getpass


load_dotenv()


DEVICE = "cuda:0" if torch.cuda.is_available() else "cpu"


conversation_retrieval_chain = None
chat_history = []
llm_hub = None
embeddings = None


def init_llm():
    global llm_hub, embeddings

    os.environ["HUGGINGFACEHUB_API_TOKEN"] = os.getenv('HUGGING_FACE_TOKEN')
    
    if "GROQ_API_KEY" not in os.environ:
        os.environ["GROQ_API_KEY"] = getpass.getpass("Enter your Groq API key: ")

    from langchain_groq import ChatGroq
    llm_hub = ChatGroq(model="llama3-8b-8192")
    embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")

def load_faiss_index():
    global conversation_retrieval_chain

    
    if embeddings is None:
        raise ValueError("Embeddings model is not initialized.")

    if not os.path.exists("./faiss_index"):
        print("FAISS index not found, processing the document to create the index...")
       
        print("Index created successfully!")
    else:
        
        db = FAISS.load_local("./faiss_index", embeddings,allow_dangerous_deserialization=True)
        
        conversation_retrieval_chain = RetrievalQA.from_chain_type(
            llm=llm_hub,
            chain_type="stuff",
            retriever=db.as_retriever(search_type="mmr", search_kwargs={'k': 6, 'lambda_mult': 0.25}),
            return_source_documents=False,
            input_key="question"
        )
        print("FAISS index loaded successfully.")

def process_document(document_path):
    global conversation_retrieval_chain

    doc = fitz.open(document_path)
    combined_text = ""
    for page in doc:
        text = page.get_text("text")
        combined_text += text + "\n\n" 
        for block in page.get_text("blocks"):
            lines = block[4].splitlines()

            if len(lines) > 1:  
                heading = lines[0].strip() 
                details = " | ".join(line.strip() for line in lines[1:]) 
                combined_text += f"{heading}: {details}\n"
            else:
                combined_text += block[4] + "\n"  

    text_splitter = RecursiveCharacterTextSplitter(chunk_size=3000, chunk_overlap=200) 
    texts = text_splitter.split_text(combined_text)

    documents = [Document(page_content=text) for text in texts]
    db = FAISS.from_documents(documents=documents, embedding=embeddings)
    
    db.save_local("./faiss_index")
    load_faiss_index()

def generate_summary(res):
    summary_prompt = (
   "Your name is Disha Mitra, an educational mentor who helps students understand study material clearly and confidently. "
    "Always identify yourself as 'Disha Mitra' if asked for your name, and never mention that you are an AI or language model. "
    "A student has a question based on the content of a document they provided. "
    "Answer the question in a supportive and encouraging tone, using simple language that's easy for high school students or their parents to understand. "
    "Avoid technical jargon unless necessary, and make the explanation clear and relatable.\n\n"
    "Question: {}\n\n"
    "Answer:".format(res)
)
    response_text = ""
    for chunk in llm_hub.stream([{"role": "user", "content": summary_prompt}]):
        response_text += chunk.content

    return response_text.strip()

def process_prompt(prompt):
    global conversation_retrieval_chain
    global chat_history
    output = conversation_retrieval_chain({"question": prompt, "chat_history": chat_history})
    
    answer = output["result"]
    summary = generate_summary(answer)
    chat_history.append((prompt, summary))

    return summary

init_llm()