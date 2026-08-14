// Ref: RF2-010, RF2-011, RF2-012, B2-005, B2-006, ADR2-003
import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { api } from '../services/api';
import { getWebSocketUrl } from '../utils/websocket';

const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ children }) => {
  const { token, user } = useAuth();
  const [connected, setConnected] = useState(false);
  const [unreadNotifsCount, setUnreadNotifsCount] = useState(0);
  const [latestNotification, setLatestNotification] = useState(null);
  const [incomingMessage, setIncomingMessage] = useState(null);
  const [readAckEvent, setReadAckEvent] = useState(null);
  const [typingState, setTypingState] = useState({}); // { [convId]: { userId: timestamp } }

  const socketRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const isConnectingRef = useRef(false);
  const intentionalCloseRef = useRef(false);

  // Initialize unread notifications count from REST API on login (Task 23)
  useEffect(() => {
    if (token && user) {
      api.getUnreadNotificationCount()
        .then((res) => {
          if (res && typeof res.count === 'number') {
            setUnreadNotifsCount(res.count);
          }
        })
        .catch((err) => {
          console.error('[Unread Notifs Count Error]', err);
        });
    } else {
      setUnreadNotifsCount(0);
      setLatestNotification(null);
      setIncomingMessage(null);
      setReadAckEvent(null);
      setTypingState({});
    }
  }, [token, user]);

  const connectWS = useCallback(async () => {
    if (!token || !user) return;
    if (socketRef.current && (socketRef.current.readyState === WebSocket.CONNECTING || socketRef.current.readyState === WebSocket.OPEN)) {
      return; // Prevent duplicate connection attempts
    }
    if (isConnectingRef.current) return;

    isConnectingRef.current = true;
    intentionalCloseRef.current = false;

    try {
      // Step 1: Request a single-use WS authentication ticket via REST Bearer JWT
      const ticketRes = await api.createWsTicket();
      const ticket = ticketRes.ticket;

      // Step 2: Open WebSocket connection passing the ticket in URL query string (Task 21)
      const wsUrl = getWebSocketUrl(ticket);

      const ws = new WebSocket(wsUrl);
      socketRef.current = ws;

      ws.onopen = () => {
        setConnected(true);
        reconnectAttemptsRef.current = 0;
        isConnectingRef.current = false;
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === 'notification.created') {
            setUnreadNotifsCount((prev) => prev + 1);
            setLatestNotification(data.notification);
          } else if (data.type === 'message.created') {
            setIncomingMessage(data.message);
          } else if (data.type === 'message.read') {
            setReadAckEvent(data);
          } else if (data.type === 'typing.started') {
            setTypingState((prev) => ({
              ...prev,
              [data.conversation_id]: {
                ...(prev[data.conversation_id] || {}),
                [data.user_id]: Date.now()
              }
            }));
          } else if (data.type === 'typing.stopped') {
            setTypingState((prev) => {
              const currentConv = { ...(prev[data.conversation_id] || {}) };
              delete currentConv[data.user_id];
              return { ...prev, [data.conversation_id]: currentConv };
            });
          }
        } catch (e) {
          console.error('[WS Parse Error]', e);
        }
      };

      ws.onclose = () => {
        setConnected(false);
        socketRef.current = null;
        isConnectingRef.current = false;

        // Exponential backoff reconnection with jitter (Task 22)
        if (!intentionalCloseRef.current && token && user) {
          const jitter = Math.random() * 500;
          const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current) + jitter, 30000);
          reconnectAttemptsRef.current += 1;
          reconnectTimeoutRef.current = setTimeout(connectWS, delay);
        }
      };

      ws.onerror = (err) => {
        console.error('[WS Error]', err);
        isConnectingRef.current = false;
        ws.close();
      };
    } catch (e) {
      console.error('[WS Ticket Fetch Error]', e);
      isConnectingRef.current = false;

      if (!intentionalCloseRef.current && token && user) {
        const jitter = Math.random() * 500;
        const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current) + jitter, 30000);
        reconnectAttemptsRef.current += 1;
        reconnectTimeoutRef.current = setTimeout(connectWS, delay);
      }
    }
  }, [token, user]);

  useEffect(() => {
    connectWS();

    return () => {
      intentionalCloseRef.current = true;
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [connectWS]);

  const sendEvent = useCallback((eventData) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(eventData));
    }
  }, []);

  const sendChatMessage = useCallback((conversationId, content) => {
    sendEvent({ type: 'message.send', conversation_id: conversationId, content });
  }, [sendEvent]);

  const sendTypingStart = useCallback((conversationId) => {
    sendEvent({ type: 'typing.start', conversation_id: conversationId });
  }, [sendEvent]);

  const sendTypingStop = useCallback((conversationId) => {
    sendEvent({ type: 'typing.stop', conversation_id: conversationId });
  }, [sendEvent]);

  const sendReadAck = useCallback((conversationId) => {
    sendEvent({ type: 'message.read', conversation_id: conversationId });
  }, [sendEvent]);

  return (
    <WebSocketContext.Provider
      value={{
        connected,
        unreadNotifsCount,
        setUnreadNotifsCount,
        latestNotification,
        incomingMessage,
        readAckEvent,
        typingState,
        sendChatMessage,
        sendTypingStart,
        sendTypingStop,
        sendReadAck
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const ctx = useContext(WebSocketContext);
  if (!ctx) {
    throw new Error('useWebSocket debe ser usado dentro de un WebSocketProvider');
  }
  return ctx;
};
