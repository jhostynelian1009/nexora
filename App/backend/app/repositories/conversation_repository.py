# Ref: RF2-009, RF2-010, B2-004, B2-005
from typing import List, Optional
from datetime import datetime, timezone
from sqlalchemy.orm import Session, joinedload, selectinload
from sqlalchemy import select, desc, func, and_
from app.models.conversation import Conversation, ConversationMember, Message
from app.models.user import User

class ConversationRepository:
    def __init__(self, db: Session):
        self.db = db

    def find_between_users(self, user1_id: int, user2_id: int) -> Optional[Conversation]:
        # Find a conversation that has exactly user1_id and user2_id as members
        stmt = (
            select(ConversationMember.conversation_id)
            .where(ConversationMember.user_id.in_([user1_id, user2_id]))
            .group_by(ConversationMember.conversation_id)
            .having(func.count(ConversationMember.user_id) == 2)
        )
        conv_ids = self.db.scalars(stmt).all()
        for cid in conv_ids:
            # Verify no other members exist
            total = self.db.query(ConversationMember).filter(ConversationMember.conversation_id == cid).count()
            if total == 2:
                return self.get_by_id(cid)
        return None

    def get_by_id(self, conversation_id: int) -> Optional[Conversation]:
        stmt = (
            select(Conversation)
            .where(Conversation.id == conversation_id)
            .options(
                selectinload(Conversation.members).joinedload(ConversationMember.user)
            )
        )
        return self.db.scalars(stmt).first()

    def create_conversation(self, user1_id: int, user2_id: int) -> Conversation:
        conv = Conversation()
        self.db.add(conv)
        self.db.commit()
        self.db.refresh(conv)

        m1 = ConversationMember(conversation_id=conv.id, user_id=user1_id)
        m2 = ConversationMember(conversation_id=conv.id, user_id=user2_id)
        self.db.add_all([m1, m2])
        self.db.commit()

        return self.get_by_id(conv.id)  # type: ignore

    def get_user_conversations(self, user_id: int) -> List[Conversation]:
        stmt = (
            select(Conversation)
            .join(ConversationMember, ConversationMember.conversation_id == Conversation.id)
            .where(ConversationMember.user_id == user_id)
            .options(
                selectinload(Conversation.members).joinedload(ConversationMember.user),
                selectinload(Conversation.messages)
            )
            .order_by(desc(Conversation.updated_at))
        )
        return list(self.db.scalars(stmt).unique().all())

    def get_messages(self, conversation_id: int, limit: int = 50, offset: int = 0) -> List[Message]:
        stmt = (
            select(Message)
            .where(Message.conversation_id == conversation_id)
            .options(joinedload(Message.sender))
            .order_by(desc(Message.created_at))
            .limit(limit)
            .offset(offset)
        )
        msgs = list(self.db.scalars(stmt).all())
        msgs.reverse()  # Return in chronological order
        return msgs

    def create_message(self, conversation_id: int, sender_id: int, content: str) -> Message:
        msg = Message(
            conversation_id=conversation_id,
            sender_id=sender_id,
            content=content
        )
        self.db.add(msg)
        
        # Touch conversation updated_at
        conv = self.db.get(Conversation, conversation_id)
        if conv:
            conv.updated_at = datetime.now(timezone.utc)

        self.db.commit()
        self.db.refresh(msg)
        return self.db.query(Message).options(joinedload(Message.sender)).filter(Message.id == msg.id).first()  # type: ignore

    def mark_as_read(self, conversation_id: int, user_id: int) -> int:
        now = datetime.now(timezone.utc)
        stmt = (
            select(Message)
            .where(
                Message.conversation_id == conversation_id,
                Message.sender_id != user_id,
                Message.is_read == False
            )
        )
        unread = self.db.scalars(stmt).all()
        count = len(unread)
        for msg in unread:
            msg.is_read = True
            msg.read_at = now
        self.db.commit()
        return count

    def get_unread_count(self, conversation_id: int, user_id: int) -> int:
        return self.db.query(Message).filter(
            Message.conversation_id == conversation_id,
            Message.sender_id != user_id,
            Message.is_read == False
        ).count()

    def is_member(self, conversation_id: int, user_id: int) -> bool:
        return self.db.query(ConversationMember).filter(
            ConversationMember.conversation_id == conversation_id,
            ConversationMember.user_id == user_id
        ).first() is not None
