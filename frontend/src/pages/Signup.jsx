// Signup.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Signup() {
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
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
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-sm mx-auto mt-10 space-y-4">
      <input type="text" placeholder="Username" value={form.username}
        onChange={(e) => setForm({ ...form, username: e.target.value })} className="w-full border p-2" />
      <input type="email" placeholder="Email" value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full border p-2" />
      <input type="password" placeholder="Password" value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full border p-2" />
      <button type="submit" className="w-full bg-blue-500 text-white p-2">Sign Up</button>
    </form>
  );
}
