// src/components/PopularAgents.tsx
import { AgentCard } from './AgentCard';

const agents = [
  { id: 1, name: "Sinupret Assistant", domain: "Medicine", icon: "💊" },
  { id: 2, name: "Tax Law Expert", domain: "Law", icon: "📜" },
  { id: 3, name: "Diabetes Coach", domain: "Healthcare", icon: "🩸" },
  { id: 4, name: "Contract Analyzer", domain: "Business", icon: "📄" },
  { id: 5, name: "Cybersecurity Advisor", domain: "IT Security", icon: "🔒" },
];

export const PopularAgents = () => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
      {agents.map((agent) => (
        <AgentCard key={agent.id} {...agent} />
      ))}
    </div>
  );
};