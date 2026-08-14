# Ref: RF2-012, B2-006
import json
from typing import List, Optional
from datetime import datetime, timezone
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import select, desc
from app.models.notification import Notification

class NotificationRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(
        self,
        recipient_id: int,
        actor_id: int,
        type: str,
        entity_type: Optional[str] = None,
        entity_id: Optional[int] = None,
        payload: Optional[dict] = None
    ) -> Notification:
        # Prevent notifying self
        if recipient_id == actor_id:
            return None  # type: ignore

        # Prevent duplicate follow/like notifications if unread exists
        if type in ["follow", "like"]:
            existing = self.db.scalars(
                select(Notification).where(
                    Notification.recipient_id == recipient_id,
                    Notification.actor_id == actor_id,
                    Notification.type == type,
                    Notification.entity_id == entity_id,
                    Notification.is_read == False
                )
            ).first()
            if existing:
                return existing

        notif = Notification(
            recipient_id=recipient_id,
            actor_id=actor_id,
            type=type,
            entity_type=entity_type,
            entity_id=entity_id,
            payload_json=json.dumps(payload) if payload else None
        )
        self.db.add(notif)
        self.db.commit()
        self.db.refresh(notif)
        return self.db.query(Notification).options(
            joinedload(Notification.actor),
            joinedload(Notification.recipient)
        ).filter(Notification.id == notif.id).first()  # type: ignore

    def get_for_user(self, user_id: int, limit: int = 30) -> List[Notification]:
        stmt = (
            select(Notification)
            .where(Notification.recipient_id == user_id)
            .options(joinedload(Notification.actor))
            .order_by(desc(Notification.created_at))
            .limit(limit)
        )
        return list(self.db.scalars(stmt).all())

    def count_unread(self, user_id: int) -> int:
        return self.db.query(Notification).filter(
            Notification.recipient_id == user_id,
            Notification.is_read == False
        ).count()

    def mark_as_read(self, notification_id: int, user_id: int) -> bool:
        notif = self.db.get(Notification, notification_id)
        if notif and notif.recipient_id == user_id:
            notif.is_read = True
            notif.read_at = datetime.now(timezone.utc)
            self.db.commit()
            return True
        return False

    def mark_all_as_read(self, user_id: int) -> int:
        now = datetime.now(timezone.utc)
        unread = self.db.scalars(
            select(Notification).where(
                Notification.recipient_id == user_id,
                Notification.is_read == False
            )
        ).all()
        count = len(unread)
        for n in unread:
            n.is_read = True
            n.read_at = now
        self.db.commit()
        return count
