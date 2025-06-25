import { useTheme } from '../context/ThemeContext';

export default function ThemeTest() {
  const { dark, toggleTheme } = useTheme();

  return (
    <div className="fixed top-20 right-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
      <h3 className="text-sm font-bold text-gray-800 dark:text-white mb-2">Theme Debug</h3>
      <p className="text-xs text-gray-600 dark:text-gray-300 mb-2">
        Current: {dark ? 'Dark' : 'Light'}
      </p>
      <button 
        onClick={toggleTheme}
        className="text-xs bg-blue-600 text-white px-2 py-1 rounded"
      >
        Toggle
      </button>
    </div>
  );
} 