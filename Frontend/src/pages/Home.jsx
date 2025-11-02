import React, { useEffect, useState } from 'react';
import { io } from "socket.io-client";
import ChatMobileBar from '../components/chat/ChatMobileBar.jsx';
import ChatSidebar from '../components/chat/ChatSidebar.jsx';
import ChatMessages from '../components/chat/ChatMessages.jsx';
import ChatComposer from '../components/chat/ChatComposer.jsx';
import '../components/chat/ChatLayout.css';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import {
  startNewChat,
  selectChat,
  setInput,
  sendingStarted,
  sendingFinished,
  setChats
} from '../store/chatSlice.js';

const Home = () => {
  const dispatch = useDispatch();
  const chats = useSelector(state => state.chat.chats);
  const activeChatId = useSelector(state => state.chat.activeChatId);
  const input = useSelector(state => state.chat.input);
  const isSending = useSelector(state => state.chat.isSending);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);

  // ✅ Get backend URLs from environment
  // const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
  const API_URL = import.meta.env.VITE_API_URL || window.location.origin;
  const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:3000";

  const activeChat = chats.find(c => c._id === activeChatId) || null;

  // ✅ Start a new chat
  const handleNewChat = async () => {
    let title = window.prompt('Enter a title for the new chat:', '');
    if (title) title = title.trim();
    if (!title) return;

    try {
      const response = await axios.post(
        `${API_URL}/api/chat`,
        { title },
        { withCredentials: true }
      );
      getMessages(response.data.chat._id);
      dispatch(startNewChat(response.data.chat));
      setSidebarOpen(false);
    } catch (err) {
      console.error("❌ Error creating chat:", err);
    }
  };

  // ✅ Fetch chats & connect socket
  useEffect(() => {
    axios
      .get(`${API_URL}/api/chat`, { withCredentials: true })
      .then(async (response) => {
        const chatList = response.data.chats.reverse();
        dispatch(setChats(chatList));

        if (chatList.length > 0) {
          const firstChatId = chatList[0]._id;
          dispatch(selectChat(firstChatId));
          await getMessages(firstChatId);
        } else {
          await handleNewChat();
        }
      })
      .catch((err) => {
        console.error("❌ Error fetching chats:", err);
      });

    // ✅ Socket.io connection fix for Render
    console.log("🌍 API_URL =", API_URL);
    console.log("🔌 SOCKET_URL =", SOCKET_URL);

    const tempSocket = io(SOCKET_URL, {
      withCredentials: true,
      transports: ["websocket"], // Force WebSocket to avoid CORS issues
    });

    tempSocket.on("connect", () => {
      console.log("✅ Socket connected:", tempSocket.id);
    });

    tempSocket.on("connect_error", (err) => {
      console.error("❌ Socket connection error:", err);
    });

    tempSocket.on("ai-response", (messagePayload) => {
      console.log("🤖 Received AI response:", messagePayload);
      setMessages((prevMessages) => [
        ...prevMessages,
        { type: "ai", content: messagePayload.content },
      ]);
      dispatch(sendingFinished());
    });

    setSocket(tempSocket);
    return () => tempSocket.disconnect();
  }, []);

  // ✅ Send a message
  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || !activeChatId || isSending) return;
    dispatch(sendingStarted());

    setMessages(prev => [...prev, { type: "user", content: trimmed }]);
    dispatch(setInput(""));

    if (socket && socket.connected) {
      socket.emit("ai-message", {
        chat: activeChatId,
        content: trimmed,
      });
    } else {
      console.error("⚠️ Socket not connected, message not sent.");
    }
  };

  // ✅ Fetch chat messages
  const getMessages = async (chatId) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/chat/messages/${chatId}`,
        { withCredentials: true }
      );

      setMessages(
        response.data.messages.map((m) => ({
          type: m.role === "user" ? "user" : "ai",
          content: m.content,
        }))
      );
    } catch (err) {
      console.error("❌ Error fetching messages:", err);
    }
  };

  return (
    <div className="chat-layout minimal">
      <ChatMobileBar
        onToggleSidebar={() => setSidebarOpen((o) => !o)}
        onNewChat={handleNewChat}
      />
      <ChatSidebar
        chats={chats}
        activeChatId={activeChatId}
        onSelectChat={(id) => {
          dispatch(selectChat(id));
          setSidebarOpen(false);
          getMessages(id);
        }}
        onNewChat={handleNewChat}
        open={sidebarOpen}
      />
      <main className="chat-main" role="main">
        {messages.length === 0 && (
          <div className="chat-welcome" aria-hidden="true">
            <div className="chip">Early Preview</div>
            <h1>ChatGPT Clone</h1>
            <p>
              Ask anything. Paste text, brainstorm ideas, or get quick explanations.
              Your chats stay in the sidebar so you can pick up where you left off.
            </p>
          </div>
        )}
        <ChatMessages messages={messages} isSending={isSending} />
        {activeChatId && (
          <ChatComposer
            input={input}
            setInput={(v) => dispatch(setInput(v))}
            onSend={sendMessage}
            isSending={isSending}
          />
        )}
      </main>
      {sidebarOpen && (
        <button
          className="sidebar-backdrop"
          aria-label="Close sidebar"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Home;
