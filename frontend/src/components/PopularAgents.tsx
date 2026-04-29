import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { AgentCard } from './AgentCard';

interface Agent {
  id: number;
  name: string;
  description: string;
  isPublic: boolean;
  creatorEmail: string;
  createdAt: string;
  updatedAt: string;
}

export const PopularAgents = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const perPage = 3;

  useEffect(() => {
    fetch('http://localhost:8080/api/agents/public')
      .then((res) => res.json())
      .then((data) => setAgents(data))
      .catch((err) => console.error('Failed to fetch public agents:', err))
      .finally(() => setLoading(false));
  }, []);

  const totalPages = Math.ceil(agents.length / perPage);
  const visible = agents.slice(page * perPage, page * perPage + perPage);

  const prev = () => setPage((p) => (p - 1 + totalPages) % totalPages);
  const next = () => setPage((p) => (p + 1) % totalPages);

  if (loading) {
    return (
      <div className="grid grid-cols-3 gap-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-40 rounded-2xl bg-violet-50 animate-pulse" />
        ))}
      </div>
    );
  }

  if (agents.length === 0) {
    return (
      <p className="text-center text-gray-400 text-sm py-12">No public agents yet.</p>
    );
  }

  return (
    <div className="relative">
      <div className="grid grid-cols-3 gap-3">
        {visible.map((agent) => (
          <AgentCard key={agent.id} id={agent.id} name={agent.name} description={agent.description} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-6">
          <button
            onClick={prev}
            className="w-9 h-9 rounded-full border-2 border-violet-200 flex items-center justify-center text-violet-500 hover:bg-violet-50 transition"
          >
            <ChevronLeft size={16} />
          </button>

          <div className="flex gap-2">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i)}
                className={`h-2 rounded-full transition-all ${
                  i === page ? 'bg-violet-500 w-5' : 'bg-gray-300 w-2'
                }`}
              />
            ))}
          </div>

          <button
            onClick={next}
            className="w-9 h-9 rounded-full border-2 border-violet-200 flex items-center justify-center text-violet-500 hover:bg-violet-50 transition"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
};