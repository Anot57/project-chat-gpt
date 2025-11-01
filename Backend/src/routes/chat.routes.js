const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chat.controller");

// 🚧 TEMPORARILY disable auth for testing
router.post("/", chatController.createChat);
router.get("/", chatController.getChats);
router.get("/messages/:id", chatController.getMessages);

module.exports = router;
