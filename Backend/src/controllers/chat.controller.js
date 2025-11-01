const chatModel = require("../models/chat.model");

// ✅ Create a new chat
exports.createChat = async (req, res) => {
  try {
    const newChat = await chatModel.create({
      title: req.body.title || "Untitled Chat",
      messages: [], // initially empty
      // user: req.user?._id (disabled)
    });

    return res.status(201).json({ chat: newChat });
  } catch (err) {
    console.error("❌ Error in createChat:", err);
    return res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};

// ✅ Get all chats
exports.getChats = async (req, res) => {
  try {
    const chats = await chatModel.find().sort({ createdAt: -1 });
    return res.status(200).json({ chats });
  } catch (err) {
    console.error("❌ Error in getChats:", err);
    return res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};

// ✅ Get messages for one chat
exports.getMessages = async (req, res) => {
  try {
    const chat = await chatModel.findById(req.params.id);
    if (!chat) return res.status(404).json({ message: "Chat not found" });
    return res.status(200).json({ messages: chat.messages });
  } catch (err) {
    console.error("❌ Error in getMessages:", err);
    return res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};
