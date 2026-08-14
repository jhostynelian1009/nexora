/**
 * Derives the WebSocket URL dynamically based on environment configuration.
 * Ref: RNF-006, B2-005, RF2-005
 */
export const getWebSocketUrl = (ticket = '') => {
  const envWsUrl = import.meta.env.VITE_WS_URL;
  if (envWsUrl) {
    const baseUrl = envWsUrl.replace(/\/+$/, '');
    return ticket ? `${baseUrl}/ws?ticket=${encodeURIComponent(ticket)}` : `${baseUrl}/ws`;
  }

  const envApiUrl = import.meta.env.VITE_API_URL;
  if (envApiUrl) {
    let wsPrefix = envApiUrl.replace(/^http/, 'ws').replace(/\/+$/, '');
    // Replace /api suffix if present in VITE_API_URL
    wsPrefix = wsPrefix.replace(/\/api$/, '');
    return ticket ? `${wsPrefix}/ws?ticket=${encodeURIComponent(ticket)}` : `${wsPrefix}/ws`;
  }

  // Fallback using window.location if in browser environment
  if (typeof window !== 'undefined' && window.location) {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
      ? 'localhost:8000' 
      : window.location.host;
    const baseUrl = `${protocol}//${host}`;
    return ticket ? `${baseUrl}/ws?ticket=${encodeURIComponent(ticket)}` : `${baseUrl}/ws`;
  }

  const fallback = 'ws://localhost:8000/ws';
  return ticket ? `${fallback}?ticket=${encodeURIComponent(ticket)}` : fallback;
};
