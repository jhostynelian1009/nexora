# Ref: RNF-007, B-018
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.config import settings
from app.db.base import Base
from app.api.deps import get_db
from app.main import app

# MySQL test database connection string from configuration
TEST_DATABASE_URL = settings.TEST_DATABASE_URL

engine = create_engine(TEST_DATABASE_URL, pool_pre_ping=True)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def verify_safety_guard():
    """Safety guard to prevent accidental drops on non-test databases."""
    db_name = engine.url.database
    if not db_name or not db_name.endswith("_test"):
        raise RuntimeError(
            f"SAFETY GUARD TRIGGERED: Refusing to drop tables on database '{db_name}'. "
            "Database name MUST end with '_test' to be used in test execution."
        )

@pytest.fixture(scope="function")
def db_session():
    # Execute safety guard check
    verify_safety_guard()

    # Clean and recreate schema in MySQL test DB before each test
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        verify_safety_guard()
        Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="function")
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()
