import os
import psycopg

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://vectorDB:vectorDB@localhost:5432/vectorDB")

def get_connection():
    return psycopg.connect(DATABASE_URL)
