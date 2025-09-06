from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy import create_engine
import os


DB_URL = os.getenv("DATABASE_URL", "sqlite:///./data.db")

engine = create_engine(
    DB_URL,
    connect_args={"check_same_thread": False} if DB_URL.startswith("sqlite") else {},
    future=True,
)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)
Base = declarative_base()
