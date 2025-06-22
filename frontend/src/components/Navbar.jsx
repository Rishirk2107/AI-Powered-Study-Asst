import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useState } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { dark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [showProfile, setShowProfile] = useState(false);

  const handleThemeToggle = () => {
    console.log('Navbar: Theme toggle clicked, current theme:', dark ? 'dark' : 'light');
    toggleTheme();
  };

  return (
    <nav className="flex justify-between p-4 bg-white dark:bg-gray-800 text-gray-800 dark:text-white shadow-md transition-colors duration-200">
      <Link to="/" className="font-bold text-xl">Disha-Mitra</Link>

      <div className="flex items-center space-x-4">
        <Link to="/" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">About</Link>
        {user && (
          <>
            <Link to="/dashboard" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Dashboard</Link>
            <Link to="/schedule" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Schedule</Link>
            <Link to="/aitools" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">AITools</Link>
          </>
        )}

        <button 
          onClick={handleThemeToggle} 
          className="border border-gray-300 dark:border-gray-600 px-3 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label="Toggle theme"
        >
          {dark ? '🌞' : '🌙'}
        </button>

        {user ? (
          <div className="relative">
            <button 
              onClick={() => setShowProfile(!showProfile)} 
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              {user.username}
            </button>
            {showProfile && (
              <div className="absolute right-0 mt-2 bg-white dark:bg-gray-800 text-gray-800 dark:text-white rounded-lg shadow-lg z-10 border border-gray-200 dark:border-gray-600">
                <button 
                  onClick={() => navigate('/profile')} 
                  className="block w-full px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-left transition-colors"
                >
                  View Profile
                </button>
                <button 
                  onClick={() => { logout(); navigate('/login'); }} 
                  className="block w-full px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-left transition-colors"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <Link to="/login" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Login</Link>
            <Link to="/signup" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Signup</Link>
          </>
        )}
      </div>
    </nav>
  );
}
