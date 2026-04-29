import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Plus, Globe, Lock, ArrowRight, MessageCircle, Pencil, Trash2, FileText } from 'lucide-react';

interface Agent {
  id: number;
  name: string;
  description: string;
  isPublic: boolean;
  creatorEmail: string;
  createdAt: string;
}

export default function MyAgents() {
  const navigate = useNavigate();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [agentDocuments, setAgentDocuments] = useState<Record<number, string[]>>({});
  const [expandedAgent, setExpandedAgent] = useState<number | null>(null);

  const fetchDocuments = async (agentId: number) => {
    if (expandedAgent === agentId) {
      setExpandedAgent(null);
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8080/api/documents/${agentId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setAgentDocuments(prev => ({ ...prev, [agentId]: data }));
        setExpandedAgent(agentId);
      }
    } catch {
      // ignore
    }
  };

  const deleteDocument = async (agentId: number, filename: string) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:8080/api/documents/${agentId}/${filename}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      setAgentDocuments(prev => ({
        ...prev,
        [agentId]: prev[agentId].filter(f => f !== filename),
      }));
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/signin');
          return;
        }

        const response = await fetch('http://localhost:8080/api/agents/my', {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (!response.ok) throw new Error('Failed to fetch agents');

        const data = await response.json();
        setAgents(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAgents();
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">

      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-500 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full mb-2">
            <Sparkles size={12} /> MY LIBRARY
          </div>
          <h1 className="text-2xl font-bold text-gray-900">My Agents</h1>
          <p className="text-sm text-gray-400 mt-1">Your private knowledge library</p>
        </div>
        <button
          onClick={() => navigate('/create-agent')}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-500 to-pink-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:from-violet-600 hover:to-pink-600 transition shadow-lg shadow-violet-200"
        >
          <Plus size={15} /> New Agent
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border-2 border-red-300 text-red-600 px-4 py-3 rounded-xl mb-6 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-20 text-gray-400 text-sm">Loading...</div>
      ) : agents.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-violet-200 rounded-2xl">
          <p className="text-gray-400 text-sm mb-4">No agents yet</p>
          <button
            onClick={() => navigate('/create-agent')}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-500 to-pink-500 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition shadow-lg shadow-violet-200"
          >
            <Plus size={15} /> Create your first agent
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {agents.map((agent) => (
            <div
              key={agent.id}
              className="bg-white border-2 border-gray-100 hover:border-violet-300 rounded-2xl p-5 cursor-pointer transition-all hover:shadow-lg hover:shadow-violet-100 group"
              onClick={() => navigate(`/chat/${agent.id}`)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-pink-500 flex-shrink-0" />
                <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${
                  agent.isPublic
                    ? 'bg-orange-100 text-orange-600'
                    : 'bg-gray-100 text-gray-500'
                }`}>
                  {agent.isPublic ? <><Globe size={11} /> Public</> : <><Lock size={11} /> Private</>}
                </span>
              </div>
              <h3 className="font-bold text-gray-900 group-hover:text-violet-500 transition-colors">
                {agent.name}
              </h3>
              {agent.description && (
                <p className="text-xs text-gray-400 mt-1 line-clamp-2">{agent.description}</p>
              )}
              <div className="flex items-center gap-3 mt-4">
                <button
                  onClick={(e) => { e.stopPropagation(); navigate(`/agent/${agent.id}`); }}
                  className="inline-flex items-center gap-1 text-xs font-bold text-violet-500 hover:text-violet-700 transition"
                >
                  <Pencil size={12} /> Edit
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); navigate(`/chat/${agent.id}`); }}
                  className="inline-flex items-center gap-1 text-xs font-bold text-pink-500 hover:text-pink-700 transition"
                >
                  <MessageCircle size={12} /> Chat
                </button>
              </div>

              {expandedAgent === agent.id && (
                <div className="mt-3 border-t border-gray-100 pt-3 space-y-2">
                  {agentDocuments[agent.id]?.length === 0 ? (
                    <p className="text-xs text-gray-400">No documents yet</p>
                  ) : (
                    agentDocuments[agent.id]?.map((filename) => (
                      <div key={filename} className="flex items-center justify-between">
                        <span className="inline-flex items-center gap-1 text-xs text-gray-600 truncate">
                          <FileText size={11} className="flex-shrink-0 text-gray-400" />
                          {filename}
                        </span>
                        <button
                          onClick={(e) => { e.stopPropagation(); deleteDocument(agent.id, filename); }}
                          className="inline-flex items-center gap-1 text-xs text-red-400 hover:text-red-600 transition ml-2 flex-shrink-0"
                        >
                          <Trash2 size={12} /> Delete
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}