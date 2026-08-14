# Ref: RF-019, B-016, B2-012
from sqlalchemy.orm import Session
from app.db.session import engine, SessionLocal
from app.db.base import Base
from app.models.user import User
from app.models.post import Post
from app.models.like import Like
from app.models.comment import Comment
from app.models.follow import Follow
from app.models.conversation import Conversation, ConversationMember, Message
from app.models.notification import Notification
from app.core.security import get_password_hash

def seed_data(db: Session) -> None:
    # Ensure tables exist
    Base.metadata.create_all(bind=engine)

    # Check if demo users already exist
    demo_emails = [
        "ana.torres@nexora.edu",
        "carlos.mendoza@nexora.edu",
        "elena.rojas@nexora.edu",
        "mateo.silva@nexora.edu"
    ]
    
    existing_users = db.query(User).filter(User.email.in_(demo_emails)).all()
    if len(existing_users) >= len(demo_emails):
        # Check if follows exist for demo
        f_count = db.query(Follow).count()
        if f_count > 0:
            print("[Seeder] Demo data already seeded. Skipping.")
            return

        # If users exist but follows don't, fetch users by email
        user_dict = {u.email: u for u in existing_users}
        ana = user_dict.get("ana.torres@nexora.edu")
        carlos = user_dict.get("carlos.mendoza@nexora.edu")
        elena = user_dict.get("elena.rojas@nexora.edu")
        mateo = user_dict.get("mateo.silva@nexora.edu")
    else:
        print("[Seeder] Seeding demo data for Nexora v2...")
        hashed_pwd = get_password_hash("nexora123")

        users_data = [
            {
                "name": "Ana Torres",
                "email": "ana.torres@nexora.edu",
                "career": "Ingeniería de Software",
                "bio": "Apasionada por la arquitectura de software, React y APIs con FastAPI.",
                "avatar_url": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80"
            },
            {
                "name": "Carlos Mendoza",
                "email": "carlos.mendoza@nexora.edu",
                "career": "Desarrollo Web",
                "bio": "Frontend dev enfocado en UX/UI interactivo y rendimiento.",
                "avatar_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
            },
            {
                "name": "Elena Rojas",
                "email": "elena.rojas@nexora.edu",
                "career": "Ciencia de Datos",
                "bio": "Explorando modelos de ML, bases de datos relacionales y visualización.",
                "avatar_url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
            },
            {
                "name": "Mateo Silva",
                "email": "mateo.silva@nexora.edu",
                "career": "Redes y Seguridad",
                "bio": "Interesado en ciberseguridad, protocolos HTTP/TLS y DevOps.",
                "avatar_url": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80"
            }
        ]

        created_users = []
        for u_info in users_data:
            existing = db.query(User).filter(User.email == u_info["email"]).first()
            if not existing:
                user = User(
                    name=u_info["name"],
                    email=u_info["email"],
                    password_hash=hashed_pwd,
                    career=u_info["career"],
                    bio=u_info["bio"],
                    avatar_url=u_info["avatar_url"]
                )
                db.add(user)
                db.commit()
                db.refresh(user)
                created_users.append(user)
            else:
                created_users.append(existing)

        ana, carlos, elena, mateo = created_users[0], created_users[1], created_users[2], created_users[3]

        # Seed Posts
        posts_data = [
            {
                "author": ana,
                "content": "¡Bienvenidos a Nexora v2! 🚀 Ahora contamos con chats en tiempo real, seguidores y carga de imágenes.",
                "image_url": "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=80"
            },
            {
                "author": carlos,
                "content": "Acabo de probar el sistema de chat privado con WebSockets y notificaciones instantáneas. ¡Va genial! 🎨",
                "image_url": "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80"
            },
            {
                "author": elena,
                "content": "Analizando las migraciones Alembic y la estructura de conversaciones y miembros. Totalmente idempotente y seguro. 📊",
                "image_url": None
            },
            {
                "author": mateo,
                "content": "El sistema de recuperación de contraseña con OTP y abstracción de proveedores funciona sin problemas de seguridad. 🔐",
                "image_url": None
            }
        ]

        created_posts = []
        for p_info in posts_data:
            post = Post(
                content=p_info["content"],
                image_url=p_info["image_url"],
                author_id=p_info["author"].id
            )
            db.add(post)
            db.commit()
            db.refresh(post)
            created_posts.append(post)

        p1, p2, p3, p4 = created_posts[0], created_posts[1], created_posts[2], created_posts[3]

        # Seed Likes
        likes_data = [
            (carlos.id, p1.id),
            (elena.id, p1.id),
            (mateo.id, p1.id),
            (ana.id, p2.id),
            (elena.id, p2.id),
            (carlos.id, p3.id),
            (ana.id, p4.id),
        ]
        for uid, pid in likes_data:
            lk = Like(user_id=uid, post_id=pid)
            db.add(lk)
        db.commit()

        # Seed Comments
        comments_data = [
            (carlos.id, p1.id, "Excelente trabajo equipo. ¡La v2 quedó increíble!"),
            (elena.id, p1.id, "Felicidades, las notificaciones en tiempo real funcionan fluido."),
            (ana.id, p2.id, "¡El indicador 'Escribiendo...' se siente muy suave!"),
            (mateo.id, p3.id, "Gran aporte Elena, la suite de pruebas pasó al 100%."),
            (carlos.id, p4.id, "Muy importante la validación estricta de OTP."),
        ]
        for uid, pid, text in comments_data:
            cm = Comment(author_id=uid, post_id=pid, content=text)
            db.add(cm)
        db.commit()

    # Seed Follows if not exist
    if ana and carlos and elena and mateo:
        follow_pairs = [
            (ana.id, carlos.id),
            (carlos.id, ana.id),
            (ana.id, elena.id),
            (mateo.id, ana.id),
            (elena.id, carlos.id)
        ]
        for follower_id, followed_id in follow_pairs:
            existing = db.query(Follow).filter(Follow.follower_id == follower_id, Follow.followed_id == followed_id).first()
            if not existing:
                db.add(Follow(follower_id=follower_id, followed_id=followed_id))
        db.commit()

    print("[Seeder] Seed process for Nexora v2 completed successfully!")

if __name__ == "__main__":
    db = SessionLocal()
    try:
        seed_data(db)
    finally:
        db.close()
