import { Link, useNavigate } from 'react-router-dom';
import { LogOut, User, Home, PlusSquare, Search, Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    navigate('/signin');
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Left side - Brand and main links */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center group">
              <div className="relative">
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  SkillSwap
                </span>
                <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 group-hover:w-full transition-all duration-300"></div>
              </div>
            </Link>
            <Link to="/chat">chat</Link>
            
            {user && (
              <div className="hidden md:ml-8 md:flex md:space-x-1">
                <Link
                  to="/"
                  className="group inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 relative overflow-hidden"
                >
                  <Home className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                  Home
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-purple-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 -z-10"></div>
                </Link>
                <Link
                  to="/skills"
                  className="group inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-purple-600 hover:bg-purple-50 transition-all duration-200 relative overflow-hidden"
                >
                  <Search className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                  Browse
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-50 to-pink-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 -z-10"></div>
                </Link>
                <Link
                  to="/addskills"
                  className="group inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-pink-600 hover:bg-pink-50 transition-all duration-200 relative overflow-hidden"
                >
                  <PlusSquare className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                  Add Skill
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-50 to-blue-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 -z-10"></div>
                </Link>
              </div>
            )}
          </div>

          {/* Right side - Auth links */}
          <div className="flex items-center">
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="hidden md:flex items-center space-x-3">
                  <div className="flex items-center space-x-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-full px-4 py-2 border border-gray-200">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      Hi, {user?.username || 'User'}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="group flex items-center text-sm font-medium text-gray-600 hover:text-red-600 bg-gray-100 hover:bg-red-50 px-4 py-2 rounded-lg transition-all duration-200 border border-gray-200 hover:border-red-200"
                  >
                    <LogOut className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform duration-200" />
                    Logout
                  </button>
                </div>
                
                {/* Mobile menu button */}
                <button
                  onClick={toggleMobileMenu}
                  className="md:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors duration-200"
                >
                  {isMobileMenuOpen ? (
                    <X className="h-6 w-6" />
                  ) : (
                    <Menu className="h-6 w-6" />
                  )}
                </button>
              </div>
            ) : (
              <div className="flex space-x-3">
                <Link
                  to="/signin"
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-all duration-200"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="group inline-flex items-center px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-lg hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  <span className="relative z-10">Sign Up</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-700 via-purple-700 to-pink-700 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {user && (
        <div className={`md:hidden bg-white/95 backdrop-blur-md border-t border-gray-100 transition-all duration-300 ease-in-out ${
          isMobileMenuOpen 
            ? 'max-h-96 opacity-100' 
            : 'max-h-0 opacity-0 overflow-hidden'
        }`}>
          <div className="px-4 pt-2 pb-3 space-y-1">
            <Link
              to="/"
              onClick={closeMobileMenu}
              className="group flex items-center px-4 py-3 rounded-lg text-base font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
            >
              <Home className="mr-3 h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
              Home
            </Link>
            <Link
              to="/skills"
              onClick={closeMobileMenu}
              className="group flex items-center px-4 py-3 rounded-lg text-base font-medium text-gray-600 hover:text-purple-600 hover:bg-purple-50 transition-all duration-200"
            >
              <Search className="mr-3 h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
              Browse Skills
            </Link>
            <Link
              to="/addskills"
              onClick={closeMobileMenu}
              className="group flex items-center px-4 py-3 rounded-lg text-base font-medium text-gray-600 hover:text-pink-600 hover:bg-pink-50 transition-all duration-200"
            >
              <PlusSquare className="mr-3 h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
              Add Skill
            </Link>
            
            {/* Mobile user info and logout */}
            <div className="border-t border-gray-200 pt-3 mt-3">
              <div className="flex items-center px-4 py-2 mb-2">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mr-3">
                  <User className="h-5 w-5 text-white" />
                </div>
                <span className="text-base font-medium text-gray-700">
                  {user?.username || 'User'}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="group w-full flex items-center px-4 py-3 rounded-lg text-base font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
              >
                <LogOut className="mr-3 h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;