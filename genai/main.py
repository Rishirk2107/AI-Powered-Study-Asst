from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from flashcard import generate_flashcards
import os

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

@app.post("/api/flashcards")
def get_flashcards(request: FilePathRequest):
    print(request.Path)
    print(os.getcwd())
    result = generate_flashcards(request.Path)
    print(result)

    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    
    return result

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
