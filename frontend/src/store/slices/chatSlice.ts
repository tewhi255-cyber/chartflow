import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Conversation, Message } from '../../types';

interface ChatState {
  conversations: Conversation[];
  activeConversation: Conversation | null;
  messages: Record<string, Message[]>;
  isLoading: boolean;
}

const initialState: ChatState = {
  conversations: [],
  activeConversation: null,
  messages: {},
  isLoading: false,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setConversations: (state, action: PayloadAction<Conversation[]>) => {
      state.conversations = action.payload;
    },
    addConversation: (state, action: PayloadAction<Conversation>) => {
      const exists = state.conversations.find(c => c.id === action.payload.id);
      if (!exists) {
        state.conversations.unshift(action.payload);
      }
    },
    setActiveConversation: (state, action: PayloadAction<Conversation | null>) => {
      state.activeConversation = action.payload;
    },
    setMessages: (state, action: PayloadAction<{ conversationId: string; messages: Message[] }>) => {
      state.messages[action.payload.conversationId] = action.payload.messages;
    },
    addMessage: (state, action: PayloadAction<Message>) => {
      const { conversation_id } = action.payload;
      if (state.messages[conversation_id]) {
        state.messages[conversation_id].push(action.payload);
      } else {
        state.messages[conversation_id] = [action.payload];
      }

      const convIndex = state.conversations.findIndex(c => c.id === conversation_id);
      if (convIndex !== -1) {
        state.conversations[convIndex].last_message = action.payload.content;
        state.conversations[convIndex].last_message_at = action.payload.created_at;
        const [conv] = state.conversations.splice(convIndex, 1);
        state.conversations.unshift(conv);
      }
    },
    updateConversationUnread: (state, action: PayloadAction<{ conversationId: string; count: number }>) => {
      const conv = state.conversations.find(c => c.id === action.payload.conversationId);
      if (conv) conv.unread_count = action.payload.count;
    },
  },
});

export const {
  setConversations,
  addConversation,
  setActiveConversation,
  setMessages,
  addMessage,
  updateConversationUnread,
} = chatSlice.actions;

export default chatSlice.reducer;
