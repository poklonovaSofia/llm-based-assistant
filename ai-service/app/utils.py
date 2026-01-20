import fitz, docx, mammoth, re, os
import nltk
from nltk.corpus import stopwords

nltk.download("stopwords", quiet=True)
stop_words = set(stopwords.words("english"))

def extract_text(file_path):
    ext = file_path.lower()
    if ext.endswith(".pdf"):
        doc = fitz.open(file_path)
        return " ".join([page.get_text() for page in doc])
    elif ext.endswith(".docx"):
        d = docx.Document(file_path)
        return "\n".join(p.text for p in d.paragraphs)
    elif ext.endswith(".doc"):
        with open(file_path, "rb") as f:
            return mammoth.extract_raw_text(f).value
    return ""

def chunk_text(text, size=300):
    words = text.split()
    return [" ".join(words[i:i+size]) for i in range(0, len(words), size)]

def rewrite_query_no_llm(query, max_keywords=5):
    words = re.findall(r"[a-zA-Z]+", query.lower())
    filtered = [w for w in words if w not in stop_words]
    return " ".join(filtered[:max_keywords]) if filtered else " ".join(words[:max_keywords])