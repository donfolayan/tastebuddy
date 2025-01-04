import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navigation() {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-surface shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="text-2xl font-bold text-primary-500">
            TasteBuddy
          </Link>
          
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <span className="text-text-secondary">
                  Welcome, {user.email}
                </span>
                <button
                  onClick={logout}
                  className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="space-x-4">
                <Link
                  to="/login"
                  className="text-text-secondary hover:text-white transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navigation; 