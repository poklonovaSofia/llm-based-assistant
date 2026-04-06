import httpx
import os
from dotenv import load_dotenv
from nicegui import ui, events
import asyncio
import json
from datetime import datetime
load_dotenv()
BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8000")

# ────────────────────────────────────────────────
#   Ваші функції без змін
# ────────────────────────────────────────────────

async def evaluate_testset(agent_name: str, file_content: bytes, compare_no_rag: bool = False):
    try:
        files = {"file": ("testset.json", file_content, "application/json")}
        data = {
            "agent_name": agent_name,
            "compare_no_rag": str(compare_no_rag).lower()
        }
        async with httpx.AsyncClient(timeout=None) as client:
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
    # ─── Глобальний стиль ────────────────────────────────
    ui.context.client.content.classes('bg-gray-50')

    ui.label("RAG Evaluation Tool") \
        .classes('text-5xl font-extrabold text-center mt-10 mb-2 tracking-tight') \
        .style('color: #1f2937; letter-spacing: -0.025em;')

    with ui.card().classes('w-full max-w-4xl mx-auto shadow-2xl rounded-2xl p-10 bg-white border border-gray-100'):
        ui.label("Evaluate Test Set").classes('text-3xl font-bold mb-8 text-gray-800')

        agent_input = ui.input(
            label="Agent Name",
            placeholder="sinupret, cardiology, diabetes-agent...",
        ).classes('w-full mb-6').props('outlined dense clearable').style('font-size: 1.05rem;')

        file_status = ui.label("No file selected") \
            .classes('text-sm text-gray-600 mb-3 italic')

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
                file_status.text = f"Uploaded: {filename}  •  {len(content) // 1024:,} KB"
                ui.notify(f"File ready • {filename}", type="positive", close_button=True)
                
            except Exception as ex:
                ui.notify(f"Upload error: {str(ex)}", type="negative")

        with ui.row().classes('items-center gap-4 mb-8'):
            ui.upload(
                label="Upload testset (.json)",
                multiple=False,
                on_upload=handle_upload,
                auto_upload=True
            ).classes('flex-1').props('outlined dense accept=.json')

            ui.tooltip('Only JSON files with valid testset format').classes('text-sm')

        compare_no_rag = ui.checkbox("Also evaluate No-RAG baseline (comparison mode)") \
            .classes('text-lg mb-8 text-gray-700')

        result_area = ui.card().classes('w-full mt-4 min-h-[240px] bg-white border border-gray-100 rounded-xl shadow-sm')

        async def run_evaluation():
            result_area.clear()
            agent = agent_input.value.strip()
            content = ui.context.client.storage.get('uploaded_content')

            if not agent:
                ui.notify("Agent name is required", type="warning")
                return
            if content is None:
                ui.notify("Please upload a testset JSON first", type="warning")
                return

            with result_area:
                with ui.row().classes('items-center justify-center gap-5 p-10'):
                    ui.spinner(size="xl", color="orange-600")
                    ui.label("Evaluating... this can take a few minutes") \
                        .classes('text-xl font-medium text-gray-600')

            result = await evaluate_testset(agent, content, compare_no_rag.value)
            with open(f"eval_result_{agent}_{datetime.now().strftime('%H%M')}.json", "w", encoding="utf-8") as f:
                json.dump(result, f, ensure_ascii=False, indent=2)
            result_area.clear()
            def clean_nan(obj):
                if isinstance(obj, list):
                    return [clean_nan(v) for v in obj]
                elif isinstance(obj, dict):
                    return {k: clean_nan(v) for k, v in obj.items()}
                elif isinstance(obj, float):
                    # Ak je hodnota NaN alebo nekonečno, zmeníme ju na 0.0
                    if obj != obj or obj == float('inf') or obj == float('-inf'):
                        return 0.0
                return obj

            result = clean_nan(result)

            if "error" in result:
                with result_area:
                    ui.label("Evaluation failed").classes('text-2xl text-red-600 font-bold mb-4')
                    ui.markdown(f"```text\n{result['error']}\n```").classes('text-sm bg-red-50 p-4 rounded-lg')
                return

            with result_area:
                ui.label("Evaluation Results").classes('text-3xl font-bold text-gray-800 mb-8')

                if "no_rag" not in result:
                    show_results(result, "RAG Results", accent_color="orange")
                else:
                    with ui.tabs().classes('mb-6') as tabs:
                        ui.tab("RAG Results").classes('text-lg')
                        ui.tab("No-RAG Results").classes('text-lg')
                        ui.tab("Comparison").classes('text-lg font-semibold text-green-700')

                    with ui.tab_panels(tabs, value="RAG Results").classes('w-full'):
                        with ui.tab_panel("RAG Results"):
                            show_results(result["rag"], "RAG Mode", accent_color="orange")

                        with ui.tab_panel("No-RAG Results"):
                            show_results(result["no_rag"], "No-RAG Mode", accent_color="gray")

                    with ui.tab_panel("Comparison"):
                        ui.label("Improvement thanks to RAG").classes('text-2xl font-bold mb-6 text-green-800')

                        try:
                            # Безпечне обчислення середнього
                            def safe_avg(key: str, results_list: list) -> float:
                                values = [float(r.get(key, 0)) for r in results_list if r.get(key) is not None]
                                return sum(values) / len(values) if values else 0.0

                            rag_ind = result["rag"]["individual_results"]
                            norag_ind = result["no_rag"]["individual_results"]

                            rag_faith   = safe_avg("faithfulness", rag_ind)
                            norag_faith = safe_avg("faithfulness", norag_ind)

                            rag_correct   = safe_avg("answer_correctness", rag_ind)
                            norag_correct = safe_avg("answer_correctness", norag_ind)

                            with ui.row().classes('gap-6 justify-center flex-wrap mb-10'):
                                # Faithfulness (залишаємо для повноти, але менш важливий)
                                with ui.card().classes('p-6 text-center min-w-[280px] shadow-lg border-t-4 border-green-500'):
                                    ui.label("Faithfulness Improvement").classes('text-base font-medium mb-2')
                                    delta_f = (rag_faith - norag_faith) * 100
                                    ui.label(f"+{delta_f:.1f}%").classes('text-4xl font-bold text-green-600')
                                    ui.label(f"({norag_faith:.2f} → {rag_faith:.2f})").classes('text-sm text-gray-600 mt-1')

                                # Answer Correctness — головна метрика
                                with ui.card().classes('p-6 text-center min-w-[280px] shadow-lg border-t-4 border-green-600 bg-green-50/30'):
                                    ui.label("Answer Correctness Boost").classes('text-base font-medium mb-2 text-green-800')
                                    delta_c = (rag_correct - norag_correct) * 100
                                    ui.label(f"+{delta_c:.1f}%").classes('text-5xl font-extrabold text-green-700')
                                    ui.label(f"({norag_correct:.2f} → {rag_correct:.2f})").classes('text-sm text-gray-700 mt-1')

                            # Підсумковий коментар
                            if delta_c > 25:
                                ui.label("Significant improvement in answer accuracy thanks to RAG!").classes('text-xl text-green-700 font-medium text-center mt-6')
                            elif delta_c > 10:
                                ui.label("Noticeable improvement in answer accuracy thanks to RAG.").classes('text-xl text-green-600 text-center mt-6')
                            else:
                                ui.label("Moderate improvement in answer accuracy — consider improving retrieval or prompts.").classes('text-xl text-amber-700 text-center mt-6')
                        except Exception as ex:
                            ui.label("Unable to calculate comparisonя").classes('text-lg text-gray-500')
                            ui.label(str(ex)).classes('text-sm text-gray-400')

        ui.button("RUN EVALUATION", on_click=run_evaluation) \
            .classes('w-full mt-8') \
            .props('push color=orange-600 glossy size=x-large no-caps rounded-xl text-lg font-medium')


def show_results(data: dict, title: str, accent_color: str = "orange"):
    ui.label(title).classes(f'text-2xl font-bold mb-6 text-{accent_color}-700')

    if "summary_scores" in data:
        scores = data["summary_scores"]
        score_dict = scores if isinstance(scores, dict) else scores[0] if isinstance(scores, list) else {}

        with ui.row().classes('gap-5 flex-wrap mb-10 justify-center'):
            for metric, value in score_dict.items():
                if isinstance(value, (int, float)) and value is not None:
                    # Робимо answer_correctness зеленим, бо це ключова метрика
                    color = "green" if metric == "answer_correctness" else accent_color
                    with ui.card().classes(f'p-6 text-center min-w-[160px] shadow-md border-t-4 border-{color}-500 bg-gradient-to-b from-white to-gray-50'):
                        ui.label(metric.replace("_", " ").title()) \
                            .classes('text-sm text-gray-600 mb-2 font-medium')
                        ui.label(f"{value:.3f}") \
                            .classes(f'text-4xl font-extrabold text-{color}-600')

    if "individual_results" in data and data["individual_results"]:
        ui.label("Detailed Results").classes('text-xl font-semibold mb-4 text-gray-700')

        columns = [
            {"name": "question", "label": "Question", "field": "question", "align": "left"},
            {"name": "faithfulness",   "label": "Faithfulness",   "field": "faithfulness"},
            {"name": "answer_relevancy", "label": "Answer Relev.", "field": "answer_relevancy"},
            {"name": "context_precision","label": "Context Prec.", "field": "context_precision"},
        ]

        # Додаємо колонку answer_correctness, якщо вона є в даних
        sample_row = data["individual_results"][0]
        if "answer_correctness" in sample_row:
            columns.append(
                {"name": "answer_correctness", "label": "Answer Correct.", "field": "answer_correctness"}
            )

        # Сортуємо за answer_correctness за замовчуванням (якщо є)
        sort_by = "answer_correctness" if "answer_correctness" in sample_row else "faithfulness"

        ui.table(
            columns=columns,
            rows=data["individual_results"],
            row_key="question",
            pagination={"rowsPerPage": 10, "sortBy": sort_by, "descending": True}
        ).classes('w-full text-sm')


ui.run(
    title="RAG Evaluation Tool • Modern UI",
    port=8505,
    reload=True,
    dark=False,
    storage_secret="bakalarka_2024_secret_key"
)