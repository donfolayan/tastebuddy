import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-card border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-text-primary">
              TasteBuddy
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link to="/profile" className="text-text-secondary hover:text-text-primary">
                  Profile
                </Link>
                <button
                  onClick={logout}
                  className="text-text-secondary hover:text-text-primary"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-text-secondary hover:text-text-primary">
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-secondary-accent text-white px-4 py-2 rounded-md hover:bg-secondary-accent-dark"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar; 