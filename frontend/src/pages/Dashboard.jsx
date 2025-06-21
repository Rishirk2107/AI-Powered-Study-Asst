import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user, token } = useAuth();
  const [flashcards, setFlashcards] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [file, setFile] = useState(null);

  const fetchFlashcards = async () => {
    const res = await fetch('http://localhost:5000/api/flashcards');
    const data = await res.json();
    setFlashcards(data.filter(card => card.username === user.username));
  };

  const fetchMaterials = async () => {
    const res = await fetch('http://localhost:5000/api/materials');
    const data = await res.json();
    setMaterials(data.filter(material => material.username === user.username));
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return alert('Please select a file');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('username', user.username);

    const res = await fetch('http://localhost:5000/api/materials/upload', {
      method: 'POST',
      body: formData,
    });

    if (res.ok) {
      alert('File uploaded successfully');
      setFile(null);
      await fetchFlashcards();
      await fetchMaterials();
    } else {
      const error = await res.json();
      alert('Upload failed: ' + error.error);
    }
  };

  useEffect(() => {
    fetchFlashcards();
    fetchMaterials();
  }, []);

  return (
    <div className="p-6 dark:text-white">

      <h2 className="text-2xl font-bold mb-4">📚 Your Flashcards</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {flashcards.map((card, idx) => (
          <div key={idx} className="bg-white dark:bg-gray-800 p-4 rounded shadow">
            <h3 className="font-semibold text-blue-600">File: {card.file_name}</h3>
            <ul className="mt-2 space-y-2">
              {card.flash_card.map((fc, i) => (
                <li key={i}>
                  <p><strong>Q:</strong> {fc.question}</p>
                  <p><strong>A:</strong> {fc.answer}</p>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <h2 className="text-2xl font-bold mt-10 mb-4">📂 Your Uploaded PDFs</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {materials.map((mat, idx) => (
          <div key={idx} className="bg-white dark:bg-gray-800 p-4 rounded shadow">
            <p className="text-lg font-medium">{mat.file_name}</p>
            <p className="text-sm text-gray-500 dark:text-gray-300">ID: {mat.file_id}</p>
            <p className="text-xs text-gray-400">{new Date(mat.upload_date).toLocaleString()}</p>
          </div>
        ))}
      </div>

      <h2 className="text-2xl font-bold mt-10 mb-4">📤 Upload New PDF</h2>
      <form onSubmit={handleUpload} className="bg-white dark:bg-gray-800 p-6 rounded shadow w-full max-w-md">
        <input
          type="file"
          accept=".pdf"
          onChange={(e) => setFile(e.target.files[0])}
          className="w-full mb-4 p-2 border rounded dark:bg-gray-700 dark:text-white"
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Upload
        </button>
      </form>
    </div>
  );
}
