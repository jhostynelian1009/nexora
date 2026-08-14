# Ref: RF2-009, RF2-010, B2-004, B2-005
from typing import List
from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.schemas.conversation import ConversationResponse, MessageResponse, MessageCreate
from app.services.chat_service import ChatService

router = APIRouter(prefix="/api/conversations", tags=["Conversaciones"])

@router.post("/{other_user_id}", response_model=ConversationResponse, status_code=status.HTTP_200_OK)
def get_or_create_conversation(
    other_user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = ChatService(db)
    return service.get_or_create_conversation(current_user, other_user_id)

@router.get("", response_model=List[ConversationResponse], status_code=status.HTTP_200_OK)
def list_conversations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = ChatService(db)
    return service.list_conversations(current_user)

@router.get("/{conversation_id}/messages", response_model=List[MessageResponse], status_code=status.HTTP_200_OK)
def get_messages(
    conversation_id: int,
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = ChatService(db)
    return service.get_messages(current_user, conversation_id, limit, offset)

@router.post("/{conversation_id}/messages", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
def send_message(
    conversation_id: int,
    data: MessageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = ChatService(db)
    return service.send_message(current_user, conversation_id, data.content)

@router.post("/{conversation_id}/read", status_code=status.HTTP_200_OK)
def mark_read(
    conversation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = ChatService(db)
    count = service.mark_read(current_user, conversation_id)
    return {"marked_read": count}
