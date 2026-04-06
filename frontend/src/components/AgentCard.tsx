// src/components/AgentCard.tsx
import { useNavigate } from 'react-router-dom';

export const AgentCard = ({ id, name, domain, icon }: any) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/chat/${id}`)}
      className="bg-white rounded-3xl shadow-md hover:shadow-2xl transition-all cursor-pointer overflow-hidden group"
    >
      <div className="h-48 bg-gradient-to-br from-[#f4d9b8] to-[#e8c9a0] flex items-center justify-center text-7xl">
        {icon}
      </div>
      <div className="p-6">
        <h3 className="font-bold text-xl text-[#2c1810] mb-1">{name}</h3>
        <p className="text-sm text-gray-600">{domain}</p>
      </div>
    </div>
  );
};