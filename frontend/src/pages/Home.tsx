// Home.tsx
import { Hero } from '../components/Hero';
import { PopularAgents } from '../components/PopularAgents';

export default function Home() {
  return (
    <div className="bg-gradient-to-br from-violet-50 via-white to-pink-50 font-serif">
      <Hero />
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-500 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full mb-2">
              ✦ POPULAR
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Popular Domain Agents</h2>
            <p className="text-sm text-gray-400 mt-1">Shared by the community</p>
          </div>
          <button className="text-sm font-bold text-violet-500 hover:text-pink-500 transition-colors">
            View all →
          </button>
        </div>
        <PopularAgents />
      </div>
    </div>
  );
}