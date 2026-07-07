import Message from "../models/Message.js";

export const buildRoomId = (userA, userB) => {
  return [String(userA), String(userB)].sort().join(":");
};

export const getMessages = async (req, res, next) => {
  try {
    const roomId = buildRoomId(req.user._id, req.params.userId);
    const messages = await Message.find({ roomId })
      .populate("sender", "name profilePicture")
      .populate("receiver", "name profilePicture")
      .sort({ createdAt: 1 })
      .limit(100);

    res.json({ roomId, messages });
  } catch (error) {
    next(error);
  }
};
