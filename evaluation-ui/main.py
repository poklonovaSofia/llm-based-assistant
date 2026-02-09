import httpx
import os
from dotenv import load_dotenv
from nicegui import ui, events
import asyncio

load_dotenv()
BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8000")

async def evaluate_testset(agent_name: str, file_content: bytes, compare_no_rag: bool = False):
    try:
        files = {"file": ("testset.json", file_content, "application/json")}
        data = {
            "agent_name": agent_name,
            "compare_no_rag": str(compare_no_rag).lower()  # FastAPI Form приймає str для bool
        }
        async with httpx.AsyncClient(timeout=600.0) as client:
            response = await client.post(
                f"{BACKEND_URL}/evaluate-testset",
                files=files,
                data=data
            )
            response.raise_for_status()
            return response.json()
    except Exception as e:
        return {"error": str(e)}


@ui.page("/")
def main_page():
    ui.label("RAG Evaluation Tool").classes("text-4xl font-bold text-center mt-8 mb-4")
    
    with ui.card().classes("w-full max-w-3xl mx-auto shadow-xl p-8"):
        ui.label("Evaluate Test Set").classes("text-2xl font-semibold mb-6")
        
        agent_input = ui.input(
            label="Agent Name",
            placeholder="e.g. sinupret, cardiology...",
        ).classes("w-full mb-4").props("outlined dense")
        
        file_status = ui.label("No file selected").classes("text-sm text-gray-500 mb-2")

        # Завантаження файлу
        async def handle_upload(e: events.UploadEventArguments):
            try:
                filename = e.file.name
                
                if not filename.lower().endswith('.json'):
                    ui.notify("Only .json files are allowed", type="negative")
                    return

                content = e.file.read()
                if hasattr(content, '__await__') or asyncio.iscoroutine(content):
                    content = await content
                
                ui.context.client.storage['uploaded_content'] = content
                file_status.text = f"Uploaded: {filename} ({len(content) // 1024} KB)"
                ui.notify(f"File {filename} ready", type="positive")
                
            except Exception as ex:
                ui.notify(f"Upload error: {str(ex)}", type="negative")
                print(f"Full Error: {ex}")

        ui.upload(
            label="Upload testset JSON file",
            multiple=False,
            on_upload=handle_upload,
            auto_upload=True
        ).classes("w-full mb-6").props("outlined")

        # Чекбокс для порівняння
        compare_no_rag = ui.checkbox("Compare with no-RAG version (evaluate both)").classes("mb-6")

        result_area = ui.card().classes("w-full mt-6 min-h-[200px] bg-gray-50 dark:bg-gray-800")

        async def run_evaluation():
            result_area.clear()
            agent = agent_input.value.strip()
            content = ui.context.client.storage.get('uploaded_content')

            if not agent:
                ui.notify("Please enter agent name", type="warning")
                return
            if content is None:
                ui.notify("Please upload a JSON file first", type="warning")
                return

            with result_area:
                with ui.row().classes("items-center gap-4 p-4"):
                    ui.spinner(size="lg", color="primary")
                    ui.label("Evaluating... This may take several minutes").classes("text-lg")

            result = await evaluate_testset(agent, content, compare_no_rag.value)
            result_area.clear()

            if "error" in result:
                with result_area:
                    ui.label("Error").classes("text-xl text-negative font-bold mb-2")
                    ui.markdown(f"```\n{result['error']}\n```")
                return

            # Відображення результатів
            with result_area:
                ui.label("Evaluation Results").classes("text-2xl font-bold mb-6")

                # Якщо є тільки RAG (compare_no_rag=False)
                if "no_rag" not in result:
                    show_results(result, "RAG Results")
                else:
                    # Порівняння — використовуємо вкладки
                    with ui.tabs() as tabs:
                        ui.tab("RAG Results")
                        ui.tab("No-RAG Results")
                        ui.tab("Comparison")

                    with ui.tab_panels(tabs, value="RAG Results").classes("w-full"):
                        with ui.tab_panel("RAG Results"):
                            show_results(result["rag"], "RAG Mode")

                        with ui.tab_panel("No-RAG Results"):
                            show_results(result["no_rag"], "No-RAG Mode")

                        with ui.tab_panel("Comparison"):
                            ui.label("Side-by-side comparison coming soon...").classes("text-lg italic")
                            # Тут можна додати таблицю з різницею метрик пізніше

        ui.button("RUN EVALUATION", on_click=run_evaluation).classes("w-full mt-6").props("push color=primary glossy size=x-large")


def show_results(data: dict, title: str):
    """Допоміжна функція для відображення одного набору результатів"""
    ui.label(title).classes("text-xl font-bold mb-4")

    # Summary Scores
    if "summary_scores" in data:
        scores = data["summary_scores"]
        with ui.row().classes("gap-6 flex-wrap mb-8"):
            score_data = scores if isinstance(scores, dict) else scores[0] if isinstance(scores, list) else {}
            for metric, value in score_data.items():
                if isinstance(value, (int, float)):
                    with ui.card().classes("p-4 text-center min-w-[140px] shadow-md"):
                        ui.label(metric.replace("_", " ").title()).classes("text-sm opacity-70 mb-1")
                        ui.label(f"{value:.3f}").classes("text-3xl font-bold text-primary")

    # Таблиця прикладів
    if "individual_results" in data and data["individual_results"]:
        ui.label("Individual Results").classes("text-lg font-semibold mb-3")
        ui.table(
            columns=[
                {"name": "question", "label": "Question", "field": "question", "align": "left"},
                {"name": "faithfulness", "label": "Faith", "field": "faithfulness"},
                {"name": "answer_relevancy", "label": "Relev", "field": "answer_relevancy"},
                {"name": "context_precision", "label": "Prec", "field": "context_precision"},
            ],
            rows=data["individual_results"],
            row_key="question",
            pagination={"rowsPerPage": 10, "sortBy": "faithfulness", "descending": False}
        ).classes("w-full text-sm")


ui.run(
    title="RAG Evaluation Tool",
    port=8505,
    reload=True,
    dark=True,
    storage_secret="bakalarka_2024_secret_key"
)