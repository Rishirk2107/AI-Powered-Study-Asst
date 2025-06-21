from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from flashcard import generate_flashcards
from qachatbot import process_document, process_prompt

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class FilePathRequest(BaseModel):
    Path: str

class Message(BaseModel):
    userMessage: str

@app.post("/api/flashcards")
def get_flashcards(request: FilePathRequest):
    print(request.Path)
    result = generate_flashcards(request.Path)
    print(result)

    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    
    return result

@app.post("/api/chatbot/chat")
async def process_message_route(message: Message):
    user_message = message.userMessage

    if not user_message:
        raise HTTPException(status_code=400, detail="Please provide a message to process.")

    try:
        bot_response = process_prompt(user_message)
        return JSONResponse(content={"botResponse": bot_response}, status_code=200)
    except Exception as e:
        raise HTTPException(status_code=500, detail="There was an error processing your message.")
    
@app.post("/api/chatbot/upload")
async def process_document_route(request: FilePathRequest):
    
    try:
        process_document(request.Path)
        return JSONResponse(content={
            "botResponse": "Thank you for providing your PDF document. I have analyzed it, so now you can ask me any questions regarding it!"
        }, status_code=200)
    except Exception as e:
        raise HTTPException(status_code=500, detail="There was an error processing your document.")


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
