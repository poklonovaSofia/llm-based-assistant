// Navbar.tsx
import { Link, useNavigate } from 'react-router-dom';

export const Navbar = () => {
  const navigate = useNavigate();
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/signin');
  };

  return (
    <nav className="bg-white border-b-2 border-violet-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

        <Link to="/" className="text-xl font-bold bg-gradient-to-r from-violet-500 to-pink-500 bg-clip-text text-transparent">
          Librex
        </Link>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Link
                to="/my-agents"
                className="text-sm font-bold text-gray-600 hover:text-violet-500 transition"
              >
                My Agents
              </Link>
              <div className="flex items-center gap-3 bg-violet-50 border-2 border-violet-200 px-4 py-2 rounded-2xl">
                <div className="w-6 h-6 bg-gradient-to-r from-violet-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {user.fullName?.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium text-gray-700">{user.fullName}</span>
                <button
                  onClick={handleLogout}
                  className="text-xs text-gray-400 hover:text-red-500 transition ml-1"
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <Link
                to="/create-account"
                className="text-sm font-bold text-gray-600 hover:text-violet-500 transition"
              >
                Sign Up
              </Link>
              <Link
                to="/signin"
                className="bg-gradient-to-r from-violet-500 to-pink-500 text-white px-6 py-2.5 rounded-2xl text-sm font-bold hover:from-violet-600 hover:to-pink-600 transition shadow-lg shadow-violet-200"
              >
                Sign In
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};