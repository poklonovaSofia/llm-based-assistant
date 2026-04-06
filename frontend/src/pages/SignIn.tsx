// src/pages/SignIn.tsx
import { Link } from 'react-router-dom';

export default function SignIn() {
  return (
    <div className="min-h-screen bg-[#f8f1e9] flex items-center justify-center px-6 py-12">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-10">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-[#2c1810] rounded-2xl mx-auto flex items-center justify-center text-white text-4xl mb-4">🤖</div>
          <h1 className="text-4xl font-bold text-[#2c1810]">Welcome back</h1>
          <p className="text-gray-600 mt-3">Sign in to your personal agent library</p>
        </div>

        <form className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input 
              type="email" 
              className="w-full px-6 py-4 border border-gray-300 rounded-2xl focus:outline-none focus:border-[#2c1810] text-lg" 
              placeholder="you@email.com" 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input 
              type="password" 
              className="w-full px-6 py-4 border border-gray-300 rounded-2xl focus:outline-none focus:border-[#2c1810] text-lg" 
              placeholder="••••••••" 
            />
          </div>

          <button 
            type="submit" 
            className="w-full bg-[#2c1810] text-white py-4 rounded-2xl font-semibold text-lg hover:bg-[#1f120b] transition"
          >
            Sign In
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-8">
          Don't have an account?{' '}
          <Link to="/create-account" className="text-[#c47d3a] font-medium hover:underline">
            Create one for free
          </Link>
        </p>
      </div>
    </div>
  );
}