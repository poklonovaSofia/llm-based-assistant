// src/components/Hero.tsx
export const Hero = () => {
  return (
    <div className="bg-[#2c1810] text-white py-28 relative overflow-hidden">
      <div className="max-w-5xl mx-auto text-center px-6">
        {/* Тег зверху */}
        <div className="mb-6 inline-flex items-center gap-3 bg-white/10 backdrop-blur-md px-6 py-2 rounded-full text-sm tracking-widest">
          PRIVATE BY DEFAULT • SHARE WHEN READY
        </div>

        <h1 className="text-7xl font-bold leading-none mb-6 tracking-tighter">
          Your Personal Library<br />
          of Domain Agents
        </h1>

        <p className="text-2xl text-[#f4d9b8] max-w-3xl mx-auto mb-12 leading-tight">
          Create specialized AI experts that know <span className="font-medium">only</span> what you teach them.<br />
          Keep them completely private - or share with others.
        </p>

        <div className="flex gap-5 justify-center">
          <button 
            onClick={() => window.location.href = '/create-agent'}
            className="bg-[#f4d9b8] hover:bg-white text-[#2c1810] px-14 py-5 rounded-2xl font-semibold text-lg transition-all shadow-xl"
          >
            Build Your Agent
          </button>
          <button className="border-2 border-[#f4d9b8] text-[#f4d9b8] hover:bg-white hover:text-[#2c1810] px-12 py-5 rounded-2xl font-medium text-lg transition-all">
            Browse Shared Agents
          </button>
        </div>
      </div>
    </div>
  );
};