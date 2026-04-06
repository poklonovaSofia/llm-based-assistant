// src/pages/Chat.tsx
import { useParams } from 'react-router-dom';

export default function Chat() {
  const { agentId } = useParams();

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Chat with Agent #{agentId}</h1>
      <p className="text-gray-600">Тут буде чат з агентом. Поки що заглушка.</p>
    </div>
  );
}