"""add_nexora_v2_tables_and_columns

Revision ID: f6106cab73d6
Revises: 
Create Date: 2026-08-12 16:06:28.041217

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.engine import reflection

# revision identifiers, used by Alembic.
revision: str = 'f6106cab73d6'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    bind = op.get_bind()
    inspector = reflection.Inspector.from_engine(bind)
    existing_tables = inspector.get_table_names()

    # 1. Add new columns to existing tables if not present
    posts_cols = [c['name'] for c in inspector.get_columns('posts')]
    if 'image_public_id' not in posts_cols:
        op.add_column('posts', sa.Column('image_public_id', sa.String(length=255), nullable=True))

    users_cols = [c['name'] for c in inspector.get_columns('users')]
    if 'avatar_public_id' not in users_cols:
        op.add_column('users', sa.Column('avatar_public_id', sa.String(length=255), nullable=True))
    if 'phone' not in users_cols:
        op.add_column('users', sa.Column('phone', sa.String(length=30), nullable=True))

    # 2. Create follows table
    if 'follows' not in existing_tables:
        op.create_table(
            'follows',
            sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
            sa.Column('follower_id', sa.Integer(), nullable=False),
            sa.Column('followed_id', sa.Integer(), nullable=False),
            sa.Column('created_at', sa.DateTime(), nullable=False),
            sa.ForeignKeyConstraint(['follower_id'], ['users.id'], ondelete='CASCADE'),
            sa.ForeignKeyConstraint(['followed_id'], ['users.id'], ondelete='CASCADE'),
            sa.PrimaryKeyConstraint('id'),
            sa.UniqueConstraint('follower_id', 'followed_id', name='uq_follower_followed')
        )
        op.create_index(op.f('ix_follows_follower_id'), 'follows', ['follower_id'], unique=False)
        op.create_index(op.f('ix_follows_followed_id'), 'follows', ['followed_id'], unique=False)

    # 3. Create conversations table
    if 'conversations' not in existing_tables:
        op.create_table(
            'conversations',
            sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
            sa.Column('created_at', sa.DateTime(), nullable=False),
            sa.Column('updated_at', sa.DateTime(), nullable=False),
            sa.PrimaryKeyConstraint('id')
        )

    # 4. Create conversation_members table
    if 'conversation_members' not in existing_tables:
        op.create_table(
            'conversation_members',
            sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
            sa.Column('conversation_id', sa.Integer(), nullable=False),
            sa.Column('user_id', sa.Integer(), nullable=False),
            sa.Column('joined_at', sa.DateTime(), nullable=False),
            sa.ForeignKeyConstraint(['conversation_id'], ['conversations.id'], ondelete='CASCADE'),
            sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
            sa.PrimaryKeyConstraint('id'),
            sa.UniqueConstraint('conversation_id', 'user_id', name='uq_conversation_user')
        )
        op.create_index(op.f('ix_conversation_members_conversation_id'), 'conversation_members', ['conversation_id'], unique=False)
        op.create_index(op.f('ix_conversation_members_user_id'), 'conversation_members', ['user_id'], unique=False)

    # 5. Create messages table
    if 'messages' not in existing_tables:
        op.create_table(
            'messages',
            sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
            sa.Column('conversation_id', sa.Integer(), nullable=False),
            sa.Column('sender_id', sa.Integer(), nullable=False),
            sa.Column('content', sa.Text(), nullable=False),
            sa.Column('is_read', sa.Boolean(), nullable=False, server_default=sa.text('0')),
            sa.Column('read_at', sa.DateTime(), nullable=True),
            sa.Column('created_at', sa.DateTime(), nullable=False),
            sa.ForeignKeyConstraint(['conversation_id'], ['conversations.id'], ondelete='CASCADE'),
            sa.ForeignKeyConstraint(['sender_id'], ['users.id'], ondelete='CASCADE'),
            sa.PrimaryKeyConstraint('id')
        )
        op.create_index(op.f('ix_messages_conversation_id'), 'messages', ['conversation_id'], unique=False)
        op.create_index(op.f('ix_messages_sender_id'), 'messages', ['sender_id'], unique=False)
        op.create_index(op.f('ix_messages_created_at'), 'messages', ['created_at'], unique=False)

    # 6. Create notifications table
    if 'notifications' not in existing_tables:
        op.create_table(
            'notifications',
            sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
            sa.Column('recipient_id', sa.Integer(), nullable=False),
            sa.Column('actor_id', sa.Integer(), nullable=False),
            sa.Column('type', sa.String(length=50), nullable=False),
            sa.Column('entity_type', sa.String(length=50), nullable=True),
            sa.Column('entity_id', sa.Integer(), nullable=True),
            sa.Column('payload_json', sa.Text(), nullable=True),
            sa.Column('is_read', sa.Boolean(), nullable=False, server_default=sa.text('0')),
            sa.Column('read_at', sa.DateTime(), nullable=True),
            sa.Column('created_at', sa.DateTime(), nullable=False),
            sa.ForeignKeyConstraint(['recipient_id'], ['users.id'], ondelete='CASCADE'),
            sa.ForeignKeyConstraint(['actor_id'], ['users.id'], ondelete='CASCADE'),
            sa.PrimaryKeyConstraint('id')
        )
        op.create_index(op.f('ix_notifications_recipient_id'), 'notifications', ['recipient_id'], unique=False)
        op.create_index(op.f('ix_notifications_actor_id'), 'notifications', ['actor_id'], unique=False)
        op.create_index(op.f('ix_notifications_created_at'), 'notifications', ['created_at'], unique=False)

    # 7. Create password_reset_codes table
    if 'password_reset_codes' not in existing_tables:
        op.create_table(
            'password_reset_codes',
            sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
            sa.Column('user_id', sa.Integer(), nullable=False),
            sa.Column('code_hash', sa.String(length=255), nullable=False),
            sa.Column('expires_at', sa.DateTime(), nullable=False),
            sa.Column('attempts', sa.Integer(), nullable=False, server_default=sa.text('0')),
            sa.Column('used_at', sa.DateTime(), nullable=True),
            sa.Column('created_at', sa.DateTime(), nullable=False),
            sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
            sa.PrimaryKeyConstraint('id')
        )
        op.create_index(op.f('ix_password_reset_codes_user_id'), 'password_reset_codes', ['user_id'], unique=False)

def downgrade() -> None:
    bind = op.get_bind()
    inspector = reflection.Inspector.from_engine(bind)
    existing_tables = inspector.get_table_names()

    if 'password_reset_codes' in existing_tables:
        op.drop_table('password_reset_codes')
    if 'notifications' in existing_tables:
        op.drop_table('notifications')
    if 'messages' in existing_tables:
        op.drop_table('messages')
    if 'conversation_members' in existing_tables:
        op.drop_table('conversation_members')
    if 'conversations' in existing_tables:
        op.drop_table('conversations')
    if 'follows' in existing_tables:
        op.drop_table('follows')

    users_cols = [c['name'] for c in inspector.get_columns('users')]
    if 'phone' in users_cols:
        op.drop_column('users', 'phone')
    if 'avatar_public_id' in users_cols:
        op.drop_column('users', 'avatar_public_id')

    posts_cols = [c['name'] for c in inspector.get_columns('posts')]
    if 'image_public_id' in posts_cols:
        op.drop_column('posts', 'image_public_id')
