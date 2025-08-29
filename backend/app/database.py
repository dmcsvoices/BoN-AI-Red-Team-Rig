from sqlalchemy import create_engine, Column, Integer, String, DateTime, Text, Boolean, ForeignKey, Float
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime

DATABASE_URL = "sqlite:///./sessions.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Sessions table
class Session(Base):
    __tablename__ = "sessions"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    target_model = Column(String, nullable=False)  # Now a text input
    seed_prompt = Column(Text, nullable=False)
    prompt_generation_llm = Column(String, nullable=False)  # LLM for generating attack prompts
    evaluation_llm = Column(String, nullable=False)  # LLM for evaluating responses
    status = Column(String, default="created")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    prompt_variants = relationship("PromptVariant", back_populates="session", cascade="all, delete-orphan")
    responses = relationship("Response", back_populates="session", cascade="all, delete-orphan")

# Prompt variants table
class PromptVariant(Base):
    __tablename__ = "prompt_variants"
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("sessions.id"), nullable=False)
    text = Column(Text, nullable=False)
    attack_technique = Column(String)
    approved = Column(Boolean, default=None)  # None=pending, True/False=approved/rejected
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    session = relationship("Session", back_populates="prompt_variants")
    responses = relationship("Response", back_populates="prompt_variant", cascade="all, delete-orphan")

# Responses table
class Response(Base):
    __tablename__ = "responses"
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("sessions.id"), nullable=False)
    prompt_variant_id = Column(Integer, ForeignKey("prompt_variants.id"))
    test_prompt = Column(Text)
    target_response = Column(Text)
    evaluation_result = Column(Text)
    is_dangerous = Column(Boolean, default=None)  # None=not evaluated, True/False=dangerous/safe
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    session = relationship("Session", back_populates="responses")
    prompt_variant = relationship("PromptVariant", back_populates="responses")

# Create tables
Base.metadata.create_all(bind=engine)