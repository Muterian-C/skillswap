// components/Conversations.jsx (SIMPLIFIED)
import { Link } from 'react-router-dom';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { MessageCircle, Plus, AlertCircle, Search, Wifi, WifiOff, User, Clock, ChevronRight } from 'lucide-react';
import Navbar from './Navbar';
import ConversationSkeleton from './ConversationSkeleton';

// ConversationItem component (simplified - no delete)
const ConversationItem = ({ conversation }) => {
  const getLastMessageTime = (timestamp) => {
    if (!timestamp) return '';

    const now = new Date();
    const messageTime = new Date(timestamp);
    const diffInHours = (now - messageTime) / (1000 * 60 * 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInHours < 1) {
      return 'now';
    } else if (diffInHours < 24) {
      return messageTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInDays === 1) {
      return 'yesterday';
    } else if (diffInDays < 7) {
      return `${diffInDays}d ago`;
    } else {
      return messageTime.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const getInitials = (username) => {
    return username
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const getAvatarGradient = (userId) => {
    const gradients = [
      'from-blue-500 to-blue-600',
      'from-purple-500 to-purple-600',
      'from-green-500 to-emerald-600',
      'from-pink-500 to-rose-600',
      'from-indigo-500 to-purple-600',
      'from-teal-500 to-cyan-600',
      'from-orange-500 to-red-500',
      'from-violet-500 to-purple-600',
    ];
    return gradients[userId % gradients.length];
  };

  return (
    <Link
      to={`/messages/${conversation.user_id}`}
      className="group flex items-center p-4 hover:bg-gray-50/70 transition-all duration-200 relative"
      aria-label={`Conversation with ${conversation.username}`}
    >
      {/* Avatar */}
      <div className={`w-14 h-14 bg-gradient-to-br ${getAvatarGradient(conversation.user_id)} rounded-full flex items-center justify-center flex-shrink-0 shadow-sm group-hover:shadow-md transition-shadow duration-200`}>
        {conversation.profile_picture ? (
          <img
            src={conversation.profile_picture}
            alt={conversation.username}
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          <span className="text-white font-semibold text-lg">
            {getInitials(conversation.username)}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="ml-4 flex-1 min-w-0">
        <div className="flex justify-between items-start mb-1">
          <h3 className="font-semibold text-gray-900 truncate group-hover:text-gray-700 transition-colors">
            {conversation.username}
          </h3>
          <div className="flex items-center text-xs text-gray-500 ml-3">
            <Clock className="h-3 w-3 mr-1 opacity-60" />
            <span className="whitespace-nowrap">
              {getLastMessageTime(conversation.last_message_time)}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600 truncate pr-4 leading-relaxed">
            {conversation.last_message || (
              <span className="italic text-gray-400">No messages yet</span>
            )}
          </p>
        </div>
      </div>

      {/* Arrow Icon */}
      <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-gray-400 transition-colors flex-shrink-0" />

      {/* Unread indicator */}
      {conversation.unread_count > 0 && (
        <div className="absolute right-4 top-4">
          <div 
            className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-xs text-white font-semibold"
            aria-label={`${conversation.unread_count} unread messages`}
          >
            {conversation.unread_count > 9 ? '9+' : conversation.unread_count}
          </div>
        </div>
      )}
    </Link>
  );
};

// Main Conversations component (simplified)
const Conversations = () => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const { user } = useAuth();

  // Connection status listener
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const fetchConversations = useCallback(async (pageNum = 1, isRefresh = false) => {
    if (!user) return;

    try {
      if (pageNum === 1 || isRefresh) {
        setLoading(true);
      }
      setError(null);
      
      const token = localStorage.getItem('token');
      const res = await axios.get(
        `https://muterianc.pythonanywhere.com/api/conversations/${user.id}?page=${pageNum}&limit=20`,
        {
          timeout: 10000,
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (res.data.success) {
        if (pageNum === 1 || isRefresh) {
          setConversations(res.data.conversations || []);
        } else {
          setConversations(prev => [...prev, ...res.data.conversations]);
        }
        setHasMore(res.data.pagination && pageNum < res.data.pagination.pages);
        setPage(pageNum + 1);
      } else {
        setError(res.data.message || 'Failed to load conversations');
      }

    } catch (err) {
      console.error("Error fetching conversations:", err);
      if (err.code === 'ECONNABORTED') {
        setError('Request timeout - please check your connection');
      } else if (err.response?.status === 401) {
        setError('Session expired - please log in again');
      } else if (err.response?.status === 500) {
        setError('Server error - please try again later');
      } else {
        setError(err.response?.data?.error || 'Unable to load conversations');
      }
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchConversations(1, true);
    
    // Set up interval for refreshing conversations
    const intervalId = setInterval(() => fetchConversations(1, true), 30000);
    
    return () => clearInterval(intervalId);
  }, [fetchConversations]);

  const handleRetry = useCallback(() => {
    fetchConversations(1, true);
  }, [fetchConversations]);

  const handleLoadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchConversations(page);
    }
  }, [loading, hasMore, page, fetchConversations]);

  const filteredConversations = useMemo(() => {
    return conversations.filter(conv =>
      conv.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.last_message?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [conversations, searchTerm]);

  if (loading && conversations.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <Navbar />
        <div className="h-16"></div>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <ConversationSkeleton count={5} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <Navbar />
      <div className="h-16"></div>
      
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Connection Status */}
        {!isOnline && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 mb-6 flex items-center shadow-sm">
            <WifiOff className="h-5 w-5 text-yellow-500 mr-3 flex-shrink-0" />
            <p className="text-yellow-800">You are currently offline. Some features may be limited.</p>
          </div>
        )}

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden mb-6">
          <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-white to-gray-50">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">Messages</h1>
                <p className="text-gray-600 text-sm">
                  {conversations.length} {conversations.length === 1 ? 'conversation' : 'conversations'}
                  {isOnline && <Wifi className="h-4 w-4 text-green-500 inline-block ml-2" />}
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <Link
                  to="/search"
                  className="p-3 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors shadow-sm hover:shadow-md"
                  aria-label="Start new conversation"
                >
                  <Plus className="h-6 w-6 text-blue-600" />
                </Link>
                <div className="p-3 bg-blue-50 rounded-xl shadow-sm">
                  <MessageCircle className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          {conversations.length > 0 && (
            <div className="p-4 border-b border-gray-100">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 pl-10 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
                <Search className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6 flex items-start shadow-sm">
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-red-800">{error}</p>
              <button
                onClick={handleRetry}
                className="mt-2 text-red-700 font-medium hover:underline flex items-center"
              >
                Try again
              </button>
            </div>
          </div>
        )}

        {/* Conversations List */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden">
          {filteredConversations.length === 0 && !loading ? (
            <div className="text-center py-16 px-6">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                <MessageCircle className="h-10 w-10 text-blue-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchTerm ? 'No matching conversations' : 'No conversations yet'}
              </h3>
              <p className="text-gray-500 max-w-sm mx-auto mb-4">
                {searchTerm 
                  ? 'Try adjusting your search terms' 
                  : 'Start connecting with others by sending your first message'
                }
              </p>
              {!searchTerm && (
                <Link
                  to="/search"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Start a conversation
                </Link>
              )}
            </div>
          ) : (
            <>
              <div className="divide-y divide-gray-50">
                {filteredConversations.map((conversation) => (
                  <ConversationItem 
                    key={conversation.id || conversation.user_id} 
                    conversation={conversation}
                  />
                ))}
              </div>
              
              {/* Load More Button */}
              {hasMore && (
                <div className="p-4 border-t border-gray-100 text-center">
                  <button
                    onClick={handleLoadMore}
                    disabled={loading}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors shadow-sm hover:shadow-md"
                  >
                    {loading ? 'Loading...' : 'Load more conversations'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {conversations.length > 0 && (
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-400 flex items-center justify-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              All conversations are end-to-end encrypted
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Conversations;