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
    evasion_technique = Column(String, default=None)  # None=no evasion, or technique name
    pre_evasion_text = Column(Text, default=None)  # Original text before evasion transform
    approved = Column(Boolean, default=None)  # None=pending, True/False=approved/rejected
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    session = relationship("Session", back_populates="prompt_variants")
    responses = relationship("Response", back_populates="prompt_variant", cascade="all, delete-orphan")

# Attack evasions table
class AttackEvasion(Base):
    __tablename__ = "attack_evasions"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, unique=True)  # "base64", "morse", etc.
    display_name = Column(String, nullable=False)  # "Base64 Encoding"
    category = Column(String, nullable=False)  # "encoding", "markup", "obfuscation"
    description = Column(Text)
    is_reversible = Column(Boolean, default=True)
    implementation_status = Column(String, default="available")  # "available", "experimental", "disabled"
    created_at = Column(DateTime, default=datetime.utcnow)

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
    human_feedback = Column(String, default=None)  # None=not reviewed, "Correct"/"Wrong"=human evaluation
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    session = relationship("Session", back_populates="responses")
    prompt_variant = relationship("PromptVariant", back_populates="responses")

# Check if human_feedback column exists, add it if not
from sqlalchemy import inspect, text

def migrate_database():
    inspector = inspect(engine)
    
    # Check if responses table exists and has human_feedback column
    if 'responses' in inspector.get_table_names():
        columns = [col['name'] for col in inspector.get_columns('responses')]
        if 'human_feedback' not in columns:
            print("Adding human_feedback column to responses table...")
            with engine.connect() as conn:
                conn.execute(text('ALTER TABLE responses ADD COLUMN human_feedback VARCHAR'))
                conn.commit()
            print("human_feedback column added successfully")
    
    # Check if prompt_variants table needs evasion columns
    if 'prompt_variants' in inspector.get_table_names():
        columns = [col['name'] for col in inspector.get_columns('prompt_variants')]
        if 'evasion_technique' not in columns:
            print("Adding evasion columns to prompt_variants table...")
            with engine.connect() as conn:
                conn.execute(text('ALTER TABLE prompt_variants ADD COLUMN evasion_technique VARCHAR'))
                conn.execute(text('ALTER TABLE prompt_variants ADD COLUMN pre_evasion_text TEXT'))
                conn.commit()
            print("Evasion columns added successfully")

def populate_attack_evasions():
    """Populate the attack_evasions table with initial data"""
    from sqlalchemy.orm import Session as DBSession
    
    db = SessionLocal()
    try:
        # Check if already populated
        if db.query(AttackEvasion).count() > 0:
            print("Attack evasions already populated")
            return
        
        print("Populating attack evasions table...")
        
        evasions = [
            # High Priority - Direct ARC overlaps
            AttackEvasion(name="base64", display_name="Base64 Encoding", category="encoding", 
                         description="Encode text using Base64 to obfuscate content"),
            AttackEvasion(name="hex", display_name="Hexadecimal Encoding", category="encoding",
                         description="Convert text to hexadecimal representation"),
            AttackEvasion(name="morse", display_name="Morse Code", category="encoding",
                         description="Transform text using Morse code dots and dashes"),
            AttackEvasion(name="reverse", display_name="Text Reversal", category="obfuscation",
                         description="Reverse the order of characters in the text"),
            AttackEvasion(name="spaces", display_name="Character Spacing", category="obfuscation",
                         description="Add spaces between each character"),
            
            # Markup/Structure
            AttackEvasion(name="json_wrap", display_name="JSON Structure", category="markup",
                         description="Wrap content in JSON format to hide structure"),
            AttackEvasion(name="xml_wrap", display_name="XML Embedding", category="markup",
                         description="Embed content within XML tags"),
            
            # Additional transformations
            AttackEvasion(name="binary", display_name="Binary Encoding", category="encoding",
                         description="Convert text to binary representation"),
            AttackEvasion(name="rot13", display_name="ROT13 Cipher", category="encoding",
                         description="Apply ROT13 character rotation cipher"),
            AttackEvasion(name="case_flip", display_name="Case Changing", category="obfuscation",
                         description="Randomly change character case"),
            AttackEvasion(name="leet", display_name="Leet Speak", category="obfuscation",
                         description="Replace characters with leet speak equivalents"),
        ]
        
        for evasion in evasions:
            db.add(evasion)
        
        db.commit()
        print(f"Added {len(evasions)} attack evasion techniques")
        
    except Exception as e:
        print(f"Error populating attack evasions: {e}")
        db.rollback()
    finally:
        db.close()
    
# Create tables and run migrations
Base.metadata.create_all(bind=engine)
migrate_database()
populate_attack_evasions()