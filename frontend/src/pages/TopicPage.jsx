import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { apiGet } from '../utils/api';
import toast from 'react-hot-toast';

export default function TopicPage() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [content, setContent] = useState(null);
  const [activeSection, setActiveSection] = useState('overview');
  const [coreConceptIndex, setCoreConceptIndex] = useState(0);
  const [workedExampleIndex, setWorkedExampleIndex] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await apiGet(`/schedule/topic/${id}`);
        setContent(data);
      } catch (err) {
        setError(err?.response?.data?.error || 'Failed to load topic content');
        toast.error(err?.response?.data?.error || 'Failed to load topic content');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <p className="text-gray-700 dark:text-gray-200 text-lg">Generating topic content...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <p className="text-red-600 dark:text-red-400 text-lg">{error}</p>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <p className="text-gray-700 dark:text-gray-200 text-lg">No content available.</p>
      </div>
    );
  }

  const sections = [];

  if (content.overview) {
    sections.push('overview');
  }
  if (Array.isArray(content.learning_objectives) && content.learning_objectives.length > 0) {
    sections.push('learning_objectives');
  }
  if (Array.isArray(content.prerequisites) && content.prerequisites.length > 0) {
    sections.push('prerequisites');
  }
  if (content.eli5) {
    sections.push('eli5');
  }
  if (Array.isArray(content.core_concepts) && content.core_concepts.length > 0) {
    sections.push('core_concepts');
  }
  if (Array.isArray(content.worked_examples) && content.worked_examples.length > 0) {
    sections.push('worked_examples');
  }
  if (Array.isArray(content.visuals) && content.visuals.length > 0) {
    sections.push('visuals');
  }
  if (Array.isArray(content.real_world_applications) && content.real_world_applications.length > 0) {
    sections.push('real_world_applications');
  }
  if (Array.isArray(content.common_mistakes) && content.common_mistakes.length > 0) {
    sections.push('common_mistakes');
  }
  if (Array.isArray(content.exam_interview_relevance) && content.exam_interview_relevance.length > 0) {
    sections.push('exam_interview_relevance');
  }
  if (Array.isArray(content.quick_revision) && content.quick_revision.length > 0) {
    sections.push('quick_revision');
  }
  if (content.next_actions) {
    sections.push('next_actions');
  }

  const visibleSections = sections.length > 0 ? sections : ['overview'];

  if (!visibleSections.includes(activeSection)) {
    setActiveSection(visibleSections[0]);
  }

  const renderSection = () => {
    if (activeSection === 'overview') {
      return (
        <>
          {content.overview && (
            <p className="text-gray-700 dark:text-gray-200 mb-4">
              {content.overview}
            </p>
          )}
        </>
      );
    }

    if (activeSection === 'learning_objectives' && Array.isArray(content.learning_objectives)) {
      return (
        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Learning Objectives
          </h2>
          <ul className="list-disc list-inside text-gray-700 dark:text-gray-200 space-y-1">
            {content.learning_objectives.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </section>
      );
    }

    if (activeSection === 'prerequisites' && Array.isArray(content.prerequisites)) {
      return (
        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Prerequisites
          </h2>
          <ul className="list-disc list-inside text-gray-700 dark:text-gray-200 space-y-1">
            {content.prerequisites.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </section>
      );
    }

    if (activeSection === 'eli5' && content.eli5) {
      return (
        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Explain Like I&apos;m 5
          </h2>
          <p className="text-gray-700 dark:text-gray-200">
            {content.eli5}
          </p>
        </section>
      );
    }

    if (activeSection === 'core_concepts' && Array.isArray(content.core_concepts)) {
      const total = content.core_concepts.length;
      const safeIndex =
        coreConceptIndex >= 0 && coreConceptIndex < total ? coreConceptIndex : 0;
      const concept = content.core_concepts[safeIndex];

      return (
        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Core Concepts
          </h2>
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {concept.title}
              </h3>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Concept {safeIndex + 1} of {total}
              </span>
            </div>
            <p className="text-gray-700 dark:text-gray-200 mt-1">
              {concept.explanation}
            </p>
            {Array.isArray(concept.key_points) && concept.key_points.length > 0 && (
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-200 mt-3 space-y-1">
                {concept.key_points.map((point, i) => (
                  <li key={i}>{point}</li>
                ))}
              </ul>
            )}
          </div>
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setCoreConceptIndex(Math.max(0, safeIndex - 1))}
              disabled={safeIndex === 0}
              className={
                'px-4 py-2 rounded-md text-sm font-medium transition-colors ' +
                (safeIndex === 0
                  ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600')
              }
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() =>
                setCoreConceptIndex(Math.min(total - 1, safeIndex + 1))
              }
              disabled={safeIndex === total - 1}
              className={
                'px-4 py-2 rounded-md text-sm font-medium transition-colors ' +
                (safeIndex === total - 1
                  ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700')
              }
            >
              Next
            </button>
          </div>
        </section>
      );
    }

    if (activeSection === 'worked_examples' && Array.isArray(content.worked_examples)) {
      const total = content.worked_examples.length;
      const safeIndex =
        workedExampleIndex >= 0 && workedExampleIndex < total ? workedExampleIndex : 0;
      const example = content.worked_examples[safeIndex];

      return (
        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Worked Examples
          </h2>
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Example {safeIndex + 1}
              </h3>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Example {safeIndex + 1} of {total}
              </span>
            </div>
            <p className="font-semibold text-gray-900 dark:text-white">Problem:</p>
            <p className="text-gray-700 dark:text-gray-200 mt-1">{example.problem}</p>
            <p className="font-semibold text-gray-900 dark:text-white mt-3">Explanation:</p>
            <p className="text-gray-700 dark:text-gray-200 mt-1">{example.explanation}</p>
            <p className="font-semibold text-gray-900 dark:text-white mt-3">Final Answer:</p>
            <p className="text-gray-700 dark:text-gray-200 mt-1">{example.final_answer}</p>
          </div>
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setWorkedExampleIndex(Math.max(0, safeIndex - 1))}
              disabled={safeIndex === 0}
              className={
                'px-4 py-2 rounded-md text-sm font-medium transition-colors ' +
                (safeIndex === 0
                  ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600')
              }
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => setWorkedExampleIndex(Math.min(total - 1, safeIndex + 1))}
              disabled={safeIndex === total - 1}
              className={
                'px-4 py-2 rounded-md text-sm font-medium transition-colors ' +
                (safeIndex === total - 1
                  ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700')
              }
            >
              Next
            </button>
          </div>
        </section>
      );
    }

    if (activeSection === 'visuals' && Array.isArray(content.visuals)) {
      return (
        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Visual Aids
          </h2>
          <ul className="list-disc list-inside text-gray-700 dark:text-gray-200 space-y-1">
            {content.visuals.map((visual, idx) => (
              <li key={idx}>
                <span className="font-semibold capitalize">{visual.type}:</span> {visual.description}
              </li>
            ))}
          </ul>
        </section>
      );
    }

    if (activeSection === 'real_world_applications' && Array.isArray(content.real_world_applications)) {
      return (
        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Real-World Applications
          </h2>
          <ul className="list-disc list-inside text-gray-700 dark:text-gray-200 space-y-1">
            {content.real_world_applications.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </section>
      );
    }

    if (activeSection === 'common_mistakes' && Array.isArray(content.common_mistakes)) {
      return (
        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Common Mistakes
          </h2>
          <ul className="list-disc list-inside text-gray-700 dark:text-gray-200 space-y-1">
            {content.common_mistakes.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </section>
      );
    }

    if (activeSection === 'exam_interview_relevance' && Array.isArray(content.exam_interview_relevance)) {
      return (
        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Exam and Interview Relevance
          </h2>
          <ul className="list-disc list-inside text-gray-700 dark:text-gray-200 space-y-1">
            {content.exam_interview_relevance.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </section>
      );
    }

    if (activeSection === 'quick_revision' && Array.isArray(content.quick_revision)) {
      return (
        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Quick Revision
          </h2>
          <ul className="list-disc list-inside text-gray-700 dark:text-gray-200 space-y-1">
            {content.quick_revision.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </section>
      );
    }

    if (activeSection === 'next_actions' && content.next_actions) {
      return (
        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Next Actions
          </h2>
          <div className="space-y-2 text-gray-700 dark:text-gray-200">
            {content.next_actions.suggested_practice && (
              <p>
                <span className="font-semibold">Suggested Practice:</span> {content.next_actions.suggested_practice}
              </p>
            )}
            {content.next_actions.suggested_quiz && (
              <p>
                <span className="font-semibold">Suggested Quiz:</span> {content.next_actions.suggested_quiz}
              </p>
            )}
            {content.next_actions.suggested_flashcards && (
              <p>
                <span className="font-semibold">Suggested Flashcards:</span> {content.next_actions.suggested_flashcards}
              </p>
            )}
          </div>
        </section>
      );
    }

    return null;
  };

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
      <div className="h-full w-full bg-white dark:bg-gray-800 flex flex-col md:flex-row gap-8 p-8">
        <aside className="w-full md:w-[26rem] border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-700 pb-4 md:pb-0 md:pr-4 md:pr-6 flex flex-col">
          <h1 className="text-4xl font-bold mb-8 text-gray-900 dark:text-white">
            {content.topic}
          </h1>
          <nav className="space-y-3 overflow-y-auto pr-1 md:pr-3 flex-1">
            {visibleSections.map((key) => {
              let label = key;
              if (key === 'overview') label = 'Overview';
              if (key === 'learning_objectives') label = 'Learning Objectives';
              if (key === 'prerequisites') label = 'Prerequisites';
              if (key === 'eli5') label = "Explain Like I'm 5";
              if (key === 'core_concepts') label = 'Core Concepts';
              if (key === 'worked_examples') label = 'Worked Examples';
              if (key === 'visuals') label = 'Visual Aids';
              if (key === 'real_world_applications') label = 'Real-World Applications';
              if (key === 'common_mistakes') label = 'Common Mistakes';
              if (key === 'exam_interview_relevance') label = 'Exam/Interview Relevance';
              if (key === 'quick_revision') label = 'Quick Revision';
              if (key === 'next_actions') label = 'Next Actions';

              const isActive = activeSection === key;

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActiveSection(key)}
                  className={
                    'w-full text-left px-5 py-4 rounded-lg text-lg md:text-xl font-semibold transition-colors ' +
                    (isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700')
                  }
                >
                  {label}
                </button>
              );
            })}
          </nav>
        </aside>
        <main className="flex-1 flex items-start overflow-y-auto">
          <div className="w-full max-w-4xl mx-auto text-lg md:text-xl leading-relaxed py-8">
            {renderSection()}
          </div>
        </main>
      </div>
    </div>
  );
}
