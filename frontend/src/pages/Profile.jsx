import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="p-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 border border-gray-200 dark:border-gray-700">
            <div className="text-center mb-8">
              <div className="w-24 h-24 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {user.username.charAt(0).toUpperCase()}
                </span>
              </div>
              <h2 className="text-3xl font-bold text-gray-800 dark:text-white">User Profile</h2>
              <p className="text-gray-600 dark:text-gray-300 mt-2">Manage your account information</p>
            </div>
            
            <div className="space-y-6">
              <div className="p-6 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Username
                </label>
                <p className="text-lg text-gray-800 dark:text-white font-medium">{user.username}</p>
              </div>
              
              <div className="p-6 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address
                </label>
                <p className="text-lg text-gray-800 dark:text-white font-medium">{user.email}</p>
              </div>
              
              {user.userId && (
                <div className="p-6 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    User ID
                  </label>
                  <p className="text-lg text-gray-800 dark:text-white font-medium">#{user.userId}</p>
                </div>
              )}
            </div>
            
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-600">
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                Account created with AI-Powered Study Assistant
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
