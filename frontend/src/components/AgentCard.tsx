import { useNavigate } from 'react-router-dom';

interface AgentCardProps {
  id: number;
  name: string;
  description: string;
}

export const AgentCard = ({ id, name, description }: AgentCardProps) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/chat/${id}`)}
      className="group cursor-pointer bg-white rounded-2xl border-2 border-gray-100 hover:border-violet-300 hover:shadow-lg hover:shadow-violet-100 transition-all duration-300 p-4 flex items-center gap-4"
    >
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-pink-500 flex-shrink-0 group-hover:scale-110 transition-transform duration-300" />
      <div>
        <h3 className="font-bold text-gray-900 text-sm group-hover:text-violet-500 transition-colors">{name}</h3>
        <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{description}</p>
      </div>
    </div>
  );
};