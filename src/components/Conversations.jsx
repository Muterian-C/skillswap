// components/Conversations.jsx
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { MessageCircle, User, ChevronRight, Clock } from 'lucide-react';

const Conversations = () => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchConversations();
  }, [user]);

  const fetchConversations = async () => {
    if (!user) return;
    
    try {
      const res = await axios.get(
        `https://muterianc.pythonanywhere.com/api/conversations/${user.id}`
      );
      
      if (res.data.success) {
        setConversations(res.data.conversations || []);
      }
    } catch (err) {
      console.error("Error fetching conversations:", err);
    } finally {
      setLoading(false);
    }
  };

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-6">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <div className="h-8 bg-gray-200 rounded-lg w-48 mb-2 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
            </div>
            <div>
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="p-4 border-b border-gray-50 last:border-b-0 animate-pulse">
                  <div className="flex items-center space-x-4">
                    <div className="w-14 h-14 bg-gray-200 rounded-full flex-shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-2">
                        <div className="h-5 bg-gray-200 rounded w-32"></div>
                        <div className="h-3 bg-gray-200 rounded w-16"></div>
                      </div>
                      <div className="h-4 bg-gray-200 rounded w-48"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-white to-gray-50">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">Messages</h1>
                <p className="text-gray-600 text-sm">
                  {conversations.length} {conversations.length === 1 ? 'conversation' : 'conversations'}
                </p>
              </div>
              <div className="p-3 bg-blue-50 rounded-xl">
                <MessageCircle className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Conversations List */}
          {conversations.length === 0 ? (
            <div className="text-center py-16 px-6">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="h-10 w-10 text-blue-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No conversations yet</h3>
              <p className="text-gray-500 max-w-sm mx-auto">
                Start connecting with others by sending your first message
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {conversations.map((conversation) => (
                <Link
                  key={conversation.user_id}
                  to={`/messages/${conversation.user_id}`}
                  className="group flex items-center p-4 hover:bg-gray-50/70 transition-all duration-200 relative"
                >
                  {/* Avatar */}
                  <div className={`w-14 h-14 bg-gradient-to-br ${getAvatarGradient(conversation.user_id)} rounded-full flex items-center justify-center flex-shrink-0 shadow-sm group-hover:shadow-md transition-shadow duration-200`}>
                    {conversation.avatar ? (
                      <img 
                        src={conversation.avatar} 
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

                  {/* Unread indicator (if you have unread count) */}
                  {conversation.unread_count > 0 && (
                    <div className="absolute right-2 top-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    </div>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {conversations.length > 0 && (
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-400">
              All conversations are end-to-end encrypted
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Conversations;