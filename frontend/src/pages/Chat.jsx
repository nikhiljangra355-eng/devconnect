import React from "react";
import { Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api/client.js";
import Avatar from "../components/Avatar.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { connectSocket } from "../socket/socket.js";

const Chat = () => {
  const { user, token } = useAuth();
  const { userId } = useParams();
  const [otherUser, setOtherUser] = useState(null);
  const [roomId, setRoomId] = useState("");
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [onlineUsers, setOnlineUsers] = useState([]);
  const bottomRef = useRef(null);

  useEffect(() => {
    const load = async () => {
      const [{ data: profile }, { data: history }] = await Promise.all([
        api.get(`/users/${userId}`),
        api.get(`/chats/${userId}/messages`)
      ]);
      setOtherUser(profile);
      setRoomId(history.roomId);
      setMessages(history.messages);
    };

    load();
  }, [userId]);

  useEffect(() => {
    if (!token || !userId) return;

    const socket = connectSocket(token);
    socket.emit("room:join", { otherUserId: userId });

    const handleMessage = (message) => {
      setMessages((current) => (current.some((item) => item._id === message._id) ? current : [...current, message]));
    };

    const handlePresence = (payload) => {
      setOnlineUsers(payload.map((item) => item.userId));
    };

    socket.on("message:received", handleMessage);
    socket.on("presence:online", handlePresence);

    return () => {
      socket.off("message:received", handleMessage);
      socket.off("presence:online", handlePresence);
    };
  }, [token, userId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = (event) => {
    event.preventDefault();
    if (!text.trim()) return;

    const socket = connectSocket(token);
    socket.emit("message:send", { receiverId: userId, text });
    setText("");
  };

  const isOnline = onlineUsers.includes(userId);

  return (
    <main className="page chat-page">
      <section className="chat-shell">
        <header className="chat-head">
          {otherUser && <Avatar user={otherUser} />}
          <div>
            <h1>{otherUser?.name || "Chat"}</h1>
            <p className={isOnline ? "online" : "offline"}>{isOnline ? "Online" : "Offline"}</p>
          </div>
          <Link className="button ghost" to={`/profile/${userId}`}>
            View profile
          </Link>
        </header>

        <div className="message-list">
          {messages.map((message) => {
            const mine = message.sender?._id === user._id || message.sender === user._id;

            return (
              <div key={message._id} className={`message ${mine ? "mine" : ""}`}>
                <p>{message.text}</p>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        <form className="chat-form" onSubmit={send}>
          <input value={text} onChange={(event) => setText(event.target.value)} placeholder={`Message ${otherUser?.name || ""}`} />
          <button>
            <Send size={18} />
            Send
          </button>
        </form>
      </section>
      <aside className="chat-context">
        <h2>Room</h2>
        <p>{roomId}</p>
        <h2>How it works</h2>
        <p>Messages are saved in MongoDB and delivered instantly through the joined Socket.io room.</p>
      </aside>
    </main>
  );
};

export default Chat;
