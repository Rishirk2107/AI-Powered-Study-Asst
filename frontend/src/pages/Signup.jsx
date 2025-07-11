// Signup.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Signup() {
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
    const res = await fetch('http://localhost:5000/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    const data = await res.json();
    if (res.ok) {
      login(data.user, data.token);
      navigate('/dashboard');
    } else {
      alert(data.error);
      }
    } catch (error) {
      alert('Signup failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-white mb-8">Create Account</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Username
              </label>
              <input 
                type="text" 
                placeholder="Enter your username"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })} 
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <input 
                type="email" 
                placeholder="Enter your email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })} 
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <input 
                type="password" 
                placeholder="Enter your password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })} 
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
                required
              />
            </div>
            
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3 rounded-lg font-medium transition-colors duration-200"
            >
              {isLoading ? 'Creating account...' : 'Create Account'}
            </button>
    </form>
          
          <p className="mt-6 text-center text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <button 
              onClick={() => navigate('/login')}
              className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
