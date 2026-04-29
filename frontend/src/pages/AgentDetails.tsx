import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Sparkles, ArrowLeft, Pencil, Trash2, Lock, Globe,
  FileText, Plus, MessageCircle, ArrowRight, X, Save
} from 'lucide-react';

interface Agent {
  id: number;
  name: string;
  description: string;
  isPublic: boolean;
}

export default function AgentDetails() {
  const { agentId } = useParams();
  const navigate = useNavigate();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [documents, setDocuments] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', isPublic: false });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [agentRes, docsRes] = await Promise.all([
          fetch(`http://localhost:8080/api/agents/${agentId}`, {
            headers: { 'Authorization': `Bearer ${token}` },
          }),
          fetch(`http://localhost:8080/api/documents/${agentId}`, {
            headers: { 'Authorization': `Bearer ${token}` },
          }),
        ]);

        if (agentRes.ok) {
          const data = await agentRes.json();
          setAgent(data);
          setForm({ name: data.name, description: data.description || '', isPublic: data.isPublic });
        }
        if (docsRes.ok) {
          const docs = await docsRes.json();
          setDocuments(docs);
        }
      } catch {
        setError('Failed to load agent');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [agentId]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(`http://localhost:8080/api/agents/${agentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      if (response.ok) {
        const updated = await response.json();
        setAgent(updated);
        setEditing(false);
      }
    } catch {
      setError('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this agent?')) return;
    try {
      await fetch(`http://localhost:8080/api/agents/${agentId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      navigate('/my-agents');
    } catch {
      setError('Failed to delete');
    }
  };

  const handleDeleteDoc = async (filename: string) => {
    try {
      await fetch(`http://localhost:8080/api/documents/${agentId}/${filename}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      setDocuments(prev => prev.filter(f => f !== filename));
    } catch {
      setError('Failed to delete document');
    }
  };

  if (loading) return <div className="text-center py-20 text-gray-400 text-sm">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">

      <button
        onClick={() => navigate('/my-agents')}
        className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-violet-500 font-bold transition mb-6"
      >
        <ArrowLeft size={15} /> Back to My Agents
      </button>

      {error && (
        <div className="bg-red-50 border-2 border-red-300 text-red-600 px-4 py-3 rounded-xl mb-6 text-sm">
          {error}
        </div>
      )}

      {/* Agent Info */}
      <div className="bg-white border-2 border-gray-100 rounded-2xl p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-500 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full">
            <Sparkles size={12} /> AGENT INFO
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setEditing(!editing)}
              className="inline-flex items-center gap-1 text-xs font-bold text-violet-500 hover:text-violet-700 border-2 border-violet-200 hover:border-violet-400 px-3 py-1.5 rounded-lg transition"
            >
              {editing ? <><X size={12} /> Cancel</> : <><Pencil size={12} /> Edit</>}
            </button>
            <button
              onClick={handleDelete}
              className="inline-flex items-center gap-1 text-xs font-bold text-red-400 hover:text-red-600 border-2 border-red-200 hover:border-red-400 px-3 py-1.5 rounded-lg transition"
            >
              <Trash2 size={12} /> Delete
            </button>
          </div>
        </div>

        {editing ? (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1 uppercase tracking-wider">Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-violet-400 text-sm transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1 uppercase tracking-wider">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-violet-400 text-sm h-24 resize-none transition-colors"
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
                  className={`inline-flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-bold transition border-2 ${
                    !form.isPublic ? 'bg-gray-900 text-white border-gray-900' : 'bg-white border-gray-200 text-gray-500'
                  }`}
                >
                  <Lock size={11} /> Private
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, isPublic: true })}
                  className={`inline-flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-bold transition border-2 ${
                    form.isPublic ? 'bg-gradient-to-r from-orange-400 to-pink-500 text-white border-transparent' : 'bg-white border-gray-200 text-gray-500'
                  }`}
                >
                  <Globe size={11} /> Public
                </button>
              </div>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 w-full bg-gradient-to-r from-violet-500 to-pink-500 text-white py-2.5 rounded-xl font-bold text-sm transition disabled:opacity-50 shadow-lg shadow-violet-200"
            >
              <Save size={15} /> {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider font-bold mb-1">Name</p>
              <p className="font-bold text-gray-900">{agent?.name}</p>
            </div>
            {agent?.description && (
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider font-bold mb-1">Description</p>
                <p className="text-sm text-gray-600">{agent.description}</p>
              </div>
            )}
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider font-bold mb-1">Visibility</p>
              <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${
                agent?.isPublic ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-500'
              }`}>
                {agent?.isPublic ? <><Globe size={11} /> Public</> : <><Lock size={11} /> Private</>}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Documents */}
      <div className="bg-white border-2 border-gray-100 rounded-2xl p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-500 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full">
            <Sparkles size={12} /> DOCUMENTS
          </div>
          <button
            onClick={() => navigate(`/upload/${agentId}`, { state: { agentName: agent?.name, isEditing: true } })}
            className="inline-flex items-center gap-1 text-xs font-bold text-violet-500 hover:text-violet-700 border-2 border-violet-200 hover:border-violet-400 px-3 py-1.5 rounded-lg transition"
          >
            <Plus size={12} /> Add docs
          </button>
        </div>

        {documents.length === 0 ? (
          <p className="text-sm text-gray-400">No documents yet</p>
        ) : (
          <div className="space-y-2">
            {documents.map((filename) => (
              <div key={filename} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <span className="inline-flex items-center gap-1.5 text-sm text-gray-700 truncate">
                  <FileText size={13} className="text-gray-400 flex-shrink-0" />
                  {filename}
                </span>
                <button
                  onClick={() => handleDeleteDoc(filename)}
                  className="inline-flex items-center gap-1 text-xs text-red-400 hover:text-red-600 transition ml-2 flex-shrink-0 font-bold"
                >
                  <Trash2 size={12} /> Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <button
        onClick={() => navigate(`/chat/${agentId}`)}
        className="inline-flex items-center justify-center gap-2 w-full bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600 text-white py-3 rounded-xl font-bold text-sm transition shadow-lg shadow-violet-200"
      >
        <MessageCircle size={15} /> Open Chat <ArrowRight size={15} />
      </button>
    </div>
  );
}