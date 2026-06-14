import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { chatAPI } from '../services/api';
import { setConversations, setActiveConversation, setMessages } from '../store/slices/chatSlice';
import { useSocket } from '../hooks/useSocket';
import { MessageSquare, Send, Paperclip, Smile, Phone, Video } from 'lucide-react';

const QUICK_REACTIONS = ['👍', '❤️', '😂', '🎉', '😢', '👏'];

export default function Chat() {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const accessToken = localStorage.getItem('accessToken');
  const { conversations, activeConversation, messages } = useSelector((state: RootState) => state.chat);
  const { user } = useSelector((state: RootState) => state.auth);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [showReactionPicker, setShowReactionPicker] = useState<string | null>(null);
  const [typingUsers, setTypingUsers] = useState<Record<string, string>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const { joinConversation, leaveConversation, sendMessage: sendSocketMessage, sendTyping } = useSocket(accessToken);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const { data } = await chatAPI.getConversations();
        dispatch(setConversations(data.data));
      } catch {}
      setLoading(false);
    };
    fetchConversations();
  }, [dispatch]);

  useEffect(() => {
    if (conversationId) {
      dispatch(setActiveConversation(conversations.find(c => c.id === conversationId) || null));
      joinConversation(conversationId);
      const fetchMessages = async () => {
        try {
          const { data } = await chatAPI.getMessages(conversationId);
          dispatch(setMessages({ conversationId, messages: data.data }));
        } catch {}
      };
      fetchMessages();
      return () => {
        leaveConversation(conversationId);
      };
    }
  }, [conversationId, dispatch, joinConversation, leaveConversation, conversations]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const socket = (window as any).__socket;
    if (socket) {
      const handler = (data: { conversationId: string; userId: string; username: string; isTyping: boolean }) => {
        if (data.conversationId === conversationId && data.userId !== user?.id) {
          if (data.isTyping) {
            setTypingUsers(prev => ({ ...prev, [data.userId]: data.username }));
          } else {
            setTypingUsers(prev => {
              const next = { ...prev };
              delete next[data.userId];
              return next;
            });
          }
        }
      };
      socket.on('message:typing', handler);
      return () => { socket.off('message:typing', handler); };
    }
  }, [conversationId, user?.id]);

  const handleSend = useCallback(() => {
    if (!messageText.trim() || !conversationId) return;
    sendSocketMessage({ conversationId, content: messageText.trim() });
    setMessageText('');
  }, [messageText, conversationId, sendSocketMessage]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTyping = () => {
    if (!conversationId) return;
    sendTyping(conversationId, true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      sendTyping(conversationId, false);
    }, 2000);
  };

  const handleReaction = async (messageId: string, emoji: string) => {
    try {
      await chatAPI.addReaction(messageId, emoji);
      setShowReactionPicker(null);
    } catch {}
  };

  const currentMessages = conversationId ? messages[conversationId] || [] : [];
  const typingList = Object.values(typingUsers);
  const isTyping = typingList.length > 0;

  return (
    <div className="flex h-[calc(100vh-8rem)] -m-6">
      <div className="w-80 border-r border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 flex flex-col">
        <div className="p-4 border-b border-surface-200 dark:border-surface-800">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-surface-900 dark:text-white">Messages</h2>
            <button onClick={() => navigate('/app/chat')} className="btn-ghost p-1.5 text-xs">New +</button>
          </div>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
            <input type="text" placeholder="Search conversations..." className="input-field pl-9 py-2 text-sm" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-4 animate-pulse">
                <div className="w-10 h-10 rounded-full bg-surface-200 dark:bg-surface-700" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-surface-200 dark:bg-surface-700 rounded w-24" />
                  <div className="h-2 bg-surface-200 dark:bg-surface-700 rounded w-32" />
                </div>
              </div>
            ))
          ) : conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-surface-400 p-4">
              <MessageSquare size={40} className="mb-2" />
              <p className="text-sm">No conversations yet</p>
            </div>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => navigate(`/app/chat/${conv.id}`)}
                className={`w-full flex items-center gap-3 p-4 hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors text-left ${conv.id === conversationId ? 'bg-primary-50 dark:bg-primary-900/20' : ''}`}
              >
                <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 font-semibold text-sm flex-shrink-0">
                  {conv.name?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-surface-900 dark:text-white truncate">{conv.name || 'Direct Message'}</p>
                    {conv.last_message_at && (
                      <span className="text-xs text-surface-400">{new Date(conv.last_message_at).toLocaleDateString()}</span>
                    )}
                  </div>
                  <p className="text-xs text-surface-500 truncate mt-0.5">{conv.last_message || 'No messages yet'}</p>
                </div>
                {conv.unread_count > 0 && (
                  <span className="w-5 h-5 rounded-full bg-primary-500 text-white text-xs flex items-center justify-center flex-shrink-0">{conv.unread_count}</span>
                )}
              </button>
            ))
          )}
        </div>
      </div>

      {conversationId ? (
        <div className="flex-1 flex flex-col bg-white dark:bg-surface-900">
          <div className="h-16 px-4 border-b border-surface-200 dark:border-surface-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 font-semibold text-sm">
                {activeConversation?.name?.charAt(0)?.toUpperCase() || '?'}
              </div>
              <div>
                <p className="text-sm font-medium text-surface-900 dark:text-white">{activeConversation?.name || 'Chat'}</p>
                <p className="text-xs text-surface-500">{isTyping ? `${typingList.join(', ')} typing...` : 'Online'}</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button className="btn-ghost p-2"><Phone size={16} /></button>
              <button className="btn-ghost p-2"><Video size={16} /></button>
              <button className="btn-ghost p-2"><Pin size={16} /></button>
              <button className="btn-ghost p-2"><Archive size={16} /></button>
              <button className="btn-ghost p-2"><MoreVertical size={16} /></button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {currentMessages.map((msg) => (
              <div key={msg.id} className="group relative">
                <div className={`flex ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'} animate-slide-up`}>
                  <div className={`max-w-[70%] ${msg.sender_id === user?.id ? 'bg-primary-500 text-white rounded-2xl rounded-br-md' : 'bg-surface-100 dark:bg-surface-800 text-surface-900 dark:text-surface-100 rounded-2xl rounded-bl-md'} px-4 py-2.5`}>
                    {msg.sender_id !== user?.id && (
                      <p className="text-xs font-medium mb-1 opacity-70">{msg.display_name || msg.username}</p>
                    )}
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    <div className="flex items-center justify-between gap-3 mt-1">
                      <p className={`text-xs ${msg.sender_id === user?.id ? 'text-white/60' : 'text-surface-400'}`}>
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      {msg.sender_id === user?.id && msg.is_edited && (
                        <span className={`text-xs ${msg.sender_id === user?.id ? 'text-white/40' : 'text-surface-500'}`}>(edited)</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className={`flex gap-1 mt-1 ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'} opacity-0 group-hover:opacity-100 transition-opacity`}>
                  <button onClick={() => setShowReactionPicker(showReactionPicker === msg.id ? null : msg.id)} className="btn-ghost p-1 text-xs">😊</button>
                </div>

                {showReactionPicker === msg.id && (
                  <div className={`absolute ${msg.sender_id === user?.id ? 'right-0' : 'left-0'} top-full mt-1 glass-card p-1.5 flex gap-1 z-10 animate-scale-in`}>
                    {QUICK_REACTIONS.map(emoji => (
                      <button key={emoji} onClick={() => handleReaction(msg.id, emoji)} className="hover:bg-surface-100 dark:hover:bg-surface-700 p-1 rounded text-lg hover:scale-125 transition-transform">
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t border-surface-200 dark:border-surface-800">
            <div className="flex items-end gap-3">
              <button className="btn-ghost p-2 mb-1"><Paperclip size={18} /></button>
              <div className="flex-1 relative">
                <textarea
                  value={messageText}
                  onChange={(e) => { setMessageText(e.target.value); handleTyping(); }}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a message..."
                  rows={1}
                  className="input-field pr-10 resize-none py-3 max-h-32"
                />
                <button className="btn-ghost p-2 absolute right-1 bottom-1"><Smile size={18} /></button>
              </div>
              <button onClick={handleSend} className="btn-primary p-3 rounded-xl" disabled={!messageText.trim()}>
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-white dark:bg-surface-900">
          <div className="text-center">
            <div className="w-20 h-20 rounded-2xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mx-auto mb-4">
              <MessageSquare size={40} className="text-primary-500" />
            </div>
            <h3 className="text-lg font-semibold text-surface-900 dark:text-white">Your Messages</h3>
            <p className="text-surface-500 mt-1 max-w-sm">Select a conversation or start a new one to begin chatting</p>
          </div>
        </div>
      )}
    </div>
  );
}
