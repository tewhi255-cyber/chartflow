import { useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { connectSocket, disconnectSocket, getSocket } from '../services/socket';
import { addMessage } from '../store/slices/chatSlice';

export const useSocket = (token: string | null) => {
  const dispatch = useDispatch();

  useEffect(() => {
    if (!token) {
      disconnectSocket();
      return;
    }

    const socket = connectSocket(token);

    socket.on('message:new', (message: any) => {
      dispatch(addMessage(message));
    });

    return () => {
      disconnectSocket();
    };
  }, [token, dispatch]);

  const joinConversation = useCallback((conversationId: string) => {
    getSocket()?.emit('conversation:join', conversationId);
  }, []);

  const leaveConversation = useCallback((conversationId: string) => {
    getSocket()?.emit('conversation:leave', conversationId);
  }, []);

  const sendMessage = useCallback((data: { conversationId: string; content: string; messageType?: string; replyToId?: string }) => {
    getSocket()?.emit('message:send', data);
  }, []);

  const sendTyping = useCallback((conversationId: string, isTyping: boolean) => {
    getSocket()?.emit('message:typing', { conversationId, isTyping });
  }, []);

  return { joinConversation, leaveConversation, sendMessage, sendTyping };
};
