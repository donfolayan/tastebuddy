import { useAuth } from '../context/AuthContext';

function Profile() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-4xl font-display font-bold text-gray-900 mb-8">Your Profile</h1>
        <div className="bg-surface shadow-card rounded-lg p-8 space-y-6">
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Email
            </label>
            <p className="text-gray-900">{user?.email}</p>
          </div>
          {user?.preferences && (
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Preferences
              </label>
              <pre className="bg-gray-100 p-4 rounded">
                {JSON.stringify(user.preferences, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile; 