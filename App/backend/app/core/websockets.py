# Ref: RF2-010, RF2-011, RF2-012, B2-005, B2-006, ADR2-003
import json
import secrets
import time
from typing import Dict, Set, Optional, Tuple
from fastapi import WebSocket
from app.core.config import settings

class ConnectionManager:
    """
    In-memory ConnectionManager encapsulating websocket connections per user_id.
    Note: Single-instance implementation. Multi-instance scale-out requires Redis Pub/Sub.
    """
    def __init__(self):
        # Maps user_id -> Set[WebSocket]
        self.active_connections: Dict[int, Set[WebSocket]] = {}

    async def connect(self, user_id: int, websocket: WebSocket):
        await websocket.accept()
        if user_id not in self.active_connections:
            self.active_connections[user_id] = set()
        self.active_connections[user_id].add(websocket)

    def disconnect(self, user_id: int, websocket: WebSocket):
        if user_id in self.active_connections:
            self.active_connections[user_id].discard(websocket)
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]

    async def send_personal_message(self, user_id: int, data: dict):
        if user_id in self.active_connections:
            dead_sockets = set()
            msg_str = json.dumps(data)
            for ws in self.active_connections[user_id]:
                try:
                    await ws.send_text(msg_str)
                except Exception:
                    dead_sockets.add(ws)
            for dead in dead_sockets:
                self.active_connections[user_id].discard(dead)

    async def broadcast_to_users(self, user_ids: Set[int], data: dict):
        for uid in user_ids:
            await self.send_personal_message(uid, data)

class WsTicketManager:
    """
    Thread-safe in-memory manager for single-use, 60-second TTL WebSocket connection tickets.
    """
    def __init__(self):
        # ticket -> (user_id, created_timestamp)
        self._tickets: Dict[str, Tuple[int, float]] = {}

    def create_ticket(self, user_id: int) -> str:
        ticket = secrets.token_urlsafe(32)
        now = time.time()
        # Clean up stale tickets
        stale_tickets = [t for t, (_, created) in self._tickets.items() if now - created > settings.WS_TICKET_TTL_SECONDS]
        for t in stale_tickets:
            self._tickets.pop(t, None)

        self._tickets[ticket] = (user_id, now)
        return ticket

    def consume_ticket(self, ticket: str) -> Optional[int]:
        if not ticket or ticket not in self._tickets:
            return None

        user_id, created = self._tickets.pop(ticket)  # Atomic single-use consumption
        if time.time() - created > settings.WS_TICKET_TTL_SECONDS:
            return None

        return user_id

manager = ConnectionManager()
ticket_manager = WsTicketManager()
