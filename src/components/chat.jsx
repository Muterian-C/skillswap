import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Messages = () => {
  const { receiverId } = useParams();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [receiverUsername, setReceiverUsername] = useState("");

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
      const res = await axios.get(
        `https://muterianc.pythonanywhere.com/api/get_messages/${receiverId}`,
        { params: { user_id: user.id } }
      );
      setMessages(res.data.messages);
    } catch (err) {
      console.error("Error fetching messages:", err);
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
    if (!newMessage.trim()) return;

    try {
      await axios.post("https://muterianc.pythonanywhere.com/api/send_message", {
        sender_id: user.id,
        receiver_id: receiverId,
        message: newMessage,
      });
      setNewMessage("");
      fetchMessages(); // refresh messages
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  return (
    <div className="chat-container" style={{ maxWidth: "600px", margin: "auto" }}>
      <h2>Chat with {receiverUsername}</h2>

      <div className="chat-box" style={{ border: "1px solid #ddd", padding: "10px", height: "400px", overflowY: "auto" }}>
        {messages.length === 0 ? (
          <p style={{ textAlign: "center", color: "#666" }}>No messages yet</p>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              style={{
                textAlign: msg.sender_id === user.id ? "right" : "left",
                margin: "10px 0",
              }}
            >
              <div
                style={{
                  background: msg.sender_id === user.id ? "#dcf8c6" : "#f1f0f0",
                  padding: "8px 12px",
                  borderRadius: "15px",
                  display: "inline-block",
                  maxWidth: "70%",
                }}
              >
                <p style={{ margin: 0 }}>{msg.message}</p>
                <small style={{ fontSize: "10px", color: "#666" }}>
                  {new Date(msg.created_at).toLocaleTimeString()}
                </small>
              </div>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleSend} style={{ marginTop: "10px", display: "flex", gap: "10px" }}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          style={{ flex: 1, padding: "10px", borderRadius: "20px", border: "1px solid #ddd" }}
        />
        <button 
          type="submit" 
          style={{ 
            padding: "10px 20px", 
            borderRadius: "20px", 
            border: "none", 
            background: "#007bff", 
            color: "white",
            cursor: "pointer"
          }}
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default Messages;