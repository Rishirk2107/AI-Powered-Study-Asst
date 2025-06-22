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
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h3 className="text-xl font-semibold text-blue-600 dark:text-blue-400">
            📚 {card.file_name}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-red-500 text-2xl font-bold transition-colors"
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-6">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 mb-4">
              <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
                Question {questionIndex + 1} of {card.flash_card.length}
              </h4>
              <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
                {card.flash_card[questionIndex].question}
              </p>
            </div>

            {!showAnswer ? (
              <button
                onClick={() => setShowAnswer(true)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium transition-colors duration-200"
              >
                🎯 Reveal Answer
              </button>
            ) : (
              <div className="bg-green-50 dark:bg-green-900 rounded-lg p-6 border border-green-200 dark:border-green-700">
                <h4 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-3">
                  Answer
                </h4>
                <p className="text-green-700 dark:text-green-300 text-lg leading-relaxed">
                  {card.flash_card[questionIndex].answer}
                </p>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <button
              onClick={goPrev}
              disabled={questionIndex === 0}
              className="px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors duration-200"
            >
              ← Previous
            </button>
            
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {questionIndex + 1} / {card.flash_card.length}
            </span>
            
            <button
              onClick={goNext}
              disabled={questionIndex === card.flash_card.length - 1}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors duration-200"
            >
              Next →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
