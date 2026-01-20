from fastapi import FastAPI
from pydantic import BaseModel
from app.rag_engine import get_rag_response
from app.utils import rewrite_query_no_llm
from app.db import get_connection

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
@app.get("/db-test")
def db_test():
    try:
        with get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    CREATE TABLE IF NOT EXISTS test_table (
                        id SERIAL PRIMARY KEY,
                        name TEXT
                    );
                """)
                cur.execute("INSERT INTO test_table (name) VALUES (%s) RETURNING id;", ("Hello DB",))
                inserted_id = cur.fetchone()[0]
                cur.execute("SELECT id, name FROM test_table WHERE id = %s;", (inserted_id,))
                row = cur.fetchone()
                
        return {"success": True, "row": {"id": row[0], "name": row[1]}}
    except Exception as e:
        return {"success": False, "error": str(e)}