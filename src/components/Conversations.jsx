// components/Conversations.jsx
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { MessageCircle, User } from 'lucide-react';

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
      // This endpoint would need to be created in your backend
      // It should return all unique users that the current user has messaged with
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
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <div className="animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center p-4 border-b border-gray-200">
              <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
              <div className="ml-4 flex-1">
                <div className="h-4 bg-gray-300 rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-gray-300 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Conversations</h1>
      
      {conversations.length === 0 ? (
        <div className="text-center py-12">
          <MessageCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-500">No conversations yet</p>
          <p className="text-sm text-gray-400 mt-1">Start a conversation by messaging someone</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow border border-gray-200">
          {conversations.map((conversation) => (
            <Link
              key={conversation.user_id}
              to={`/messages/${conversation.user_id}`}
              className="flex items-center p-4 border-b border-gray-200 hover:bg-gray-50 transition-colors last:border-b-0"
            >
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mr-4">
                <User className="h-6 w-6 text-white" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-semibold text-gray-800 truncate">
                    {conversation.username}
                  </h3>
                  <span className="text-xs text-gray-500 whitespace-nowrap">
                    {getLastMessageTime(conversation.last_message_time)}
                  </span>
                </div>
                
                <p className="text-sm text-gray-600 truncate">
                  {conversation.last_message || 'No messages yet'}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Conversations;