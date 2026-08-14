# Ref: RF2-010, RF2-011, B2-005, ADR2-003
import json
import logging
from typing import Optional
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.api.deps import get_current_user
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.repositories.conversation_repository import ConversationRepository
from app.services.chat_service import ChatService
from app.core.websockets import manager, ticket_manager
from app.core.config import settings

logger = logging.getLogger("nexora.websocket")
router = APIRouter(tags=["WebSockets"])

@router.post("/api/ws/ticket")
def create_websocket_ticket(current_user: User = Depends(get_current_user)):
    """
    Generates a single-use random ticket for authenticating WebSocket connections.
    Ticket expires in 60 seconds.
    """
    ticket = ticket_manager.create_ticket(current_user.id)
    return {
        "ticket": ticket,
        "expires_in": settings.WS_TICKET_TTL_SECONDS
    }

@router.websocket("/ws")
async def websocket_endpoint(
    websocket: WebSocket,
    ticket: Optional[str] = Query(None),
    token: Optional[str] = Query(None)
):
    # Validate Origin header if present
    origin = websocket.headers.get("origin")
    if origin:
        allowed_origins = settings.cors_origins_list
        if allowed_origins and "*" not in allowed_origins and origin not in allowed_origins:
            logger.warning("WS rejected due to unauthorized origin header")
            await websocket.close(code=4003, reason="Origen no permitido")
            return

    # Authenticate via ticket (primary) or legacy token (fallback for testing)
    user_id = None
    if ticket:
        user_id = ticket_manager.consume_ticket(ticket)
        if not user_id:
            await websocket.close(code=4001, reason="Ticket de conexión inválido, vencido o ya utilizado")
            return
    elif token:
        # Fallback for testing environments
        from app.core.security import decode_access_token
        payload = decode_access_token(token)
        if payload and payload.get("sub"):
            try:
                user_id = int(payload.get("sub"))
            except ValueError:
                user_id = None

    if not user_id:
        await websocket.close(code=4001, reason="Autenticación requerida para conexión WebSocket")
        return

    db = SessionLocal()
    try:
        user_repo = UserRepository(db)
        user = user_repo.get_by_id(user_id)
        if not user:
            await websocket.close(code=4001, reason="Usuario no encontrado")
            return

        await manager.connect(user_id, websocket)

        try:
            while True:
                data_text = await websocket.receive_text()
                try:
                    data = json.loads(data_text)
                except Exception as parse_err:
                    logger.debug(f"JSON Parse error: {parse_err}")
                    await websocket.send_text(json.dumps({"type": "error", "message": "JSON inválido"}))
                    continue

                event_type = data.get("type")

                if event_type == "presence.ping":
                    await websocket.send_text(json.dumps({"type": "presence.pong"}))

                elif event_type == "message.send":
                    conv_id = data.get("conversation_id")
                    content = data.get("content", "")
                    if not conv_id or not content:
                        await websocket.send_text(json.dumps({"type": "error", "message": "Parámetros incompletos"}))
                        continue

                    chat_service = ChatService(db)
                    try:
                        msg_res = chat_service.send_message(user, conv_id, content)
                        # Broadcast message.created to all conversation members
                        conv_repo = ConversationRepository(db)
                        conv = conv_repo.get_by_id(conv_id)
                        if conv:
                            recipient_ids = {m.user_id for m in conv.members}
                            event_payload = {
                                "type": "message.created",
                                "message": msg_res.model_dump(mode="json")
                            }
                            await manager.broadcast_to_users(recipient_ids, event_payload)
                    except Exception as e:
                        await websocket.send_text(json.dumps({"type": "error", "message": str(e)}))

                elif event_type == "message.read":
                    conv_id = data.get("conversation_id")
                    if conv_id:
                        chat_service = ChatService(db)
                        try:
                            chat_service.mark_read(user, conv_id)
                            conv_repo = ConversationRepository(db)
                            conv = conv_repo.get_by_id(conv_id)
                            if conv:
                                recipient_ids = {m.user_id for m in conv.members}
                                await manager.broadcast_to_users(recipient_ids, {
                                    "type": "message.read",
                                    "conversation_id": conv_id,
                                    "read_by_user_id": user_id
                                })
                        except Exception as read_err:
                            logger.debug(f"Read ack error: {read_err}")

                elif event_type in ["typing.start", "typing.stop"]:
                    conv_id = data.get("conversation_id")
                    if conv_id:
                        conv_repo = ConversationRepository(db)
                        conv = conv_repo.get_by_id(conv_id)
                        if conv and conv_repo.is_member(conv_id, user_id):
                            other_members = {m.user_id for m in conv.members if m.user_id != user_id}
                            out_event = "typing.started" if event_type == "typing.start" else "typing.stopped"
                            await manager.broadcast_to_users(other_members, {
                                "type": out_event,
                                "conversation_id": conv_id,
                                "user_id": user_id
                            })

        except WebSocketDisconnect:
            manager.disconnect(user_id, websocket)
        except Exception as ws_err:
            logger.debug(f"WS exception: {ws_err}")
            manager.disconnect(user_id, websocket)

    finally:
        db.close()
