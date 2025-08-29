// components/ConversationItem.jsx
import { Link } from 'react-router-dom';
import { ChevronRight, Clock } from 'lucide-react';

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

      {/* Unread indicator */}
      {conversation.unread_count > 0 && (
        <div className="absolute right-8 top-4">
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

export default ConversationItem;