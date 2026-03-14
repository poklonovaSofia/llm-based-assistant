// src/App.tsx
import React from 'react';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F4F1EA] text-gray-800 font-sans">
      {/* Navbar */}
      <nav className="flex justify-between items-center px-12 py-6">
        <div className="text-2xl font-bold tracking-tight">RAG.bot</div>
        <div className="flex gap-8 items-center">
          <a href="#" className="hover:opacity-60 transition">About Project</a>
          <button className="bg-white px-6 py-2 rounded-full shadow-sm border border-gray-100 hover:shadow-md transition">
            Sign In
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-12 mt-12">
        <header className="mb-12">
          <h1 className="text-5xl font-extrabold mb-4">Thematic RAG Agents</h1>
          <p className="text-lg text-gray-500 max-w-2xl">
            Welcome to my bachelor project. Create custom AI agents with specific medical knowledge, 
            evaluate them using RAGAS, and compare performance in a beautiful interface.
          </p>
        </header>

        {/* Bento Grid with Agents */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Велика картка - Популярне / Опис */}
          <div className="md:col-span-2 bg-white rounded-[32px] p-8 shadow-sm border border-gray-50">
            <h2 className="text-2xl font-bold mb-6">Your AI Library</h2>
            <div className="flex gap-4 overflow-x-auto pb-4">
              {['Cardiology', 'Sinupret', 'Dermatology'].map((agent) => (
                <div key={agent} className="min-w-[150px] aspect-[3/4] bg-[#F9F8F4] rounded-2xl flex flex-col items-center justify-center border border-dashed border-gray-300 hover:border-[#9B86BD] cursor-pointer transition">
                   <div className="w-16 h-16 bg-[#E8E4D9] rounded-full mb-4" /> {/* Тут буде іконка робота */}
                   <span className="font-medium">{agent}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Права картка - Статистика або Швидкий старт */}
          <div className="bg-[#9B86BD] text-white rounded-[32px] p-8 flex flex-col justify-between">
            <h2 className="text-xl font-medium uppercase tracking-widest text-purple-200">New Agent</h2>
            <p className="text-3xl font-bold leading-tight">Create your first specialized RAG agent today.</p>
            <button className="bg-white text-[#9B86BD] w-12 h-12 rounded-full flex items-center justify-center text-2xl font-bold">
              +
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;