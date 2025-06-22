import { Routes, Route } from 'react-router-dom';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import SchedulePage from './pages/SchedulePage';
import About from './pages/About';
import PrivateRoute from './utils/PrivateRoute';
import Navbar from './components/Navbar';
import AITools from './pages/AITools';
import QAChatbot from './pages/QAChatbot';
import AIQuiz from './pages/AIQuiz';

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <Navbar />
      <Routes>
        <Route path="/" element={<About />} />
        <Route path="/about" element={<About />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route element={<PrivateRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/schedule" element={<SchedulePage />} />
          <Route path="/aitools" element={<AITools />} />
          <Route path="/aitools/chatbot" element={<QAChatbot />} />
          <Route path="/aitools/quiz" element={<AIQuiz />} />
        </Route>
      </Routes>
    </div>
  );
}
