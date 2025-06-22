import { useState } from 'react';

export default function AIQuiz() {
  const [file, setFile] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return alert('Select a file');

    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch('http://localhost:5000/api/quiz/upload', {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();
    setQuestions(data.questions);
  };

  const handleChange = (qIndex, option) => {
    setAnswers((prev) => ({ ...prev, [qIndex]: option }));
  };

  const handleSubmit = () => {
    let s = 0;
    questions.forEach((q, i) => {
      if (answers[i] === q.answer) s++;
    });
    setScore(s);
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen p-6 dark:bg-gray-900 dark:text-white">
      <h1 className="text-2xl font-bold mb-4">🧠 AI Quiz</h1>

      {!questions.length ? (
        <form onSubmit={handleUpload} className="space-y-4">
          <input
            type="file"
            accept=".pdf"
            onChange={(e) => setFile(e.target.files[0])}
            className="p-2 border rounded dark:bg-gray-700"
          />
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Upload and Generate Quiz
          </button>
        </form>
      ) : (
        <div className="space-y-6">
          {questions.map((q, i) => (
            <div key={i} className="p-4 border rounded dark:border-gray-700">
              <p className="font-semibold mb-2">{i + 1}. {q.question}</p>
              {q.options.map((opt, j) => (
                <label key={j} className="block mb-1">
                  <input
                    type="radio"
                    name={`q-${i}`}
                    value={opt}
                    checked={answers[i] === opt}
                    disabled={submitted}
                    onChange={() => handleChange(i, opt)}
                    className="mr-2"
                  />
                  {opt}
                </label>
              ))}
              {submitted && (
                <p className={`mt-2 text-sm ${answers[i] === q.answer ? 'text-green-500' : 'text-red-500'}`}>
                  Correct Answer: {q.answer}
                </p>
              )}
            </div>
          ))}

          {!submitted ? (
            <button onClick={handleSubmit} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
              Submit Quiz
            </button>
          ) : (
            <p className="text-lg font-bold text-center">
              You scored {score} out of {questions.length}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
