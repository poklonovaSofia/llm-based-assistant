import { useState } from 'react';
import { AgentCard } from './AgentCard';

const agents = [
  { id: 1, name: "Sinupret Assistant", domain: "Medicine" },
  { id: 2, name: "Tax Law Expert", domain: "Law" },
  { id: 3, name: "Diabetes Coach", domain: "Healthcare" },
  { id: 4, name: "Contract Analyzer", domain: "Business" },
  { id: 5, name: "Cybersecurity Advisor", domain: "IT Security" },
  { id: 6, name: "Pregabalin Expert", domain: "Medicine" },
  { id: 7, name: "GDPR Assistant", domain: "Law" },
];

export const PopularAgents = () => {
  const [page, setPage] = useState(0);
  const perPage = 3;
  const totalPages = Math.ceil(agents.length / perPage);
  const visible = agents.slice(page * perPage, page * perPage + perPage);

  const prev = () => setPage((p) => (p - 1 + totalPages) % totalPages);
  const next = () => setPage((p) => (p + 1) % totalPages);

  return (
    <div className="relative">
      <div className="grid grid-cols-3 gap-3">
        {visible.map((agent) => (
          <AgentCard key={agent.id} {...agent} />
        ))}
      </div>

      <div className="flex items-center justify-center gap-4 mt-6">
        <button
          onClick={prev}
          className="w-9 h-9 rounded-full border-2 border-violet-200 flex items-center justify-center text-violet-500 hover:bg-violet-50 transition"
        >
          ←
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
          →
        </button>
      </div>
    </div>
  );
};