import { useNavigate } from 'react-router-dom';

export const AgentCard = ({ id, name, domain }: any) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/chat/${id}`)}
      className="group cursor-pointer bg-white rounded-2xl border-2 border-gray-100 hover:border-violet-300 hover:shadow-lg hover:shadow-violet-100 transition-all duration-300 p-4 flex items-center gap-4"
    >
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-pink-500 flex-shrink-0 group-hover:scale-110 transition-transform duration-300" />
      <div>
        <p className="text-xs font-bold text-violet-400 uppercase tracking-wider mb-0.5">{domain}</p>
        <h3 className="font-bold text-gray-900 text-sm group-hover:text-violet-500 transition-colors">{name}</h3>
      </div>
    </div>
  );
};