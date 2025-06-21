import { useState, useRef, useEffect } from 'react';

export default function QAChatbot() {
  const [file, setFile] = useState(null);
  const [uploaded, setUploaded] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatBoxRef = useRef(null);

  useEffect(() => {
    chatBoxRef.current?.scrollTo(0, chatBoxRef.current.scrollHeight);
  }, [messages]);

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!file) return alert('Please select a file');
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('http://localhost:5000/api/chat/upload', {
      method: 'POST',
      body: formData,
    });
    if (res.ok) {
      setUploaded(true);
      alert('File uploaded. You can now ask questions.');
    } else {
      alert('Upload failed');
    }
  };

  const handleQuestion = async () => {
    if (!input.trim()) return;
    const userMessage = { sender: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    const res = await fetch('http://localhost:5000/api/chat/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: input }),
    });
    const data = await res.json();
    const botMessage = { sender: 'bot', text: data.answer };
    setMessages((prev) => [...prev, botMessage]);
    setLoading(false);
  };

  return (
    <div className="h-screen flex flex-col dark:bg-gray-900 dark:text-white">
      <header className="p-4 bg-gray-800 text-white text-xl font-bold dark:bg-black">💬 QA Chatbot</header>

      {!uploaded ? (
        <form onSubmit={handleFileUpload} className="flex-1 flex flex-col items-center justify-center">
          <input
            type="file"
            accept=".pdf,.txt"
            onChange={(e) => setFile(e.target.files[0])}
            className="mb-4 p-2 border rounded dark:bg-gray-700"
          />
          <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">Upload File</button>
        </form>
      ) : (
        <>
          <div ref={chatBoxRef} className="flex-1 overflow-y-auto p-4 bg-white dark:bg-gray-800">
            {messages.map((msg, idx) => (
  <div
    key={idx}
    className={`mb-3 flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
  >
    <div
      className={`px-4 py-2 rounded-lg break-words max-w-[75%] ${
        msg.sender === 'user'
          ? 'bg-blue-600 text-white'
          : 'bg-gray-200 dark:bg-gray-700 dark:text-white'
      }`}
    >
      {msg.text}
    </div>
  </div>
))}
            {loading && <p className="text-gray-500 dark:text-gray-300">Thinking...</p>}
          </div>

          <div className="p-4 bg-gray-100 dark:bg-gray-800 border-t dark:border-gray-700 flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask something..."
              className="flex-1 px-4 py-2 border rounded dark:bg-gray-700 dark:text-white"
            />
            <button onClick={handleQuestion} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
              Ask
            </button>
          </div>
        </>
      )}
    </div>
  );
}
