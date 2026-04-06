// src/pages/Home.tsx
import { Hero } from '../components/Hero';
import { PopularAgents } from '../components/PopularAgents';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#f8f1e9] font-serif">
      <Hero />

      <div className="max-w-7xl mx-auto px-6 py-12">
        <h2 className="text-4xl font-bold text-[#2c1810] mb-8">
          Popular Domain Agents
        </h2>
        <PopularAgents />
      </div>
    </div>
  );
}