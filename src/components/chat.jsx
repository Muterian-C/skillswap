import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const Messages = () => {
  const { receiverId } = useParams(); // receiver id from URL
  const { user } = useContext(AuthContext); // logged-in user
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  // Fetch conversation
  const fetchMessages = async () => {
    try {
      const res = await axios.get(
        `https://muterianc.pythonanywhere.com//api/get_messages/${receiverId}`,
        { params: { user_id: user.id } }
      );
      setMessages(res.data.messages);
    } catch (err) {
      console.error("Error fetching messages:", err);
    }
  };

  // Load messages on mount
  useEffect(() => {
    fetchMessages();
  }, [receiverId]);

  // Send new message
  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      await axios.post("https://muterianc.pythonanywhere.com//api/send_message", {
        sender_id: user.id,
        receiver_id: receiverId,
        message: newMessage,
      });
      setNewMessage("");
      fetchMessages(); // refresh
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  return (
    <div className="chat-container" style={{ maxWidth: "600px", margin: "auto" }}>
      <h2>Chat with User {receiverId}</h2>

      <div className="chat-box" style={{ border: "1px solid #ddd", padding: "10px", height: "400px", overflowY: "auto" }}>
        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              textAlign: msg.sender_id === user.id ? "right" : "left",
              margin: "5px 0",
            }}
          >
            <span
              style={{
                background: msg.sender_id === user.id ? "#dcf8c6" : "#fff",
                padding: "8px 12px",
                borderRadius: "15px",
                display: "inline-block",
              }}
            >
              {msg.message}
            </span>
          </div>
        ))}
      </div>

      <form onSubmit={handleSend} style={{ marginTop: "10px", display: "flex" }}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          className="flex-grow"
          style={{ flex: 1, padding: "8px" }}
        />
        <button type="submit" style={{ padding: "8px 16px" }}>
          Send
        </button>
      </form>
    </div>
  );
};

export default Messages;
