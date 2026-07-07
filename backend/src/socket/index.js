import jwt from "jsonwebtoken";
import Message from "../models/Message.js";
import User from "../models/User.js";
import { buildRoomId } from "../controllers/chatController.js";

const onlineUsers = new Map();

const getOnlinePayload = () =>
  Array.from(onlineUsers.entries()).map(([userId, socketId]) => ({ userId, socketId }));

const registerSocketHandlers = (io) => {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;

      if (!token) {
        throw new Error("Socket token missing");
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select("-password");

      if (!user) {
        throw new Error("Socket user not found");
      }

      socket.user = user;
      next();
    } catch (error) {
      next(error);
    }
  });

  io.on("connection", (socket) => {
    const userId = String(socket.user._id);
    onlineUsers.set(userId, socket.id);
    io.emit("presence:online", getOnlinePayload());

    socket.on("room:join", ({ otherUserId }) => {
      const roomId = buildRoomId(userId, otherUserId);
      socket.join(roomId);
      socket.emit("room:joined", { roomId });
    });

    socket.on("message:send", async ({ receiverId, text }) => {
      if (!receiverId || !text?.trim()) return;

      const roomId = buildRoomId(userId, receiverId);
      const message = await Message.create({
        roomId,
        sender: userId,
        receiver: receiverId,
        text: text.trim()
      });

      const populated = await Message.findById(message._id)
        .populate("sender", "name profilePicture")
        .populate("receiver", "name profilePicture");

      io.to(roomId).emit("message:received", populated);
    });

    socket.on("disconnect", () => {
      onlineUsers.delete(userId);
      io.emit("presence:online", getOnlinePayload());
    });
  });
};

export default registerSocketHandlers;
