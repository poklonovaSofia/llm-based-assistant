import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

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
            ✦ MY LIBRARY
          </div>
          <h1 className="text-2xl font-bold text-gray-900">My Agents</h1>
          <p className="text-sm text-gray-400 mt-1">Your private knowledge library</p>
        </div>
        <button
          onClick={() => navigate('/create-agent')}
          className="bg-gradient-to-r from-violet-500 to-pink-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:from-violet-600 hover:to-pink-600 transition shadow-lg shadow-violet-200"
        >
          + New Agent
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
            className="bg-gradient-to-r from-violet-500 to-pink-500 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition shadow-lg shadow-violet-200"
          >
            Create your first agent
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
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                  agent.isPublic
                    ? 'bg-orange-100 text-orange-600'
                    : 'bg-gray-100 text-gray-500'
                }`}>
                  {agent.isPublic ? '🌐 Public' : '🔒 Private'}
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
                  onClick={(e) => { e.stopPropagation(); navigate(`/upload/${agent.id}`); }}
                  className="text-xs font-bold text-violet-500 hover:text-violet-700 transition"
                >
                  + Add docs
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); navigate(`/chat/${agent.id}`); }}
                  className="text-xs font-bold text-pink-500 hover:text-pink-700 transition"
                >
                  Chat →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}