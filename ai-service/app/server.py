from fastapi import FastAPI
from pydantic import BaseModel
from app.rag_engine import get_rag_response
from app.utils import rewrite_query_no_llm

app = FastAPI(title="Medicine RAG API")

class QueryRequest(BaseModel):
    query: str

@app.post("/ask")
async def ask_question(request: QueryRequest):
    rewritten = rewrite_query_no_llm(request.query)
    answer = get_rag_response(request.query, rewritten)
    
    return {
        "original_query": request.query,
        "rewritten_query": rewritten,
        "answer": answer
    }
