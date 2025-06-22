import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark');
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [dark]);

  return (
    <nav className="flex justify-between p-4 bg-gray-800 text-white dark:bg-black">
      <Link to="/" className="font-bold">Disha-Mitra</Link>

      <div className="flex items-center space-x-4">
        <Link to="/dashboard" className="hover:underline">Dashboard</Link>
        <Link to="/aitools" className="hover:underline">AITools</Link>

        <button onClick={() => setDark(!dark)} className="border px-2 py-1 rounded">
          {dark ? '🌞' : '🌙'}
        </button>

        {user ? (
          <div className="relative">
            <button onClick={() => setShowProfile(!showProfile)} className="px-2 py-1 border rounded">
              {user.username}
            </button>
            {showProfile && (
              <div className="absolute right-0 mt-2 bg-white text-black rounded shadow-lg z-10">
                <button onClick={() => navigate('/profile')} className="block w-full px-4 py-2 hover:bg-gray-200">View Profile</button>
                <button onClick={() => { logout(); navigate('/login'); }} className="block w-full px-4 py-2 hover:bg-gray-200">Logout</button>
              </div>
            )}
          </div>
        ) : (
          <>
            <Link to="/login" className="hover:underline">Login</Link>
            <Link to="/signup" className="hover:underline">Signup</Link>
          </>
        )}
      </div>
    </nav>
  );
}
