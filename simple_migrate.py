#!/usr/bin/env python3
"""
Simple PostgreSQL Migration Script for BoN HITL MVP
"""

import os
import sqlite3
import sys
from datetime import datetime
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

def test_postgresql_connection():
    """Test PostgreSQL connection"""
    database_url = "postgresql://postgres:password@localhost:5432/bonhitl"
    
    try:
        engine = create_engine(database_url)
        with engine.connect() as conn:
            result = conn.execute(text("SELECT version()"))
            version = result.fetchone()[0]
            print(f"✅ PostgreSQL connection successful!")
            print(f"   Version: {version}")
            
            # Test pgvector extension
            result = conn.execute(text("SELECT 1 FROM pg_extension WHERE extname = 'vector'"))
            if result.fetchone():
                print("✅ pgvector extension is installed")
            else:
                print("❌ pgvector extension not found")
                return False
                
        return True, engine
    except Exception as e:
        print(f"❌ PostgreSQL connection failed: {e}")
        return False, None

def migrate_sqlite_data():
    """Migrate existing SQLite data if available"""
    sqlite_path = "backend/sessions.db"
    
    if not os.path.exists(sqlite_path):
        print(f"No SQLite database found at {sqlite_path}")
        return True
    
    print(f"Found SQLite database at {sqlite_path}")
    # For now, just report what we found
    
    try:
        conn = sqlite3.connect(sqlite_path)
        cursor = conn.cursor()
        
        # Check tables and row counts
        tables = ["sessions", "prompt_variants", "responses", "attack_evasions"]
        for table in tables:
            try:
                cursor.execute(f"SELECT COUNT(*) FROM {table}")
                count = cursor.fetchone()[0]
                print(f"  {table}: {count} rows")
            except sqlite3.OperationalError:
                print(f"  {table}: table not found")
        
        conn.close()
        print("SQLite data inspection complete")
        return True
        
    except Exception as e:
        print(f"Error inspecting SQLite database: {e}")
        return False

def update_environment():
    """Update environment for PostgreSQL"""
    database_url = "postgresql://postgres:password@localhost:5432/bonhitl"
    
    # Update the backend database.py to use PostgreSQL
    print("Updating database configuration...")
    os.environ["DATABASE_URL"] = database_url
    
    # Create a simple env file for the backend
    with open("backend/.env", "w") as f:
        f.write(f"DATABASE_URL={database_url}\n")
    
    print("✅ Environment configured for PostgreSQL")

def main():
    print("BoN HITL MVP - Simple PostgreSQL Migration")
    print("=" * 45)
    
    # Test PostgreSQL connection
    print("1. Testing PostgreSQL connection...")
    success, engine = test_postgresql_connection()
    
    if not success:
        print("\n❌ PostgreSQL setup failed. Please ensure:")
        print("   - PostgreSQL is running")
        print("   - User 'postgres' exists with password 'password'")
        print("   - Database 'bonhitl' exists")
        print("   - pgvector extension is installed")
        return
    
    # Check for existing SQLite data
    print("\n2. Checking for existing SQLite data...")
    migrate_sqlite_data()
    
    # Update environment configuration
    print("\n3. Updating environment configuration...")
    update_environment()
    
    print("\n✅ Migration setup complete!")
    print("\nNext steps:")
    print("1. Stop your current backend service")
    print("2. Restart backend - it will now use PostgreSQL")
    print("3. Backend will auto-create tables and populate initial data")
    print("\nDatabase URL: postgresql://postgres:password@localhost:5432/bonhitl")

if __name__ == "__main__":
    main()