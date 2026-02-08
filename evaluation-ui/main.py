# evaluation-ui/main.py
from nicegui import ui
import os
from dotenv import load_dotenv

load_dotenv()  # підтягує .env з кореня проєкту

BACKEND_URL = os.getenv('BACKEND_URL', 'http://localhost:8000')

@ui.page('/')
def main_page():
    ui.label('Evaluation Tool').classes('text-4xl font-bold text-center mt-10')
    
    with ui.card().classes('w-96 mx-auto mt-8 shadow-xl p-6'):
        ui.label('Початок роботи').classes('text-xl font-semibold mb-4')
        ui.markdown('''
        Це інтерфейс для запуску та перегляду оцінок RAG / no-RAG конфігурацій.
        
        - Вибирай параметри
        - Запускай оцінку
        - Дивись метрики та приклади
        ''')
        
        ui.button('Перейти до запуску оцінки', 
                  on_click=lambda: ui.open('/eval'),
                  color='primary').props('push size=lg').classes('w-full mt-6')

ui.run(
    title='Evaluation UI',
    port=8501,
    reload=True,
    dark=True
)