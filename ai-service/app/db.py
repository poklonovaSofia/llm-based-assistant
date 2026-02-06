import os
import psycopg

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://vectorDB:vectorDB@localhost:5433/vectorDB")

def get_connection():
    return psycopg.connect(DATABASE_URL)

def get_random_chunks(agent_name: str, limit: int = 10):
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT content 
                FROM documents 
                WHERE agent_name = %s 
                ORDER BY RANDOM() 
                LIMIT %s;
            """, (agent_name, limit))
            rows = cur.fetchall()
            return [row[0] for row in rows]