import { useEffect, useState } from 'react';
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
  const [violations, setViolations] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [timeTakenSeconds, setTimeTakenSeconds] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [unansweredCountAtSubmit, setUnansweredCountAtSubmit] = useState(0);

  const MAX_VIOLATIONS = 3;

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
      setViolations(0);
      setStartTime(Date.now());
      setElapsedSeconds(0);
      setTimeTakenSeconds(null);
      setCurrentQuestionIndex(0);
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
      setViolations(0);
      setStartTime(Date.now());
      setElapsedSeconds(0);
      setTimeTakenSeconds(null);
      setCurrentQuestionIndex(0);
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
    const endTime = Date.now();
    const durationSeconds =
      startTime && endTime > startTime ? Math.round((endTime - startTime) / 1000) : null;
    if (durationSeconds !== null) {
      setTimeTakenSeconds(durationSeconds);
    }
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
        answers: payloadAnswers,
        durationSeconds
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

  const quizActive = questions.length > 0 && !submitted;

  useEffect(() => {
    if (!quizActive) {
      return undefined;
    }

    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = '';
      return '';
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        setViolations((prev) => prev + 1);
        toast.error('Do not switch tabs or minimize during the quiz.');
      }
    };

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setViolations((prev) => prev + 1);
        toast.error('Stay in fullscreen mode during the quiz.');
      }
    };

    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();
      const ctrlOrMeta = e.ctrlKey || e.metaKey;
      const blockedShortcut =
        (ctrlOrMeta &&
          ['c', 'x', 'v', 's', 'p', 'u', 'h', 'a'].includes(key)) ||
        (ctrlOrMeta && e.shiftKey && ['i', 'j', 'c'].includes(key)) ||
        key === 'f12';

      if (blockedShortcut) {
        e.preventDefault();
        e.stopPropagation();
        toast.error('Keyboard shortcuts are disabled during the quiz.');
      }
    };

    const handleContextMenu = (e) => {
      e.preventDefault();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    window.addEventListener('keydown', handleKeyDown, true);
    document.addEventListener('contextmenu', handleContextMenu);

    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(() => {});
    }

    return () => {
      clearInterval(timer);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      window.removeEventListener('keydown', handleKeyDown, true);
      document.removeEventListener('contextmenu', handleContextMenu);
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    };
  }, [quizActive]);

  useEffect(() => {
    if (!quizActive) return;
    if (violations >= MAX_VIOLATIONS) {
      toast.error('Too many violations. Submitting quiz automatically.');
      handleSubmit();
    }
  }, [violations, quizActive]);

  const formatTime = (totalSeconds) => {
    if (totalSeconds == null) return '';
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const mm = minutes.toString().padStart(2, '0');
    const ss = seconds.toString().padStart(2, '0');
    return `${mm}:${ss}`;
  };

  const handleSubmitClick = () => {
    if (!questions.length || submitted) {
      return;
    }
    const unansweredCount = questions.filter((q, i) => !answers[i]).length;
    setUnansweredCountAtSubmit(unansweredCount);
    setShowSubmitConfirm(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200 select-none">
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
              <div className="mb-4 p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700">
                <p className="text-sm md:text-base text-yellow-800 dark:text-yellow-100 font-medium">
                  Secure quiz mode: switching tabs, exiting fullscreen, right-click, and shortcuts like
                  copy/paste or devtools are monitored. After {MAX_VIOLATIONS} violations the quiz will be
                  auto-submitted.
                </p>
                <p className="text-xs md:text-sm text-yellow-700 dark:text-yellow-200 mt-1">
                  Violations: {violations} / {MAX_VIOLATIONS}
                </p>
              </div>
              <div className="mb-4 flex items-center justify-between text-sm md:text-base text-gray-700 dark:text-gray-200">
                <span className="font-medium">
                  Time elapsed: {formatTime(quizActive ? elapsedSeconds : timeTakenSeconds)}
                </span>
                {timeTakenSeconds != null && (
                  <span className="text-gray-500 dark:text-gray-400">
                    Total time: {formatTime(timeTakenSeconds)}
                  </span>
                )}
              </div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Quiz Questions</h2>
              <div className="mb-6">
                <p className="text-sm md:text-base font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Question Navigator
                </p>
                <div className="flex flex-wrap gap-2">
                  {questions.map((q, i) => {
                    const answered = !!answers[i];
                    const isActive = i === currentQuestionIndex;
                    const base =
                      'w-8 h-8 md:w-10 md:h-10 rounded-full text-sm md:text-base font-semibold flex items-center justify-center border transition-colors';
                    let stateClasses;
                    if (isActive) {
                      stateClasses = ' bg-blue-600 text-white border-blue-600';
                    } else if (answered) {
                      stateClasses =
                        ' bg-green-100 text-green-800 border-green-300 dark:bg-green-900 dark:text-green-100 dark:border-green-700';
                    } else {
                      stateClasses =
                        ' bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600';
                    }
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setCurrentQuestionIndex(i)}
                        disabled={submitted}
                        className={base + stateClasses}
                      >
                        {i + 1}
                      </button>
                    );
                  })}
                </div>
              </div>

              {questions.length > 0 && (() => {
                const safeIndex =
                  currentQuestionIndex >= 0 && currentQuestionIndex < questions.length
                    ? currentQuestionIndex
                    : 0;
                const q = questions[safeIndex];
                return (
                  <div className="mb-8 p-6 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <p className="font-semibold text-lg text-gray-800 dark:text-white mb-4">
                      Question {safeIndex + 1}: {q.question}
                    </p>
                    <div className="space-y-3">
                      {q.options.map((opt, j) => (
                        <label key={j} className="flex items-center space-x-3 cursor-pointer">
                          <input
                            type="radio"
                            name={`q-${safeIndex}`}
                            value={opt}
                            checked={answers[safeIndex] === opt}
                            disabled={submitted}
                            onChange={() => handleChange(safeIndex, opt)}
                            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                          />
                          <span className="text-gray-700 dark:text-gray-300">
                            {String.fromCharCode(65 + j)}. {opt}
                          </span>
                        </label>
                      ))}
                    </div>
                    {submitted && (
                      <div className="mt-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
                        <p
                          className={`text-sm font-medium ${
                            answers[safeIndex] === q.answer
                              ? 'text-green-600 dark:text-green-400'
                              : 'text-red-600 dark:text-red-400'
                          }`}
                        >
                          {answers[safeIndex] === q.answer ? 'Correct!' : 'Incorrect'}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                          Correct Answer: <span className="font-medium">{q.answer}</span>
                        </p>
                      </div>
                    )}
                    <div className="mt-6 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => setCurrentQuestionIndex(Math.max(0, safeIndex - 1))}
                        disabled={safeIndex === 0}
                        className={
                          'px-4 py-2 rounded-md text-sm md:text-base font-medium transition-colors ' +
                          (safeIndex === 0
                            ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600')
                        }
                      >
                        Previous Question
                      </button>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Question {safeIndex + 1} of {questions.length}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setCurrentQuestionIndex(
                            Math.min(questions.length - 1, safeIndex + 1)
                          )
                        }
                        disabled={safeIndex === questions.length - 1}
                        className={
                          'px-4 py-2 rounded-md text-sm md:text-base font-medium transition-colors ' +
                          (safeIndex === questions.length - 1
                            ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                            : 'bg-blue-600 text-white hover:bg-blue-700')
                        }
                      >
                        Next Question
                      </button>
                    </div>
                  </div>
                );
              })()}

              {!submitted ? (
                <button
                  onClick={handleSubmitClick}
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
            {showSubmitConfirm && (
              <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-50">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 p-6 border border-gray-200 dark:border-gray-700">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                    Submit Quiz?
                  </h3>
                  <p className="text-sm md:text-base text-gray-700 dark:text-gray-200 mb-2">
                    Are you sure you want to submit your quiz now?
                  </p>
                  {unansweredCountAtSubmit > 0 && (
                    <p className="text-sm text-red-600 dark:text-red-400 mb-4">
                      You have {unansweredCountAtSubmit} unanswered question
                      {unansweredCountAtSubmit > 1 ? 's' : ''}. You will not be able to change answers after submitting.
                    </p>
                  )}
                  {unansweredCountAtSubmit === 0 && (
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                      All questions are answered. You will not be able to change answers after submitting.
                    </p>
                  )}
                  <div className="flex justify-end gap-3 mt-2">
                    <button
                      type="button"
                      onClick={() => setShowSubmitConfirm(false)}
                      className="px-4 py-2 rounded-md text-sm md:text-base font-medium bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                    >
                      Review Again
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowSubmitConfirm(false);
                        handleSubmit();
                      }}
                      className="px-4 py-2 rounded-md text-sm md:text-base font-medium bg-green-600 text-white hover:bg-green-700 transition-colors"
                    >
                      Yes, Submit
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
