# Ref: RF2-009, RF2-010, B2-004, B2-005
import html
from typing import List, Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.models.user import User
from app.schemas.conversation import ConversationResponse, MessageResponse
from app.schemas.comment import AuthorSummary
from app.repositories.conversation_repository import ConversationRepository
from app.repositories.user_repository import UserRepository

class ChatService:
    def __init__(self, db: Session):
        self.db = db
        self.conv_repo = ConversationRepository(db)
        self.user_repo = UserRepository(db)

    def get_or_create_conversation(self, current_user: User, other_user_id: int) -> ConversationResponse:
        if current_user.id == other_user_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No puedes iniciar una conversación contigo mismo."
            )

        other_user = self.user_repo.get_by_id(other_user_id)
        if not other_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Usuario no encontrado."
            )

        conv = self.conv_repo.find_between_users(current_user.id, other_user_id)
        if not conv:
            conv = self.conv_repo.create_conversation(current_user.id, other_user_id)

        return self._format_conversation(conv, current_user.id)

    def list_conversations(self, current_user: User) -> List[ConversationResponse]:
        convs = self.conv_repo.get_user_conversations(current_user.id)
        return [self._format_conversation(c, current_user.id) for c in convs]

    def get_messages(self, current_user: User, conversation_id: int, limit: int = 50, offset: int = 0) -> List[MessageResponse]:
        if not self.conv_repo.is_member(conversation_id, current_user.id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No perteneces a esta conversación."
            )

        messages = self.conv_repo.get_messages(conversation_id, limit, offset)
        return [
            MessageResponse(
                id=m.id,
                conversation_id=m.conversation_id,
                sender=AuthorSummary(
                    id=m.sender.id,
                    name=m.sender.name,
                    career=m.sender.career,
                    avatar_url=m.sender.avatar_url
                ),
                content=m.content,
                is_read=m.is_read,
                read_at=m.read_at,
                created_at=m.created_at
            )
            for m in messages
        ]

    def send_message(self, current_user: User, conversation_id: int, content: str) -> MessageResponse:
        if not self.conv_repo.is_member(conversation_id, current_user.id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No perteneces a esta conversación."
            )

        clean_content = content.strip()
        if not clean_content:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El mensaje no puede estar vacío."
            )
        if len(clean_content) > 2000:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El mensaje no puede superar 2000 caracteres."
            )

        # Escapar HTML por seguridad
        escaped_content = html.escape(clean_content)

        msg = self.conv_repo.create_message(conversation_id, current_user.id, escaped_content)

        # Notify other member(s)
        conv = self.conv_repo.get_by_id(conversation_id)
        if conv:
            for member in conv.members:
                if member.user_id != current_user.id:
                    from app.services.notification_service import NotificationService
                    ns = NotificationService(self.db)
                    ns.create_notification(
                        recipient_id=member.user_id,
                        actor_id=current_user.id,
                        type="message",
                        entity_type="conversation",
                        entity_id=conversation_id,
                        payload={"message": f"Nuevo mensaje de {current_user.name}"}
                    )

        return MessageResponse(
            id=msg.id,
            conversation_id=msg.conversation_id,
            sender=AuthorSummary(
                id=msg.sender.id,
                name=msg.sender.name,
                career=msg.sender.career,
                avatar_url=msg.sender.avatar_url
            ),
            content=msg.content,
            is_read=msg.is_read,
            read_at=msg.read_at,
            created_at=msg.created_at
        )

    def mark_read(self, current_user: User, conversation_id: int) -> int:
        if not self.conv_repo.is_member(conversation_id, current_user.id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No perteneces a esta conversación."
            )
        return self.conv_repo.mark_as_read(conversation_id, current_user.id)

    def _format_conversation(self, conv, current_user_id: int) -> ConversationResponse:
        other_member = next((m for m in conv.members if m.user_id != current_user_id), None)
        if not other_member:
            other_user_summary = AuthorSummary(id=current_user_id, name="Desconocido", career="")
        else:
            other_user_summary = AuthorSummary(
                id=other_member.user.id,
                name=other_member.user.name,
                career=other_member.user.career,
                avatar_url=other_member.user.avatar_url
            )

        last_msg = conv.messages[-1] if conv.messages else None
        last_msg_response = None
        if last_msg:
            last_msg_response = MessageResponse(
                id=last_msg.id,
                conversation_id=last_msg.conversation_id,
                sender=AuthorSummary(
                    id=last_msg.sender.id,
                    name=last_msg.sender.name,
                    career=last_msg.sender.career,
                    avatar_url=last_msg.sender.avatar_url
                ),
                content=last_msg.content,
                is_read=last_msg.is_read,
                read_at=last_msg.read_at,
                created_at=last_msg.created_at
            )

        unread_count = self.conv_repo.get_unread_count(conv.id, current_user_id)

        return ConversationResponse(
            id=conv.id,
            other_user=other_user_summary,
            last_message=last_msg_response,
            unread_count=unread_count,
            updated_at=conv.updated_at
        )
