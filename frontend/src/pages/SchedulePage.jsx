import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Calendar from 'react-calendar';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import '../styles/calendar.css';
import { apiGet, apiPost, apiPut } from '../utils/api';
 

export default function SchedulePage() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [schedule, setSchedule] = useState([]);
  const [value, setValue] = useState(new Date());
  const [topicsOnDate, setTopicsOnDate] = useState([]);
  const [userMessage, setUserMessage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedSchedule, setGeneratedSchedule] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await apiGet('/schedule');
        setSchedule(data);
      } catch (error) {
        console.error('Failed to load schedule:', error);
      }
    };
    load();
  }, [token]);

  const handleDayClick = (date) => {
    const matched = schedule.filter(item => {
      const itemDate = new Date(item.date);
      return (
        itemDate.getFullYear() === date.getFullYear() &&
        itemDate.getMonth() === date.getMonth() &&
        itemDate.getDate() === date.getDate()
      );
    });
    setTopicsOnDate(matched);
    setValue(date);
  };

  const handleGenerateSchedule = async (e) => {
    e.preventDefault();
    if (!userMessage.trim()) {
      toast.error('Please enter your study requirements');
      return;
    }

    setIsGenerating(true);
    try {
      try {
        const data = await apiPost('/schedule/generate', { userMessage });
        setGeneratedSchedule(data.schedule);
        const updatedData = await apiGet('/schedule');
        setSchedule(updatedData);
        setUserMessage('');
        toast.success('Schedule generated successfully!');
      } catch (error) {
        toast.error('Error generating schedule: ' + (error?.response?.data?.error || error.message));
      }
    } catch (error) {
      console.error('Error generating schedule:', error);
      toast.error('Failed to generate schedule. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

   // Mark a schedule entry as completed or not
  const handleMarkCompleted = async (id, completed) => {
    try {
      await apiPut(`/schedule/${id}/completed`, { completed });
      // Refresh schedule after update
      const updatedData = await apiGet('/schedule');
      setSchedule(updatedData);
      // Also update topicsOnDate if open
      setTopicsOnDate(updatedData.filter(item => {
        const itemDate = new Date(item.date);
        return (
          itemDate.getFullYear() === value.getFullYear() &&
          itemDate.getMonth() === value.getMonth() &&
          itemDate.getDate() === value.getDate()
        );
      }));
    } catch (error) {
      toast.error('Failed to update task status.');
    }
  };

  const handleStudy = (id) => {
    navigate(`/topic/${id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="p-8">
        <h2 className="text-4xl font-bold mb-8 text-gray-800 dark:text-white">Study Schedule</h2>

        {/* AI Schedule Generation Form */}
        <div className="mb-8 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-white">AI Schedule Generator</h3>
          <form onSubmit={handleGenerateSchedule} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Describe your study requirements:
              </label>
              <textarea
                value={userMessage}
                onChange={(e) => setUserMessage(e.target.value)}
                placeholder="e.g., I have an exam on Object-Oriented Programming in 7 days, I need to study 3 hours daily"
                className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                rows="4"
                disabled={isGenerating}
              />
            </div>
            <button
              type="submit"
              disabled={isGenerating}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-8 py-3 rounded-lg font-medium transition-colors duration-200"
            >
              {isGenerating ? 'Generating...' : 'Generate AI Schedule'}
            </button>
          </form>
        </div>

        {/* Generated Schedule Preview */}
        {generatedSchedule && (
          <div className="mb-8 bg-green-50 dark:bg-green-900 p-8 rounded-lg border border-green-200 dark:border-green-700 relative">
            {/* Close (X) button */}
            <button
              className="absolute top-4 right-4 text-green-800 dark:text-green-200 hover:text-red-600 dark:hover:text-red-400 text-2xl font-bold focus:outline-none"
              aria-label="Close"
              onClick={() => setGeneratedSchedule(null)}
            >
              &times;
            </button>
            <h3 className="text-2xl font-semibold mb-6 text-green-800 dark:text-green-200">
              Newly Generated Schedule
            </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {generatedSchedule.map((item, idx) => (
                  <div key={idx} className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                    <p className="font-semibold text-green-600 dark:text-green-400 text-lg">
                      {new Date(item.date).toLocaleDateString()}
                    </p>
                    <p className="text-gray-700 dark:text-gray-300 mt-2">{item.topic}</p>
                    {item.details && (
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                        {item.details}
                      </p>
                    )}
                    {Array.isArray(item.subtopics) && item.subtopics.length > 0 && (
                      <ul className="mt-2 text-sm text-gray-600 dark:text-gray-300 list-disc list-inside space-y-1">
                        {item.subtopics.map((sub, i) => (
                          <li key={i}>{sub}</li>
                        ))}
                      </ul>
                    )}
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                      Duration: {item.duration} hours
                    </p>
                  </div>
                ))}
              </div>
          </div>
        )}

        {/* Calendar */}
        <div className="mb-8">
          <h3 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-white">Your Schedule Calendar</h3>
          <div className="flex justify-center">
            <Calendar
              onClickDay={handleDayClick}
              value={value}
              className="calendar-custom"
              tileContent={({ date, view }) => {
                if (view === 'month') {
                  const dayHasSchedule = schedule.some((item) => {
                    const itemDate = new Date(item.date);
                    return (
                      itemDate.getFullYear() === date.getFullYear() &&
                      itemDate.getMonth() === date.getMonth() &&
                      itemDate.getDate() === date.getDate()
                    );
                  });
                  return dayHasSchedule ? <div className="schedule-dot"></div> : null;
                }
                return null;
              }}
            />
          </div>
        </div>

        {/* Schedule Details */}
        {topicsOnDate.length > 0 && (
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-white">
              {value.toDateString()}
            </h3>
            <div className="grid gap-4">
              {topicsOnDate.map((item, idx) => (
                <div key={idx} className="p-6 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="md:flex-1 md:pr-6">
                    <p className="font-semibold text-lg text-gray-800 dark:text-white">{item.topic}</p>
                    {item.details && (
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                        {item.details}
                      </p>
                    )}
                    {Array.isArray(item.subtopics) && item.subtopics.length > 0 && (
                      <ul className="mt-2 text-sm text-gray-600 dark:text-gray-300 list-disc list-inside space-y-1">
                        {item.subtopics.map((sub, i) => (
                          <li key={i}>{sub}</li>
                        ))}
                      </ul>
                    )}
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                      Duration: {item.duration} hours
                    </p>
                    <p className="text-xs mt-2">
                      Status: {item.completed ? (
                        <span className="text-green-600 dark:text-green-400 font-semibold">Completed</span>
                      ) : item.delayed ? (
                        <span className="text-red-600 dark:text-red-400 font-semibold">Delayed</span>
                      ) : (
                        <span className="text-yellow-600 dark:text-yellow-400 font-semibold">Pending</span>
                      )}
                    </p>
                  </div>
                  <div className="mt-4 md:mt-0 flex flex-col gap-2">
                    {item.completed ? (
                      <button
                        className="bg-gray-400 text-white px-4 py-2 rounded-lg cursor-not-allowed"
                        disabled
                      >
                        Completed
                      </button>
                    ) : (
                      <button
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                        onClick={() => handleMarkCompleted(item._id, true)}
                      >
                        Mark as Completed
                      </button>
                    )}
                    <button
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                      onClick={() => handleStudy(item._id)}
                    >
                      Study
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
