import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function CreateAgent() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    description: '',
    isPublic: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8080/api/agents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create agent');
      }

      navigate(`/upload/${data.id}`, { state: { agentName: form.name } });

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-8">
      <div className="bg-white rounded-2xl border-2 border-violet-400 shadow-[0_0_0_4px_#a78bfa30] w-full max-w-lg p-8">

        <div className="mb-8">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-500 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full mb-3">
            ✦ NEW AGENT
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Build Your Agent</h1>
          <p className="text-sm text-gray-400 mt-1">Create a specialized AI expert from your documents</p>
        </div>

        {error && (
          <div className="bg-red-50 border-2 border-red-300 text-red-600 px-3 py-2 rounded-xl mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">Agent Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-violet-400 text-sm transition-colors"
              placeholder="e.g. Sinupret Assistant"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
              Description <span className="text-gray-400 normal-case font-normal">(optional)</span>
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-violet-400 text-sm h-24 resize-none transition-colors"
              placeholder="Medical assistant specialized in respiratory medications..."
            />
          </div>

          <div className="flex items-center justify-between bg-gray-50 border-2 border-gray-200 p-4 rounded-xl">
            <div>
              <p className="text-sm font-bold text-gray-800">Visibility</p>
              <p className="text-xs text-gray-400 mt-0.5">Who can see this agent?</p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setForm({ ...form, isPublic: false })}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition border-2 ${
                  !form.isPublic
                    ? 'bg-gray-900 text-white border-gray-900'
                    : 'bg-white border-gray-200 text-gray-500'
                }`}
              >
                🔒 Private
              </button>
              <button
                type="button"
                onClick={() => setForm({ ...form, isPublic: true })}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition border-2 ${
                  form.isPublic
                    ? 'bg-gradient-to-r from-orange-400 to-pink-500 text-white border-transparent'
                    : 'bg-white border-gray-200 text-gray-500'
                }`}
              >
                🌐 Public
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600 text-white py-3 rounded-xl font-bold text-sm transition disabled:opacity-50 shadow-lg shadow-violet-200"
          >
            {loading ? 'Creating...' : 'Create Agent →'}
          </button>
        </form>
      </div>
    </div>
  );
}