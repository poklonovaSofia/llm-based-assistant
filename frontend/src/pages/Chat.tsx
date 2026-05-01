import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Send, Sparkles } from 'lucide-react';

interface Message {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface Agent {
  id: number;
  name: string;
  description: string;
}

export default function Chat() {
  const { agentId } = useParams();
  const navigate = useNavigate();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [agentLoading, setAgentLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const fetchAgent = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/agents/${agentId}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setAgent(data);
        }
      } catch {
        // fallback — show agent id
      } finally {
        setAgentLoading(false);
      }
    };
    fetchAgent();
  }, [agentId]);
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/chat/${agentId}/history`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          if (data.length > 0) {
            const loaded: Message[] = data.flatMap((m: any) => [
              {
                id: m.id,
                role: 'user' as const,
                content: m.question,
                timestamp: new Date(m.createdAt),
              },
              {
                id: m.id + 0.5,
                role: 'assistant' as const,
                content: m.answer,
                timestamp: new Date(m.createdAt),
              },
            ]);
            setMessages(loaded);
          } else {
            setMessages([
              {
                id: 1,
                role: 'assistant',
                content: 'Ahoj! Som váš špecializovaný agent. Opýtajte sa ma čokoľvek na základe nahratých dokumentov.',
                timestamp: new Date(),
              },
              {
                id: 2,
                role: 'user',
                content: 'Aké sú vedľajšie účinky lieku Noliprel?',
                timestamp: new Date(),
              },
              {
                id: 3,
                role: 'assistant',
                content: 'Podľa dokumentácie, medzi časté vedľajšie účinky Noliprelu patrí suchý kašeľ, bolesti hlavy a závraty.',
                timestamp: new Date(),
              },
            ]);
          }
        }
      } catch {
        // ignore
      }
    };
    fetchHistory();
  }, [agentId]);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');

      // POST to Spring which proxies to LangChain /ask
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/chat/${agentId}/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ question: userMessage.content }),
      });

      const data = await response.json();

      const assistantMessage: Message = {
        id: Date.now() + 1,
        role: 'assistant',
        content: data.answer,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch {
      const errorMessage: Message = {
        id: Date.now() + 1,
        role: 'assistant',
        content: 'Sorry, something went wrong. Please try again.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (date: Date) =>
    date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="flex flex-col h-[calc(100vh-74px)] bg-gradient-to-br from-violet-50 via-white to-pink-50">

      {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-4 shadow-sm">
          <button
            onClick={() => navigate('/my-agents')}
            className="inline-flex items-center gap-1 text-gray-400 hover:text-violet-500 transition text-sm font-bold"
          >
            <ArrowLeft size={15} /> Back
          </button>
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-pink-500 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          {agentLoading ? (
            <div className="h-4 w-32 bg-gray-100 rounded animate-pulse" />
          ) : (
            <>
              <h1 className="font-bold text-gray-900 truncate">
                {agent?.name ?? `Agent #${agentId}`}
              </h1>
              {agent?.description && (
                <p className="text-xs text-gray-400 truncate">{agent.description}</p>
              )}
            </>
          )}
        </div>
        <button
          onClick={() => navigate(`/upload/${agentId}`, { state: { agentName: agent?.name, isEditing: true } })}
          className="inline-flex items-center gap-1 text-xs font-bold text-violet-500 hover:text-violet-700 transition border-2 border-violet-200 hover:border-violet-400 px-3 py-1.5 rounded-lg"
        >
          <Plus size={12} /> Add docs
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-pink-500 mb-4 flex items-center justify-center">
                <Sparkles className="text-white" size={28} />
              </div>
              <h2 className="text-lg font-bold text-gray-900 mb-1">
                {agent?.name ?? `Agent #${agentId}`}
              </h2>
              <p className="text-sm text-gray-400 max-w-xs">
                Ask anything based on this agent's documents.
              </p>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.role === 'assistant' && (
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-pink-500 flex-shrink-0 mr-2 mt-1" />
              )}
              <div className={`max-w-[75%] ${message.role === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                <div
                  className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                    message.role === 'user'
                      ? 'bg-gradient-to-br from-violet-500 to-pink-500 text-white rounded-br-sm'
                      : 'bg-white border-2 border-gray-100 text-gray-800 rounded-bl-sm shadow-sm'
                  }`}
                >
                  {message.content}
                </div>
                <span className="text-xs text-gray-300 px-1">
                  {formatTime(message.timestamp)}
                </span>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-pink-500 flex-shrink-0 mr-2 mt-1" />
              <div className="bg-white border-2 border-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                <div className="flex gap-1 items-center h-4">
                  <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-100 px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-end gap-3">
          <div className="flex-1 border-2 border-gray-200 focus-within:border-violet-400 rounded-2xl transition-colors bg-white overflow-hidden">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question..."
              rows={1}
              className="w-full px-4 py-3 text-sm text-gray-800 placeholder-gray-400 resize-none outline-none max-h-40 bg-transparent"
            />
          </div>
          <button
            onClick={sendMessage}
            disabled={!input.trim() || loading}
            className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-500 to-pink-500 text-white flex items-center justify-center flex-shrink-0 hover:from-violet-600 hover:to-pink-600 transition disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-violet-200"
          >
            <Send size={16} />
          </button>
        </div>
        <p className="text-center text-xs text-gray-300 mt-2">
          Press Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}