// src/socket.js
import { io } from "socket.io-client";

// Change the URL to match your backend server
const socket = io("http://localhost:5000", {
  transports: ["websocket"],
});

export default socket;
