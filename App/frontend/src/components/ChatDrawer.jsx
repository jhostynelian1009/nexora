// Ref: RF2-009, RF2-010, RF2-011, B2-004, B2-005
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MessageSquare, X, Send, ArrowLeft, Loader, CheckCheck, Check, Circle, AlertCircle } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useWebSocket } from '../context/WebSocketContext';

export const ChatDrawer = ({ isOpen, onClose, targetUserId = null }) => {
  const { user: currentUser } = useAuth();
  const {
    connected,
    incomingMessage,
    readAckEvent,
    typingState,
    sendChatMessage,
    sendTypingStart,
    sendTypingStop,
    sendReadAck
  } = useWebSocket();

  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  
  // Separated loading and error states (Section 5)
  const [loadingConvs, setLoadingConvs] = useState(false);
  const [refreshingConvs, setRefreshingConvs] = useState(false);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [convsError, setConvsError] = useState('');
  const [msgsError, setMsgsError] = useState('');

  const messagesEndRef = useRef(null);
  const typingTimerRef = useRef(null);
  const loadingConversationsRef = useRef(false);
  const activeConversationRef = useRef(null);
  const openedTargetRef = useRef(null);

  // Sync activeConversationRef with activeConv state
  useEffect(() => {
    activeConversationRef.current = activeConv;
  }, [activeConv]);

  // Body scroll lock & Escape key listener
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Load conversations list with silent background update support (Section 2)
  const loadConversations = useCallback(async ({ silent = false } = {}) => {
    if (loadingConversationsRef.current) return;

    loadingConversationsRef.current = true;

    if (!silent && !activeConversationRef.current) {
      setLoadingConvs(true);
    } else if (silent) {
      setRefreshingConvs(true);
    }

    try {
      const data = await api.getConversations();
      setConversations(Array.isArray(data) ? data : []);
      setConvsError('');
    } catch (error) {
      console.error('Error al cargar conversaciones:', error);
      setConvsError(error.message || 'No se pudieron cargar las conversaciones.');
    } finally {
      loadingConversationsRef.current = false;
      setLoadingConvs(false);
      setRefreshingConvs(false);
    }
  }, []);

  // Open drawer effect (Section 2)
  useEffect(() => {
    if (!isOpen) {
      openedTargetRef.current = null;
      activeConversationRef.current = null;
      setActiveConv(null);
      setConvsError('');
      setMsgsError('');
      return;
    }

    void loadConversations();
  }, [isOpen, loadConversations]);

  // Open specific user conversation helper (Section 3)
  const openConversationWithUser = useCallback(async (otherUserId) => {
    if (!otherUserId) return;
    setLoadingMsgs(true);
    setMsgsError('');
    try {
      const conv = await api.getOrCreateConversation(otherUserId);
      if (!conv || !conv.id) {
        throw new Error('El servidor no devolvió una conversación válida.');
      }
      activeConversationRef.current = conv;
      setActiveConv(conv);
      const msgs = await api.getMessages(conv.id);
      setMessages(Array.isArray(msgs) ? msgs : []);
      Promise.resolve(api.markConversationRead(conv.id)).catch(() => {});
      sendReadAck(conv.id);
    } catch (err) {
      console.error('Error al abrir conversación:', err);
      setMsgsError(err.message || 'No se pudo abrir la conversación con el estudiante.');
    } finally {
      setLoadingMsgs(false);
    }
  }, [sendReadAck]);

  // Single-execution targetUserId auto-open effect (Section 3)
  useEffect(() => {
    if (!isOpen || !targetUserId) return;

    if (openedTargetRef.current === targetUserId) return;
    openedTargetRef.current = targetUserId;

    void openConversationWithUser(targetUserId);
  }, [isOpen, targetUserId, openConversationWithUser]);

  // Select conversation from list
  const selectConversation = async (conv) => {
    if (!conv || !conv.id) return;
    activeConversationRef.current = conv;
    setActiveConv(conv);
    setLoadingMsgs(true);
    setMsgsError('');
    try {
      const msgs = await api.getMessages(conv.id);
      setMessages(Array.isArray(msgs) ? msgs : []);
      Promise.resolve(api.markConversationRead(conv.id)).catch(() => {});
      sendReadAck(conv.id);
      setConversations((prev) =>
        prev.map((c) => (c.id === conv.id ? { ...c, unread_count: 0 } : c))
      );
    } catch (err) {
      console.error('Error al cargar mensajes:', err);
      setMsgsError('Error al cargar mensajes de la conversación.');
    } finally {
      setLoadingMsgs(false);
    }
  };

  // Listen to incoming read acks from WebSocket (Section 4)
  useEffect(() => {
    if (readAckEvent && activeConv && readAckEvent.conversation_id === activeConv.id) {
      setMessages((prev) =>
        prev.map((m) => (m.sender_id === currentUser?.id ? { ...m, is_read: true } : m))
      );
    }
  }, [readAckEvent, activeConv, currentUser]);

  // Listen to incoming messages from WebSocket (Section 4)
  useEffect(() => {
    if (!incomingMessage) return;

    // Append to active conversation if matching id
    if (activeConv && incomingMessage.conversation_id === activeConv.id) {
      setMessages((prev) => {
        if (prev.some((m) => m.id === incomingMessage.id)) return prev;
        return [...prev, incomingMessage];
      });
      sendReadAck(activeConv.id);
    }

    // Update conversation list preview
    setConversations((prev) => {
      const exists = prev.some((c) => c.id === incomingMessage.conversation_id);
      if (!exists) {
        void loadConversations({ silent: true });
        return prev;
      }
      return prev.map((c) => {
        if (c.id === incomingMessage.conversation_id) {
          const isCurrentActive = activeConv && activeConv.id === c.id;
          return {
            ...c,
            last_message: incomingMessage,
            unread_count: isCurrentActive ? 0 : (c.unread_count || 0) + 1,
            updated_at: incomingMessage.created_at || new Date().toISOString()
          };
        }
        return c;
      });
    });
  }, [incomingMessage, activeConv, loadConversations, sendReadAck]);

  // Auto scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, typingState]);

  const handleInputChange = (e) => {
    setInputText(e.target.value);
    if (!activeConv) return;

    sendTypingStart(activeConv.id);

    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      sendTypingStop(activeConv.id);
    }, 1500);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim() || !activeConv) return;

    const content = inputText.trim();
    setInputText('');

    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    sendTypingStop(activeConv.id);

    if (connected) {
      sendChatMessage(activeConv.id, content);
    } else {
      // Fallback to REST API if WS disconnected
      api.sendMessage(activeConv.id, content)
        .then((msg) => {
          setMessages((prev) => [...prev, msg]);
          void loadConversations({ silent: true });
        })
        .catch((err) => {
          console.error('Error enviando mensaje via REST:', err);
          setMsgsError('Error al enviar mensaje. Revisa tu conexión.');
        });
    }
  };

  if (!isOpen) return null;

  const isOtherTyping =
    activeConv &&
    activeConv.other_user &&
    typingState[activeConv.id] &&
    Object.keys(typingState[activeConv.id]).some(
      (uid) => Number(uid) !== currentUser?.id
    );

  return (
    <div
      className="chat-drawer-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Panel de Mensajes Privados"
    >
      <div className="chat-drawer-panel" onClick={(e) => e.stopPropagation()}>
        {/* Drawer Header */}
        <div className="chat-drawer-header">
          {activeConv ? (
            <button
              className="btn-icon mr-2 text-muted"
              onClick={() => {
                activeConversationRef.current = null;
                setActiveConv(null);
                setMsgsError('');
              }}
              aria-label="Volver a lista de conversaciones"
            >
              <ArrowLeft size={18} />
            </button>
          ) : (
            <MessageSquare size={18} className="text-primary mr-2" />
          )}

          <h3 className="modal-title flex-1" style={{ fontSize: '1rem' }}>
            {activeConv && activeConv.other_user ? activeConv.other_user.name : 'Mensajes Privados'}
          </h3>

          <div
            className={`ws-status-badge ${connected ? 'ws-status-online' : 'ws-status-offline'} mr-2`}
            title={connected ? 'Conectado en tiempo real' : 'Modo desconectado (REST fallback)'}
          >
            <Circle size={8} className={connected ? 'text-success fill-success' : 'text-danger'} />
            <span>{connected ? 'En vivo' : 'REST'}</span>
          </div>

          <button className="btn-icon text-muted" onClick={onClose} aria-label="Cerrar chat">
            <X size={18} />
          </button>
        </div>

        {/* Error Banners (Section 5) */}
        {!activeConv && convsError && (
          <div className="alert alert-error" style={{ margin: '10px 16px', fontSize: '0.82rem' }}>
            <AlertCircle size={14} />
            <span>{convsError}</span>
          </div>
        )}

        {activeConv && msgsError && (
          <div className="alert alert-error" style={{ margin: '10px 16px', fontSize: '0.82rem' }}>
            <AlertCircle size={14} />
            <span>{msgsError}</span>
          </div>
        )}

        {/* Drawer Body */}
        <div className="chat-drawer-body">
          {!activeConv ? (
            /* Conversations List View */
            loadingConvs ? (
              <div className="flex items-center justify-between py-5" style={{ justifyContent: 'center' }}>
                <Loader className="spin text-primary" size={24} />
              </div>
            ) : conversations.length === 0 ? (
              <div className="text-center py-5" style={{ padding: '40px 20px' }}>
                <MessageSquare size={36} className="text-muted mb-2" style={{ opacity: 0.5 }} />
                <p className="text-muted text-sm">
                  No tienes conversaciones activas. ¡Busca a un compañero para chatear!
                </p>
              </div>
            ) : (
              <div className="conversations-list">
                {conversations.map((conv) => (
                  <div
                    key={conv.id}
                    className="conversation-item"
                    onClick={() => selectConversation(conv)}
                    role="button"
                    tabIndex={0}
                  >
                    <img
                      src={
                        conv.other_user?.avatar_url ||
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
                      }
                      alt={conv.other_user?.name || 'Usuario'}
                      className="user-avatar-md"
                    />
                    <div className="conv-info flex-1">
                      <div className="flex justify-between items-center">
                        <span className="conv-name">{conv.other_user?.name || 'Estudiante'}</span>
                        {conv.last_message && (
                          <span className="conv-time">
                            {new Date(conv.last_message.created_at).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        )}
                      </div>
                      <p className="conv-snippet">
                        {conv.last_message ? conv.last_message.content : 'Conversación iniciada'}
                      </p>
                    </div>
                    {conv.unread_count > 0 && (
                      <span className="badge badge-primary">{conv.unread_count}</span>
                    )}
                  </div>
                ))}
              </div>
            )
          ) : (
            /* Messages Chat View */
            <div className="chat-messages-container">
              {loadingMsgs ? (
                <div className="flex items-center justify-between py-5" style={{ justifyContent: 'center' }}>
                  <Loader className="spin text-primary" size={24} />
                </div>
              ) : (
                <div className="messages-stream">
                  {messages.map((m) => {
                    const isMe = m.sender_id === currentUser?.id || m.sender?.id === currentUser?.id;
                    const senderAvatar = m.sender?.avatar_url || activeConv.other_user?.avatar_url;
                    const senderName = m.sender?.name || activeConv.other_user?.name;

                    return (
                      <div key={m.id || Math.random()} className={`message-bubble-row ${isMe ? 'mine' : 'theirs'}`}>
                        {!isMe && (
                          <img
                            src={
                              senderAvatar ||
                              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
                            }
                            alt={senderName}
                            className="avatar-xs mr-2"
                          />
                        )}
                        <div className={`message-bubble ${isMe ? 'bubble-mine' : 'bubble-theirs'}`}>
                          <p className="message-content">{m.content}</p>
                          <div className="message-meta">
                            <span className="message-time">
                              {new Date(m.created_at || Date.now()).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                            {/* Read Status Checks */}
                            {isMe && (
                              m.is_read ? (
                                <CheckCheck size={14} className="ml-1 text-primary" title="Leído" />
                              ) : (
                                <Check size={14} className="ml-1 text-muted" title="Enviado" />
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {isOtherTyping && (
                    <div className="typing-indicator-row">
                      <span>{activeConv.other_user?.name} está escribiendo</span>
                      <span className="typing-dots">
                        <span className="typing-dot" />
                        <span className="typing-dot" />
                        <span className="typing-dot" />
                      </span>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              )}

              <form className="chat-input-form" onSubmit={handleSendMessage}>
                <input
                  type="text"
                  className="chat-input"
                  placeholder="Escribe un mensaje..."
                  value={inputText}
                  onChange={handleInputChange}
                  maxLength={1000}
                />
                <button
                  type="submit"
                  className="btn btn-primary btn-icon"
                  disabled={!inputText.trim()}
                  aria-label="Enviar mensaje"
                >
                  <Send size={16} />
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
