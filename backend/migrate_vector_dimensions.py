#!/usr/bin/env python3
"""
Migrate vector columns from 1536 to 768 dimensions
This is needed when switching from OpenAI embeddings to nomic-embed-text-v1.5
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import create_engine, text
from app.database import DATABASE_URL

def migrate_vector_dimensions():
    """Migrate vector columns from 1536 to 768 dimensions"""
    engine = create_engine(DATABASE_URL)
    
    print("🔄 Migrating vector dimensions from 1536 to 768...")
    
    try:
        with engine.connect() as conn:
            # Drop existing vector columns (they're empty anyway since embeddings failed)
            print("Dropping existing 1536-dimension vector columns...")
            
            conn.execute(text('ALTER TABLE sessions DROP COLUMN IF EXISTS seed_prompt_embedding'))
            conn.execute(text('ALTER TABLE prompt_variants DROP COLUMN IF EXISTS text_embedding'))
            conn.execute(text('ALTER TABLE responses DROP COLUMN IF EXISTS response_embedding'))
            
            # Add new 768-dimension vector columns
            print("Adding new 768-dimension vector columns...")
            
            conn.execute(text('ALTER TABLE sessions ADD COLUMN seed_prompt_embedding vector(768)'))
            conn.execute(text('ALTER TABLE prompt_variants ADD COLUMN text_embedding vector(768)'))
            conn.execute(text('ALTER TABLE responses ADD COLUMN response_embedding vector(768)'))
            
            conn.commit()
            
        print("✅ Migration completed successfully!")
        print("   - Sessions: seed_prompt_embedding now vector(768)")
        print("   - PromptVariants: text_embedding now vector(768)")
        print("   - Responses: response_embedding now vector(768)")
        print("")
        print("🔄 Next: Run embedding generation to populate the new columns")
        
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        return False
    
    return True

if __name__ == "__main__":
    migrate_vector_dimensions()