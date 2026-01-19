from fastapi import FastAPI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langserve import add_routes

app = FastAPI(
    title="LangChain Server",
    version="1.0",
    description="A simple api server using LangChain's Runnable interfaces",
)

prompt = ChatPromptTemplate.from_template("Tell me a joke about {topic}")
chain = prompt | StrOutputParser()
add_routes(
    app,
    chain,
    path="/joke",
)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="localhost", port=8000)