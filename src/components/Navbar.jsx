import { Link, useNavigate } from 'react-router-dom';
import { LogOut, User, Home, PlusSquare, Search, Menu, X, Bell, MessageCircle } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { useNotifications } from '../context/NotificationContext';

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const notificationRef = useRef(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Handle scroll effect for navbar background
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 20;
      setScrolled(isScrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close notification dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setIsNotificationOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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

  const handleNotificationClick = (notification) => {
    markAsRead(notification.id);

    // Navigate to chat if it's a message notification with a sender_id
    if (notification.sender_id) {
      navigate(`/messages/${notification.sender_id}`);
    }

    setIsNotificationOpen(false);
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${
      scrolled 
        ? 'bg-white/80 backdrop-blur-xl shadow-2xl border-b border-gray-200/50' 
        : 'bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-100'
    }`}>
      {/* Animated gradient line at top */}
      <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 via-pink-500 to-blue-500 animate-pulse bg-[length:200%_100%]"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Left side - Brand and main links */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center group relative">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-600 rounded-full opacity-0 group-hover:opacity-20 blur-xl transition-all duration-500 scale-110"></div>
                <img
                  src="/skillswap-logo.png"
                  alt="SkillSwap Logo"
                  className="h-16 w-16 mr-3 relative z-10 group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="hidden sm:block">
                
                <div className="h-0.5 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
              </div>
            </Link>

            {user && (
              <div className="hidden lg:ml-8 lg:flex lg:space-x-1">
                <Link
                  to="/"
                  className="group relative inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:text-blue-600 transition-all duration-300 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-blue-100 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-xl"></div>
                  <Home className="mr-2 h-4 w-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 relative z-10" />
                  <span className="relative z-10">Home</span>
                  <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-500 group-hover:w-full transition-all duration-300"></div>
                </Link>
                
                <Link
                  to="/skills"
                  className="group relative inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:text-purple-600 transition-all duration-300 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-50 to-purple-100 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-xl"></div>
                  <Search className="mr-2 h-4 w-4 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 relative z-10" />
                  <span className="relative z-10">Browse</span>
                  <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-purple-500 group-hover:w-full transition-all duration-300"></div>
                </Link>
                
                <Link
                  to="/addskills"
                  className="group relative inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:text-pink-600 transition-all duration-300 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-50 to-pink-100 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-xl"></div>
                  <PlusSquare className="mr-2 h-4 w-4 group-hover:scale-110 group-hover:rotate-90 transition-all duration-300 relative z-10" />
                  <span className="relative z-10">Add Skill</span>
                  <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-pink-500 group-hover:w-full transition-all duration-300"></div>
                </Link>
                
                <Link
                  to="/conversations"
                  className="group relative inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:text-emerald-600 transition-all duration-300 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-50 to-emerald-100 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-xl"></div>
                  <MessageCircle className="mr-2 h-4 w-4 group-hover:scale-110 group-hover:-rotate-12 transition-all duration-300 relative z-10" />
                  <span className="relative z-10">Messages</span>
                  <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-emerald-500 group-hover:w-full transition-all duration-300"></div>
                </Link>
              </div>
            )}
          </div>

          {/* Right side - Auth links */}
          <div className="flex items-center">
            {user ? (
              <div className="flex items-center space-x-4">
                {/* Enhanced Notification Bell */}
                <div className="relative" ref={notificationRef}>
                  <button
                    onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                    className="relative p-2 rounded-xl hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 transition-all duration-300 group"
                  >
                    <Bell className="w-5 h-5 text-gray-600 group-hover:text-blue-600 group-hover:rotate-12 transition-all duration-300" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse shadow-lg">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {isNotificationOpen && (
                    <div className="absolute right-0 mt-3 w-80 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-200/50 z-50 animate-in slide-in-from-top-5 duration-300">
                      <div className="p-4 border-b border-gray-200/50 flex justify-between items-center">
                        <h3 className="font-semibold text-gray-800 flex items-center">
                          <Bell className="w-4 h-4 mr-2" />
                          Notifications
                        </h3>
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllAsRead}
                            className="text-xs text-blue-500 hover:text-blue-700 px-3 py-1 rounded-full hover:bg-blue-50 transition-all duration-200"
                          >
                            Mark all as read
                          </button>
                        )}
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="p-6 text-center text-gray-500">
                            <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                            <p>No notifications yet</p>
                          </div>
                        ) : (
                          notifications.map((notification, index) => (
                            <div
                              key={notification.id}
                              className={`p-4 border-b border-gray-100/50 last:border-b-0 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 cursor-pointer transition-all duration-200 transform hover:scale-[1.02] ${!notification.is_read ? 'bg-gradient-to-r from-blue-50 to-purple-50' : ''
                                }`}
                              onClick={() => handleNotificationClick(notification)}
                              style={{
                                animationDelay: `${index * 50}ms`
                              }}
                            >
                              <div className="flex justify-between items-start">
                                <p className="text-sm text-gray-800 pr-2">{notification.message}</p>
                                {!notification.is_read && (
                                  <span className="ml-2 flex-shrink-0">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-gray-500 mt-2 flex items-center">
                                <span className="w-1 h-1 bg-gray-400 rounded-full mr-2"></span>
                                {formatTime(notification.created_at)}
                              </p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="hidden md:flex items-center space-x-3">
                  <div className="flex items-center space-x-3 bg-gradient-to-r from-gray-50/80 to-gray-100/80 backdrop-blur-sm rounded-2xl px-4 py-2 border border-gray-200/50 hover:shadow-lg transition-all duration-300 group">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      <User className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors duration-300">
                      Hi, {user?.username || 'User'}
                    </span>
                  </div>
                  
                  <button
                    onClick={handleLogout}
                    className="group flex items-center text-sm font-medium text-gray-600 hover:text-red-600 bg-gradient-to-r from-gray-100/80 to-red-50/80 hover:from-red-50 hover:to-red-100 px-4 py-2 rounded-2xl transition-all duration-300 border border-gray-200/50 hover:border-red-200 hover:shadow-lg transform hover:scale-105"
                  >
                    <LogOut className="h-4 w-4 mr-2 group-hover:scale-110 group-hover:-rotate-12 transition-all duration-300" />
                    Logout
                  </button>
                </div>

                {/* Enhanced Mobile menu button */}
                <button
                  onClick={toggleMobileMenu}
                  className="md:hidden p-2 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 transition-all duration-300 group"
                >
                  {isMobileMenuOpen ? (
                    <X className="h-6 w-6 group-hover:rotate-90 transition-transform duration-300" />
                  ) : (
                    <Menu className="h-6 w-6 group-hover:scale-110 transition-transform duration-300" />
                  )}
                </button>
              </div>
            ) : (
              <div className="flex space-x-3">
                <Link
                  to="/signin"
                  className="inline-flex items-center px-6 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 rounded-xl hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 transition-all duration-300 border border-transparent hover:border-gray-200"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="group relative inline-flex items-center px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-xl hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-700 via-purple-700 to-pink-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <span className="relative z-10 group-hover:scale-105 transition-transform duration-300">Sign Up</span>
                  <div className="absolute inset-0 bg-white/20 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Mobile menu */}
      {user && (
        <div className={`md:hidden bg-white/95 backdrop-blur-xl border-t border-gray-200/50 transition-all duration-500 ease-out ${
          isMobileMenuOpen
            ? 'max-h-[500px] opacity-100 shadow-2xl'
            : 'max-h-0 opacity-0 overflow-hidden'
        }`}>
          <div className="px-4 pt-3 pb-4 space-y-2">
            {[
              { to: '/', icon: Home, label: 'Home', color: 'blue' },
              { to: '/skills', icon: Search, label: 'Browse Skills', color: 'purple' },
              { to: '/addskills', icon: PlusSquare, label: 'Add Skill', color: 'pink' },
              { to: '/conversations', icon: MessageCircle, label: 'Messages', color: 'emerald' }
            ].map((item, index) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={closeMobileMenu}
                className={`group flex items-center px-4 py-3 rounded-xl text-base font-medium text-gray-600 hover:text-${item.color}-600 hover:bg-gradient-to-r hover:from-${item.color}-50 hover:to-${item.color}-100 transition-all duration-300 transform hover:translate-x-2`}
                style={{
                  animationDelay: `${index * 100}ms`
                }}
              >
                <item.icon className="mr-3 h-5 w-5 group-hover:scale-110 transition-all duration-300" />
                {item.label}
              </Link>
            ))}

            {/* Enhanced Mobile user info and logout */}
            <div className="border-t border-gray-200/50 pt-4 mt-4">
              <div className="flex items-center px-4 py-3 mb-2 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mr-3 shadow-lg">
                  <User className="h-5 w-5 text-white" />
                </div>
                <span className="text-base font-medium text-gray-700">
                  {user?.username || 'User'}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="group w-full flex items-center px-4 py-3 rounded-xl text-base font-medium text-gray-600 hover:text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 transition-all duration-300 transform hover:translate-x-2"
              >
                <LogOut className="mr-3 h-5 w-5 group-hover:scale-110 group-hover:-rotate-12 transition-all duration-300" />
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