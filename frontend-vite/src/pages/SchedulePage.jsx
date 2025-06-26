import { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import { useAuth } from '../context/AuthContext';
import '../styles/calendar.css';

export default function SchedulePage() {
  const { token } = useAuth();
  const [schedule, setSchedule] = useState([]);
  const [value, setValue] = useState(new Date());
  const [topicsOnDate, setTopicsOnDate] = useState([]);
  const [userMessage, setUserMessage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedSchedule, setGeneratedSchedule] = useState(null);

  useEffect(() => {
    fetch('https://api.byteblazeverse.space/api/schedule', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => setSchedule(data));
  }, [token]);

  const handleDayClick = (date) => {
    const clickedDate = date.toISOString().slice(0, 10);
    const matched = schedule.filter(item => item.date.slice(0, 10) === clickedDate);
    setTopicsOnDate(matched);
    setValue(date);
  };

  const handleGenerateSchedule = async (e) => {
    e.preventDefault();
    if (!userMessage.trim()) {
      alert('Please enter your study requirements');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('https://api.byteblazeverse.space/api/schedule/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userMessage })
      });

      const data = await response.json();
      
      if (response.ok) {
        setGeneratedSchedule(data.schedule);
        const updatedResponse = await fetch('https://api.byteblazeverse.space/api/schedule', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const updatedData = await updatedResponse.json();
        setSchedule(updatedData);
        setUserMessage('');
        alert('Schedule generated successfully!');
      } else {
        alert('Error generating schedule: ' + data.error);
      }
    } catch (error) {
      console.error('Error generating schedule:', error);
      alert('Failed to generate schedule. Please try again.');
    } finally {
      setIsGenerating(false);
    }
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
          <div className="mb-8 bg-green-50 dark:bg-green-900 p-8 rounded-lg border border-green-200 dark:border-green-700">
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
                  const dayHasSchedule = schedule.some(
                    (item) => item.date.slice(0, 10) === date.toISOString().slice(0, 10)
                  );
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
                <div key={idx} className="p-6 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700">
                  <p className="font-semibold text-lg text-gray-800 dark:text-white">{item.topic}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                    Duration: {item.duration} hours
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
