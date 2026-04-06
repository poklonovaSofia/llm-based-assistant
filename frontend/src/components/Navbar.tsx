// src/components/Navbar.tsx
import { Link } from 'react-router-dom';

export const Navbar = () => {
  return (
    <nav className="bg-white border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#2c1810] rounded-2xl flex items-center justify-center text-white text-2xl">🤖</div>
          <span className="text-2xl font-bold text-[#2c1810]">LibraryAI</span>
        </div>

        <div className="flex items-center gap-8 text-lg">
          <a href="#" className="hover:text-[#c47d3a]">How it works</a>
          <a href="#" className="hover:text-[#c47d3a]">Pricing</a>
          <a href="#" className="hover:text-[#c47d3a]">Docs</a>
        </div>

        <Link 
          to="/signin"
          className="bg-[#2c1810] text-white px-8 py-3 rounded-2xl font-medium hover:bg-[#1f120b] transition"
        >
          Sign In
        </Link>
      </div>
    </nav>
  );
};