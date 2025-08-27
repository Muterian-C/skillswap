import React, { useEffect, useState, useRef } from "react";
import { Send, User } from "lucide-react";
import io from "socket.io-client";

const Chat = ({ otherUserId = "user123", user = { username: "You", id: null }, token }) => {
  const [text, setText] = useState("");
  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Fetch message history when component mounts or otherUserId changes
    const fetchMessageHistory = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/messages/${otherUserId}`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          // Format messages for display
          const formattedMessages = data.messages.map(msg => ({
            username: msg.sender_id === user.id ? "You" : `User${msg.sender_id}`,
            msg: msg.content
          }));
          setMessages(formattedMessages);
        } else {
          console.error("Failed to fetch message history");
        }
      } catch (error) {
        console.error("Error fetching message history:", error);
      }
    };

    if (otherUserId && token) {
      fetchMessageHistory();
    }
  }, [otherUserId, token, user.id]);

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io("http://localhost:5000", {
      auth: {
        token: token
      }
    });
    
    setSocket(newSocket);
    
    newSocket.on("connect", () => {
      console.log("Connected to server");
      setIsConnected(true);
      
      // Join the room once connected
      if (user && otherUserId) {
        newSocket.emit("join", { 
          room: `chat_${otherUserId}`, 
          username: user.username 
        });
      }
    });
    
    newSocket.on("disconnect", () => {
      console.log("Disconnected from server");
      setIsConnected(false);
    });
    
    newSocket.on("chat_message", (data) => {
      setMessages((prev) => [...prev, data]);
    });
    
    newSocket.on("message", (data) => {
      console.log("Server message:", data.msg);
    });
    
    newSocket.on("error", (error) => {
      console.error("Socket error:", error);
    });

    // Clean up on unmount
    return () => {
      newSocket.disconnect();
    };
  }, [otherUserId, user, token]);

  const sendMessage = () => {
    if (text.trim() === "" || !socket) return;

    // Emit chat_message
    socket.emit("chat_message", { 
      room: `chat_${otherUserId}`, 
      msg: text, 
      username: user.username 
    });

    // Clear input field
    setText("");
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto bg-white border border-gray-200 rounded-lg shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-medium text-gray-900">Chat</h2>
            <p className="text-sm text-gray-500">
              {isConnected ? "Online" : "Offline"}
            </p>
          </div>
        </div>
        <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            No messages yet. Start a conversation!
          </div>
        ) : (
          messages.map((m, i) => {
            const isOwnMessage = m.username === user.username;
            
            return (
              <div 
                key={i} 
                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                  isOwnMessage 
                    ? 'bg-blue-500 text-white rounded-br-sm' 
                    : 'bg-gray-100 text-gray-900 rounded-bl-sm'
                }`}>
                  {!isOwnMessage && (
                    <p className="text-xs font-medium text-gray-600 mb-1">
                      {m.username}
                    </p>
                  )}
                  <p className="text-sm leading-relaxed break-words">
                    {m.msg}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="px-4 py-4 border-t border-gray-100 bg-white">
        <div className="flex items-end space-x-3">
          <div className="flex-1 relative">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              rows={1}
              className="w-full px-4 py-3 text-sm border border-gray-200 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
              style={{
                minHeight: '44px',
                maxHeight: '120px'
              }}
            />
          </div>
          <button
            onClick={sendMessage}
            disabled={text.trim() === "" || !isConnected}
            className="flex items-center justify-center w-11 h-11 bg-blue-500 text-white rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;