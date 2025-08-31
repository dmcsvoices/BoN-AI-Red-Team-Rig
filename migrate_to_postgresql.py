#!/usr/bin/env python3
"""
PostgreSQL Migration Script for BoN HITL MVP

This script migrates data from SQLite to PostgreSQL and sets up pgvector support.
"""

import os
import sqlite3
import json
from datetime import datetime
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
import sys

# Add the backend app to the Python path
sys.path.append('backend')

# Import the models without triggering database creation
os.environ["DATABASE_URL"] = "postgresql://postgres:password@localhost:5432/bonhitl"

from backend.app.database import Base, Session, PromptVariant, Response, AttackEvasion

def setup_postgresql_database():
    """Create PostgreSQL database and enable pgvector extension"""
    # Database connection parameters
    db_host = os.getenv("DB_HOST", "localhost")
    db_port = os.getenv("DB_PORT", "5432")
    db_user = os.getenv("DB_USER", "postgres")
    db_password = os.getenv("DB_PASSWORD", "password")
    db_name = os.getenv("DB_NAME", "bonhitl")
    
    # Connect to PostgreSQL server (not specific database)
    postgres_url = f"postgresql://{db_user}:{db_password}@{db_host}:{db_port}/postgres"
    
    try:
        engine = create_engine(postgres_url)
        with engine.connect() as conn:
            # Create database if it doesn't exist
            conn.execute(text("COMMIT"))  # End any existing transaction
            try:
                conn.execute(text(f"CREATE DATABASE {db_name}"))
                print(f"Created database: {db_name}")
            except Exception as e:
                if "already exists" in str(e):
                    print(f"Database {db_name} already exists")
                else:
                    print(f"Error creating database: {e}")
        
        # Now connect to the specific database
        database_url = f"postgresql://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}"
        engine = create_engine(database_url)
        
        with engine.connect() as conn:
            # Enable pgvector extension
            try:
                conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
                conn.commit()
                print("pgvector extension enabled")
            except Exception as e:
                print(f"Warning: Could not enable pgvector extension: {e}")
                print("Make sure PostgreSQL has pgvector installed")
        
        return database_url, engine
        
    except Exception as e:
        print(f"Error setting up PostgreSQL database: {e}")
        return None, None

def migrate_sqlite_data(sqlite_path, postgresql_engine):
    """Migrate data from SQLite to PostgreSQL"""
    if not os.path.exists(sqlite_path):
        print(f"SQLite database not found at: {sqlite_path}")
        return
    
    # Create PostgreSQL tables
    Base.metadata.create_all(bind=postgresql_engine)
    print("PostgreSQL tables created")
    
    # Connect to SQLite
    sqlite_conn = sqlite3.connect(sqlite_path)
    sqlite_conn.row_factory = sqlite3.Row  # Access columns by name
    
    # Create PostgreSQL session
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=postgresql_engine)
    pg_session = SessionLocal()
    
    try:
        print("Starting data migration...")
        
        # Migrate sessions
        print("Migrating sessions...")
        sessions_cursor = sqlite_conn.execute("SELECT * FROM sessions")
        session_id_mapping = {}  # SQLite ID -> PostgreSQL ID mapping
        
        for row in sessions_cursor:
            session = Session(
                name=row['name'],
                target_model=row['target_model'],
                seed_prompt=row['seed_prompt'],
                prompt_generation_llm=row['prompt_generation_llm'],
                evaluation_llm=row['evaluation_llm'],
                status=row['status'],
                created_at=datetime.fromisoformat(row['created_at'].replace('Z', '+00:00')) if row['created_at'] else datetime.utcnow(),
                updated_at=datetime.fromisoformat(row['updated_at'].replace('Z', '+00:00')) if row['updated_at'] else datetime.utcnow()
            )
            pg_session.add(session)
            pg_session.flush()  # Get the new ID
            session_id_mapping[row['id']] = session.id
            print(f"  Migrated session: {row['name']}")
        
        # Migrate attack evasions
        print("Migrating attack evasions...")
        evasions_cursor = sqlite_conn.execute("SELECT * FROM attack_evasions")
        evasion_id_mapping = {}
        
        for row in evasions_cursor:
            evasion = AttackEvasion(
                name=row['name'],
                display_name=row['display_name'],
                category=row['category'],
                description=row['description'],
                is_reversible=bool(row['is_reversible']),
                implementation_status=row['implementation_status'],
                created_at=datetime.fromisoformat(row['created_at'].replace('Z', '+00:00')) if row['created_at'] else datetime.utcnow()
            )
            pg_session.add(evasion)
            pg_session.flush()
            evasion_id_mapping[row['id']] = evasion.id
            print(f"  Migrated evasion: {row['name']}")
        
        # Migrate prompt variants
        print("Migrating prompt variants...")
        variants_cursor = sqlite_conn.execute("SELECT * FROM prompt_variants")
        variant_id_mapping = {}
        
        for row in variants_cursor:
            variant = PromptVariant(
                session_id=session_id_mapping[row['session_id']],
                text=row['text'],
                attack_technique=row['attack_technique'],
                evasion_technique=row.get('evasion_technique'),
                pre_evasion_text=row.get('pre_evasion_text'),
                approved=bool(row['approved']) if row['approved'] is not None else None,
                created_at=datetime.fromisoformat(row['created_at'].replace('Z', '+00:00')) if row['created_at'] else datetime.utcnow()
            )
            pg_session.add(variant)
            pg_session.flush()
            variant_id_mapping[row['id']] = variant.id
            print(f"  Migrated variant: {row['attack_technique']}")
        
        # Migrate responses
        print("Migrating responses...")
        responses_cursor = sqlite_conn.execute("SELECT * FROM responses")
        
        for row in responses_cursor:
            response = Response(
                session_id=session_id_mapping[row['session_id']],
                prompt_variant_id=variant_id_mapping.get(row['prompt_variant_id']) if row['prompt_variant_id'] else None,
                test_prompt=row['test_prompt'],
                target_response=row['target_response'],
                evaluation_result=row['evaluation_result'],
                is_dangerous=bool(row['is_dangerous']) if row['is_dangerous'] is not None else None,
                human_feedback=row.get('human_feedback'),
                created_at=datetime.fromisoformat(row['created_at'].replace('Z', '+00:00')) if row['created_at'] else datetime.utcnow()
            )
            pg_session.add(response)
            print(f"  Migrated response")
        
        # Commit all changes
        pg_session.commit()
        print("Data migration completed successfully!")
        
        # Print summary
        sessions_count = pg_session.query(Session).count()
        variants_count = pg_session.query(PromptVariant).count()
        responses_count = pg_session.query(Response).count()
        evasions_count = pg_session.query(AttackEvasion).count()
        
        print(f"\nMigration Summary:")
        print(f"  Sessions: {sessions_count}")
        print(f"  Prompt Variants: {variants_count}")
        print(f"  Responses: {responses_count}")
        print(f"  Attack Evasions: {evasions_count}")
        
    except Exception as e:
        print(f"Error during migration: {e}")
        pg_session.rollback()
        raise
    finally:
        sqlite_conn.close()
        pg_session.close()

def create_vector_indexes(engine):
    """Create vector similarity search indexes"""
    print("Creating vector indexes for similarity search...")
    
    with engine.connect() as conn:
        try:
            # Create indexes for vector columns
            conn.execute(text("""
                CREATE INDEX IF NOT EXISTS idx_sessions_seed_embedding 
                ON sessions USING ivfflat (seed_prompt_embedding vector_cosine_ops) 
                WITH (lists = 100)
            """))
            
            conn.execute(text("""
                CREATE INDEX IF NOT EXISTS idx_prompt_variants_embedding 
                ON prompt_variants USING ivfflat (text_embedding vector_cosine_ops) 
                WITH (lists = 100)
            """))
            
            conn.execute(text("""
                CREATE INDEX IF NOT EXISTS idx_responses_embedding 
                ON responses USING ivfflat (response_embedding vector_cosine_ops) 
                WITH (lists = 100)
            """))
            
            conn.commit()
            print("Vector indexes created successfully")
            
        except Exception as e:
            print(f"Warning: Could not create vector indexes: {e}")
            print("Indexes will be created automatically as data is inserted")

def main():
    """Main migration function"""
    print("BoN HITL MVP - PostgreSQL Migration")
    print("=" * 40)
    
    # Setup PostgreSQL database
    print("Setting up PostgreSQL database...")
    database_url, engine = setup_postgresql_database()
    
    if not engine:
        print("Failed to setup PostgreSQL database")
        return
    
    print(f"Connected to PostgreSQL: {database_url}")
    
    # Update environment variable for the application
    os.environ["DATABASE_URL"] = database_url
    print(f"Set DATABASE_URL environment variable")
    
    # Migrate SQLite data if it exists
    sqlite_path = "backend/sessions.db"
    if os.path.exists(sqlite_path):
        print(f"\nFound SQLite database at: {sqlite_path}")
        migrate_sqlite_data(sqlite_path, engine)
    else:
        print(f"\nNo SQLite database found at: {sqlite_path}")
        print("Creating fresh PostgreSQL database...")
        Base.metadata.create_all(bind=engine)
        
        # Run the population script for attack evasions
        from backend.app.database import populate_attack_evasions, migrate_database
        migrate_database()
        populate_attack_evasions()
    
    # Create vector indexes
    create_vector_indexes(engine)
    
    print("\n✅ PostgreSQL migration completed!")
    print(f"Your application is now configured to use PostgreSQL with pgvector")
    print(f"Database URL: {database_url}")
    print("\nNext steps:")
    print("1. Set DATABASE_URL environment variable in your deployment")
    print("2. Restart your FastAPI backend")
    print("3. Test the application to ensure everything works")

if __name__ == "__main__":
    main()