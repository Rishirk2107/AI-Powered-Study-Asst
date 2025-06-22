import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function About() {
  const { user } = useAuth();

  const features = [
    {
      icon: "🤖",
      title: "Disha-Mitra",
      description: "Advanced AI algorithms that adapt to your learning style and create personalized study materials."
    },
    {
      icon: "📚",
      title: "Smart Flashcards",
      description: "Automatically generate flashcards from your study materials with intelligent content extraction."
    },
    {
      icon: "💬",
      title: "Interactive Chatbot",
      description: "Ask questions about your study materials and get instant, intelligent responses powered by AI."
    },
    {
      icon: "🧠",
      title: "AI Quiz Generator",
      description: "Create comprehensive quizzes from your study materials to test your knowledge effectively."
    },
    {
      icon: "📅",
      title: "Smart Scheduling",
      description: "AI-generated study schedules that optimize your learning time and improve retention."
    },
    {
      icon: "📊",
      title: "Progress Tracking",
      description: "Monitor your learning progress with detailed analytics and performance insights."
    }
  ];

  const benefits = [
    "Personalized learning experience tailored to your needs",
    "Save time with AI-generated study materials",
    "Improve retention with spaced repetition techniques",
    "Track your progress and identify areas for improvement",
    "Access your study materials anywhere, anytime",
    "Collaborate and share materials with study groups"
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 dark:from-blue-800 dark:via-blue-900 dark:to-indigo-900">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              AI-Powered Study Assistant
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Transform your learning experience with intelligent AI tools that adapt to your study style and help you achieve your academic goals faster.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                <Link
                  to="/dashboard"
                  className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 rounded-lg font-semibold text-lg transition-colors duration-200"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to="/signup"
                    className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 rounded-lg font-semibold text-lg transition-colors duration-200"
                  >
                    Get Started Free
                  </Link>
                  <Link
                    to="/login"
                    className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg transition-colors duration-200"
                  >
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Powerful Features
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Everything you need to supercharge your learning journey with cutting-edge AI technology.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-gray-50 dark:bg-gray-700 p-8 rounded-xl border border-gray-200 dark:border-gray-600 hover:shadow-lg transition-all duration-200"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Get started in minutes with our simple three-step process
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Upload Your Materials
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Upload your PDF documents, notes, or study materials to get started.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                AI Processing
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Our AI analyzes your materials and creates personalized study content.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Start Learning
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Access flashcards, quizzes, and AI-powered study assistance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6 text-center">
              Why Choose Our AI Study Assistant?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 text-center">
              Experience the future of learning with our intelligent study platform designed to maximize your academic success.
            </p>
            <ul className="space-y-4 max-w-3xl mx-auto">
              {benefits.map((benefit, index) => (
                <li key={index} className="flex items-start">
                  <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5">
                    ✓
                  </div>
                  <span className="text-gray-700 dark:text-gray-300">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>      
    </div>
  );
} 