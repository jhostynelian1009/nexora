# Ref: RF2-012, B2-006
import json
import asyncio
from typing import List, Optional
from sqlalchemy.orm import Session
from app.repositories.notification_repository import NotificationRepository
from app.core.websockets import manager

class NotificationService:
    def __init__(self, db: Session):
        self.db = db
        self.notif_repo = NotificationRepository(db)

    def create_notification(
        self,
        recipient_id: int,
        actor_id: int,
        type: str,
        entity_type: Optional[str] = None,
        entity_id: Optional[int] = None,
        payload: Optional[dict] = None
    ):
        notif = self.notif_repo.create(
            recipient_id=recipient_id,
            actor_id=actor_id,
            type=type,
            entity_type=entity_type,
            entity_id=entity_id,
            payload=payload
        )

        if notif:
            # Prepare WS payload
            payload_data = json.loads(notif.payload_json) if notif.payload_json else {}
            data = {
                "type": "notification.created",
                "notification": {
                    "id": notif.id,
                    "recipient_id": notif.recipient_id,
                    "actor": {
                        "id": notif.actor.id,
                        "name": notif.actor.name,
                        "avatar_url": notif.actor.avatar_url
                    },
                    "notification_type": notif.type,
                    "entity_type": notif.entity_type,
                    "entity_id": notif.entity_id,
                    "payload": payload_data,
                    "is_read": notif.is_read,
                    "created_at": notif.created_at.isoformat()
                }
            }
            # Attempt async websocket push if event loop running
            try:
                loop = asyncio.get_running_loop()
                loop.create_task(manager.send_personal_message(recipient_id, data))
            except RuntimeError:
                pass

        return notif

    def get_notifications(self, user_id: int) -> List[dict]:
        notifs = self.notif_repo.get_for_user(user_id)
        result = []
        for n in notifs:
            payload_data = json.loads(n.payload_json) if n.payload_json else {}
            result.append({
                "id": n.id,
                "recipient_id": n.recipient_id,
                "actor": {
                    "id": n.actor.id,
                    "name": n.actor.name,
                    "avatar_url": n.actor.avatar_url
                },
                "notification_type": n.type,
                "entity_type": n.entity_type,
                "entity_id": n.entity_id,
                "payload": payload_data,
                "is_read": n.is_read,
                "created_at": n.created_at.isoformat()
            })
        return result

    def get_unread_count(self, user_id: int) -> int:
        return self.notif_repo.count_unread(user_id)

    def mark_read(self, notification_id: int, user_id: int) -> bool:
        return self.notif_repo.mark_as_read(notification_id, user_id)

    def mark_all_read(self, user_id: int) -> int:
        return self.notif_repo.mark_all_as_read(user_id)
