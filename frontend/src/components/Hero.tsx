import { Sparkles, Plus, Search } from 'lucide-react';

export const Hero = () => {
  return (
    <div className="py-16 border-b-2 border-violet-100">
      <div className="max-w-5xl mx-auto text-center px-6">

        <div className="mb-6 inline-flex items-center gap-2 bg-gradient-to-r from-violet-500 to-pink-500 text-white text-xs font-bold px-5 py-2 rounded-full tracking-widest shadow-lg shadow-violet-200">
          <Sparkles size={12} /> PRIVATE BY DEFAULT • SHARE WHEN READY
        </div>

        <h1 className="text-5xl font-bold leading-tight mb-4 text-gray-900 tracking-tight">
          Your Personal Library<br />
          <span className="bg-gradient-to-r from-violet-500 to-pink-500 bg-clip-text text-transparent">
            of Domain Agents
          </span>
        </h1>

        <p className="text-base text-gray-500 max-w-2xl mx-auto mb-8 leading-relaxed">
          Create specialized AI experts that know <span className="font-bold text-gray-900">only</span> what you teach them.
          Keep them completely private — or share with others.
        </p>

        <div className="flex gap-4 justify-center">
          <button
            onClick={() => window.location.href = '/create-agent'}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600 text-white px-10 py-3.5 rounded-2xl font-bold text-sm transition-all shadow-lg shadow-violet-200"
          >
            <Plus size={16} /> Build Your Agent
          </button>
          <button className="inline-flex items-center gap-2 border-2 border-violet-400 text-violet-600 hover:bg-violet-50 px-10 py-3.5 rounded-2xl font-bold text-sm transition-all">
            <Search size={16} /> Browse Shared Agents
          </button>
        </div>
      </div>
    </div>
  );
};