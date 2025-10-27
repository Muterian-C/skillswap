import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Send, ArrowLeft, MoreVertical } from "lucide-react";

const Messages = () => {
  const { receiverId } = useParams();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [receiverUsername, setReceiverUsername] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch receiver's username
  const fetchReceiverUsername = async () => {
    try {
      const res = await axios.get(
        `https://muterianc.pythonanywhere.com/api/user/${receiverId}`
      );
      setReceiverUsername(res.data.username || `User ${receiverId}`);
    } catch (err) {
      console.error("Error fetching receiver username:", err);
      setReceiverUsername(`User ${receiverId}`); // Fallback to ID if error
    }
  };

  // Fetch conversation
  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem('token');

      const res = await axios.get(
        `https://muterianc.pythonanywhere.com/api/get_messages/${receiverId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      setMessages(res.data.messages);
      setIsLoading(false);
    } catch (err) {
      console.error("Error fetching messages:", err);
      setIsLoading(false);
    }
  };

  // Fetch receiver username and messages on component mount
  useEffect(() => {
    fetchReceiverUsername();
    fetchMessages();

    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [receiverId]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending) return;

    setIsSending(true);

    try {
      // Get the token from localStorage (or wherever you store it in AuthContext)
      const token = localStorage.getItem('token');

      await axios.post(
        "https://muterianc.pythonanywhere.com/api/send_message",
        {
          receiver_id: receiverId,
          message: newMessage,
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      setNewMessage("");
      fetchMessages(); // refresh messages
      inputRef.current?.focus();
    } catch (err) {
      console.error("Error sending message:", err);
      // Add error handling UI feedback here if needed
      alert("Failed to send message. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 shadow-sm">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center space-x-3">
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors md:hidden">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>

            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {receiverUsername.charAt(0).toUpperCase()}
                </span>
              </div>

              <div>
                <h1 className="font-semibold text-gray-900">{receiverUsername}</h1>
                <p className="text-sm text-green-500">Online</p>
              </div>
            </div>
          </div>

          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <MoreVertical className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full max-w-4xl mx-auto flex flex-col">
          <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                  <span className="text-2xl text-gray-400">💬</span>
                </div>
                <p className="text-gray-500 text-lg font-medium">No messages yet</p>
                <p className="text-gray-400 text-sm mt-1">Start a conversation with {receiverUsername}</p>
              </div>
            ) : (
              <>
                {messages.map((msg, index) => {
                  const isCurrentUser = msg.sender_id === user.id;
                  const showAvatar = index === 0 || messages[index - 1].sender_id !== msg.sender_id;

                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isCurrentUser ? "justify-end" : "justify-start"} ${showAvatar ? "mt-4" : "mt-1"
                        }`}
                    >
                      <div className={`flex max-w-xs lg:max-w-md ${isCurrentUser ? "flex-row-reverse" : "flex-row"} items-end space-x-2`}>
                        {!isCurrentUser && (
                          <div className={`w-8 h-8 rounded-full flex-shrink-0 ${showAvatar ? "" : "invisible"}`}>
                            <div className="w-full h-full bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs font-medium">
                                {receiverUsername.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>
                        )}

                        <div className={`${isCurrentUser ? "mr-2" : "ml-2"}`}>
                          <div
                            className={`px-4 py-2 rounded-2xl shadow-sm ${isCurrentUser
                                ? "bg-blue-500 text-white rounded-br-md"
                                : "bg-white text-gray-900 border border-gray-200 rounded-bl-md"
                              }`}
                          >
                            <p className="text-sm leading-relaxed">{msg.message}</p>
                          </div>

                          <div className={`mt-1 ${isCurrentUser ? "text-right" : "text-left"}`}>
                            <span className="text-xs text-gray-500">
                              {formatTime(msg.created_at)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Message Input */}
          <div className="border-t border-gray-200 bg-white px-4 py-4">
            <div className="flex items-end space-x-3">
              <div className="flex-1 relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend(e);
                    }
                  }}
                  placeholder={`Message ${receiverUsername}...`}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  disabled={isSending}
                />
              </div>

              <button
                onClick={handleSend}
                disabled={!newMessage.trim() || isSending}
                className={`p-3 rounded-full transition-all duration-200 ${newMessage.trim() && !isSending
                    ? "bg-blue-500 hover:bg-blue-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
              >
                {isSending ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;