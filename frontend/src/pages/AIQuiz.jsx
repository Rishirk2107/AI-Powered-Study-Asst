import { useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { apiUpload, apiPost } from '../utils/api';

export default function AIQuiz() {
  const { token } = useAuth();
  const [file, setFile] = useState(null);
  const [prompt, setPrompt] = useState('');
  const [mode, setMode] = useState('pdf');
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [quizId, setQuizId] = useState(null);
  const [accuracy, setAccuracy] = useState(null);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return toast.error('Please select a file');

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const data = await apiUpload('/quiz/upload', formData);
      setQuestions(Array.isArray(data.questions) ? data.questions : []);
      setQuizId(data.quizId || null);
      setAnswers({});
      setSubmitted(false);
      setScore(0);
      setAccuracy(null);
    } catch (error) {
      toast.error('Failed to generate quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateFromPrompt = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return toast.error('Please enter a prompt');

    setLoading(true);

    try {
      const data = await apiPost('/quiz/from-prompt', { prompt });
      setQuestions(Array.isArray(data.questions) ? data.questions : []);
      setQuizId(data.quizId || null);
      setAnswers({});
      setSubmitted(false);
      setScore(0);
      setAccuracy(null);
    } catch (error) {
      toast.error('Failed to generate quiz from prompt. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (qIndex, option) => {
    setAnswers((prev) => ({ ...prev, [qIndex]: option }));
  };

  const handleSubmit = async () => {
    let s = 0;
    questions.forEach((q, i) => {
      if (answers[i] === q.answer) s++;
    });
    setScore(s);
    setSubmitted(true);

    if (!quizId) {
      return;
    }

    try {
      const payloadAnswers = questions.map((q, i) => {
        const selected = answers[i];
        const isSkipped = !selected;
        return {
          questionIndex: i,
          selectedOption: isSkipped ? null : selected,
          is_skipped: isSkipped
        };
      });

      const result = await apiPost('/quiz/submit', {
        quizId,
        answers: payloadAnswers
      });

      if (typeof result.score === 'number') {
        setScore(result.score);
      }
      if (typeof result.accuracy === 'number') {
        setAccuracy(result.accuracy);
      }
    } catch (error) {
      toast.error('Failed to submit quiz results.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="p-8">
        <h1 className="text-4xl font-bold mb-8 text-gray-800 dark:text-white">🧠 AI Quiz Generator</h1>

        {!questions.length ? (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex gap-4 mb-2">
              <button
                type="button"
                onClick={() => setMode('pdf')}
                className={`flex-1 px-4 py-2 rounded-lg font-medium ${
                  mode === 'pdf'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                }`}
              >
                From PDF
              </button>
              <button
                type="button"
                onClick={() => setMode('prompt')}
                className={`flex-1 px-4 py-2 rounded-lg font-medium ${
                  mode === 'prompt'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                }`}
              >
                From Prompt
              </button>
            </div>

            {mode === 'pdf' ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 border border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Upload Document</h2>
                <form onSubmit={handleUpload} className="space-y-4">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setFile(e.target.files[0])}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
                  >
                    {loading ? 'Generating Quiz...' : 'Generate Quiz'}
                  </button>
                </form>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 border border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Generate From Prompt</h2>
                <form onSubmit={handleGenerateFromPrompt} className="space-y-4">
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={5}
                    placeholder="Describe the topic, difficulty, and number of questions you want..."
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
                  >
                    {loading ? 'Generating Quiz...' : 'Generate Quiz'}
                  </button>
                </form>
              </div>
            )}
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 border border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Quiz Questions</h2>
              
              {questions.map((q, i) => (
                <div key={i} className="mb-8 p-6 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <p className="font-semibold text-lg text-gray-800 dark:text-white mb-4">
                    {i + 1}. {q.question}
                  </p>
                  <div className="space-y-3">
                    {q.options.map((opt, j) => (
                      <label key={j} className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="radio"
                          name={`q-${i}`}
                          value={opt}
                          checked={answers[i] === opt}
                          disabled={submitted}
                          onChange={() => handleChange(i, opt)}
                          className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                        <span className="text-gray-700 dark:text-gray-300">{opt}</span>
                      </label>
                    ))}
                  </div>
                  {submitted && (
                    <div className="mt-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
                      <p className={`text-sm font-medium ${
                        answers[i] === q.answer 
                          ? 'text-green-600 dark:text-green-400' 
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {answers[i] === q.answer ? 'Correct!' : 'Incorrect'}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                        Correct Answer: <span className="font-medium">{q.answer}</span>
                      </p>
                    </div>
                  )}
                </div>
              ))}

              {!submitted ? (
                <button 
                  onClick={handleSubmit}
                  className="w-full bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg font-medium text-lg transition-colors duration-200"
                >
                  Submit Quiz
                </button>
              ) : (
                <div className="text-center p-8 bg-blue-50 dark:bg-blue-900 rounded-lg">
                  <h3 className="text-2xl font-bold text-blue-800 dark:text-blue-200 mb-2">
                    Quiz Complete!
                  </h3>
                  <p className="text-xl text-blue-600 dark:text-blue-300">
                    You scored <span className="font-bold">{score}</span> out of <span className="font-bold">{questions.length}</span>
                  </p>
                  {accuracy !== null && (
                    <p className="text-lg text-blue-600 dark:text-blue-300 mt-2">
                      Accuracy: <span className="font-bold">{Math.round(accuracy * 100)}%</span>
                    </p>
                  )}
                  <p className="text-sm text-blue-500 dark:text-blue-400 mt-2">
                    {score === questions.length ? 'Perfect score!' : 
                     score >= questions.length * 0.8 ? 'Great job!' : 
                     score >= questions.length * 0.6 ? 'Good effort!' : 'Keep studying!'}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
