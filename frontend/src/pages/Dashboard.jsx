import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import FlashcardModal from '../components/FlashcardModel';

export default function Dashboard() {
  const { user, token } = useAuth();
  const [flashcards, setFlashcards] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [file, setFile] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);

  const fetchFlashcards = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/flashcards', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        console.error('Flashcards fetch error:', errorData);
        setFlashcards([]);
        return;
      }
      
    const data = await res.json();
      if (Array.isArray(data)) {
    setFlashcards(data.filter(card => card.username === user.username));
      } else {
        console.error('Flashcards data is not an array:', data);
        setFlashcards([]);
      }
    } catch (error) {
      console.error('Error fetching flashcards:', error);
      setFlashcards([]);
    }
  };

  const fetchMaterials = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/materials', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        console.error('Materials fetch error:', errorData);
        setMaterials([]);
        return;
      }
      
    const data = await res.json();
      if (Array.isArray(data)) {
    setMaterials(data.filter(mat => mat.username === user.username));
      } else {
        console.error('Materials data is not an array:', data);
        setMaterials([]);
      }
    } catch (error) {
      console.error('Error fetching materials:', error);
      setMaterials([]);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return alert('Please select a file');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('username', user.username);

    const res = await fetch('http://localhost:5000/api/materials/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
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
    if (token && user) {
    fetchFlashcards();
    fetchMaterials();
    }
  }, [token, user]);

  return (
    <div className="relative min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className={selectedCard ? 'blur-sm pointer-events-none select-none' : ''}>
        <div className="p-6">
          <h2 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">Your Flashcards</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {flashcards.map((card, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedCard(card)}
                className="cursor-pointer bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg hover:ring-2 ring-blue-400 transition-all duration-200 border border-gray-200 dark:border-gray-700"
              >
                <h3 className="font-semibold text-blue-600 dark:text-blue-400 text-lg">File: {card.file_name}</h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">Click to view flashcards</p>
              </div>
            ))}
          </div>

          <h2 className="text-3xl font-bold mt-12 mb-6 text-gray-800 dark:text-white">Your Uploaded PDFs</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {materials.map((mat, idx) => (
              <div key={idx} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                <p className="text-lg font-medium text-gray-800 dark:text-white">{mat.file_name}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">ID: {mat.file_id}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{new Date(mat.upload_date).toLocaleString()}</p>
              </div>
            ))}
          </div>

          <h2 className="text-3xl font-bold mt-12 mb-6 text-gray-800 dark:text-white">Upload New PDF</h2>
          <form onSubmit={handleUpload} className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md w-full max-w-md border border-gray-200 dark:border-gray-700">
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => setFile(e.target.files[0])}
              className="w-full mb-6 p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            />
            <button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
            >
              Upload
            </button>
          </form>
        </div>
      </div>

      {selectedCard && (
        <FlashcardModal card={selectedCard} onClose={() => setSelectedCard(null)} />
      )}
    </div>
  );
}
