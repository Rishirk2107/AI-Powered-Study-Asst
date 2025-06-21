import { useState } from 'react';

export default function FlashcardModal({ card, onClose }) {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  const goNext = () => {
    setQuestionIndex((prev) => Math.min(prev + 1, card.flash_card.length - 1));
    setShowAnswer(false);
  };

  const goPrev = () => {
    setQuestionIndex((prev) => Math.max(prev - 1, 0));
    setShowAnswer(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-900 p-6 rounded shadow-lg max-w-lg w-full relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-red-500 text-xl"
        >
          &times;
        </button>

        <h3 className="text-xl font-semibold text-blue-600 mb-4">
          {card.file_name}
        </h3>

        <div className="mb-4">
          <p><strong>Q:</strong> {card.flash_card[questionIndex].question}</p>

          {!showAnswer ? (
            <button
              onClick={() => setShowAnswer(true)}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Reveal Answer
            </button>
          ) : (
            <p className="mt-4"><strong>A:</strong> {card.flash_card[questionIndex].answer}</p>
          )}
        </div>

        <div className="flex justify-between mt-4">
          <button
            onClick={goPrev}
            disabled={questionIndex === 0}
            className="px-4 py-2 bg-gray-300 dark:bg-gray-700 rounded hover:bg-gray-400 disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={goNext}
            disabled={questionIndex === card.flash_card.length - 1}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
