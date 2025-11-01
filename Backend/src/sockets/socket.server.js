// src/sockets/socket.server.js
const { Server } = require("socket.io");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const chatModel = require("../models/chat.model");

// ✅ Initialize Gemini client using your .env API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" }); // ← updated

function initSocketServer(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: "http://localhost:5174",
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("🟢 Client connected:", socket.id);

    // ✅ Handle messages from frontend
    socket.on("ai-message", async (messagePayload) => {
      try {
        const { chat, content } = messagePayload;
        if (!chat || !content) {
          socket.emit("ai-response", {
            content: "⚠️ Invalid message payload — missing chat or content.",
          });
          return;
        }

        console.log(`💬 Received: "${content}" for chat ${chat}`);

        // 🧠 Ask Gemini for response
        const result = await model.generateContent(content);
        const aiText = result?.response?.text?.() || "⚠️ No response from model.";

        // 💾 Save both user + AI messages in MongoDB
        await chatModel.findByIdAndUpdate(chat, {
          $push: {
            messages: [
              { role: "user", content },
              { role: "ai", content: aiText },
            ],
          },
        });

        // 🚀 Send response to frontend
        socket.emit("ai-response", { content: aiText, chat });
        console.log(`✅ Sent response for chat ${chat}`);
      } catch (err) {
        console.error("❌ Error generating AI response:", err.message);
        socket.emit("ai-response", {
          content: "⚠️ Error generating AI response. Check backend logs.",
        });
      }
    });

    socket.on("disconnect", () => {
      console.log("🔴 Client disconnected:", socket.id);
    });
  });
}

module.exports = initSocketServer;
