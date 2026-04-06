// src/pages/CreateAgent.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function CreateAgent() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    description: '',
    keywords: '',
    isPublic: false,
    documentCount: '5-15', // діапазон
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    // Тут можна зберегти в localStorage або відправити на бекенд
    const agentId = Date.now().toString(); // тимчасовий ID
    navigate(`/upload/${agentId}`);
  };

  return (
    <div className="min-h-screen bg-[#f8f1e9] flex items-center justify-center px-6 py-12">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl p-12">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-[#2c1810] rounded-2xl mx-auto flex items-center justify-center text-white text-5xl mb-4">🤖</div>
          <h1 className="text-4xl font-bold text-[#2c1810]">Build Your Agent</h1>
          <p className="text-gray-600 mt-3">Створи свого спеціалізованого AI експерта</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Назва агента */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Agent Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-6 py-4 border border-gray-300 rounded-2xl focus:outline-none focus:border-[#2c1810] text-lg"
              placeholder="Sinupret Assistant"
              required
            />
          </div>

          {/* Опис (необов'язково) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description <span className="text-gray-400">(optional)</span></label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-6 py-4 border border-gray-300 rounded-2xl focus:outline-none focus:border-[#2c1810] text-lg h-28 resize-y"
              placeholder="Medical assistant specialized in respiratory medications..."
            />
          </div>

          {/* Ключові слова */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Key Keywords</label>
            <input
              type="text"
              value={form.keywords}
              onChange={(e) => setForm({ ...form, keywords: e.target.value })}
              className="w-full px-6 py-4 border border-gray-300 rounded-2xl focus:outline-none focus:border-[#2c1810] text-lg"
              placeholder="sinupret, sirup, respiratory, medicine, instructions"
            />
            <p className="text-xs text-gray-500 mt-1">Розділяй комами</p>
          </div>

          {/* Кількість документів */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Expected number of documents</label>
            <select
              value={form.documentCount}
              onChange={(e) => setForm({ ...form, documentCount: e.target.value })}
              className="w-full px-6 py-4 border border-gray-300 rounded-2xl focus:outline-none focus:border-[#2c1810] text-lg"
            >
              <option value="1-5">1–5 documents</option>
              <option value="5-15">5–15 documents</option>
              <option value="15-30">15–30 documents</option>
              <option value="30+">30+ documents</option>
            </select>
          </div>

          {/* Публічний / Приватний */}
          <div className="flex items-center justify-between bg-gray-50 p-6 rounded-2xl">
            <div>
              <p className="font-medium">Visibility</p>
              <p className="text-sm text-gray-600">Make this agent public or keep it private?</p>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setForm({ ...form, isPublic: false })}
                className={`px-6 py-3 rounded-2xl font-medium transition ${!form.isPublic ? 'bg-[#2c1810] text-white' : 'bg-white border border-gray-300'}`}
              >
                Private
              </button>
              <button
                type="button"
                onClick={() => setForm({ ...form, isPublic: true })}
                className={`px-6 py-3 rounded-2xl font-medium transition ${form.isPublic ? 'bg-[#2c1810] text-white' : 'bg-white border border-gray-300'}`}
              >
                Public
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-[#2c1810] text-white py-5 rounded-2xl font-semibold text-lg hover:bg-[#1f120b] transition mt-6"
          >
            Create Agent → Next Step: Upload Documents
          </button>
        </form>
      </div>
    </div>
  );
}