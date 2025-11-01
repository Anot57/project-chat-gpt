import { createSlice } from '@reduxjs/toolkit';

const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    chats: [],
    activeChatId: null,
    isSending: false,
    input: ''
  },
  reducers: {
    startNewChat: {
      reducer(state, action) {
        const { _id, title } = action.payload;
        state.chats.unshift({ _id, title: title || 'New Chat', messages: [] });
        state.activeChatId = _id;
      }
    },
    selectChat(state, action) {
      state.activeChatId = action.payload;
    },
    setInput(state, action) {
      state.input = action.payload;
    },
    sendingStarted(state) {
      state.isSending = true;
    },
    sendingFinished(state) {
      state.isSending = false;
    },
    setChats(state, action) {
      state.chats = action.payload;

      // ✅ Automatically select first chat if not already selected
      if (!state.activeChatId && action.payload.length > 0) {
        state.activeChatId = action.payload[0]._id;
      }
    }
  }
});

export const {
  startNewChat,
  selectChat,
  setInput,
  sendingStarted,
  sendingFinished,
  setChats
} = chatSlice.actions;

export default chatSlice.reducer;
