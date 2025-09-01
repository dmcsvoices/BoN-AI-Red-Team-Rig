#!/usr/bin/env python3
"""
Fix embedding status for existing data
This script updates existing sessions, prompt variants, and responses 
to have embedding_status='pending' so they can be processed by the scheduler.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal, Session, PromptVariant, Response

def fix_embedding_status():
    """Update existing data to have embedding_status='pending'"""
    db = SessionLocal()
    
    try:
        # Update sessions
        sessions_updated = db.query(Session).filter(
            Session.embedding_status.is_(None)
        ).update({
            Session.embedding_status: "pending"
        }, synchronize_session=False)
        
        # Update prompt variants
        variants_updated = db.query(PromptVariant).filter(
            PromptVariant.embedding_status.is_(None)
        ).update({
            PromptVariant.embedding_status: "pending"
        }, synchronize_session=False)
        
        # Update responses 
        responses_updated = db.query(Response).filter(
            Response.embedding_status.is_(None)
        ).update({
            Response.embedding_status: "pending"
        }, synchronize_session=False)
        
        db.commit()
        
        print(f"✅ Updated embedding status:")
        print(f"   Sessions: {sessions_updated}")
        print(f"   Prompt Variants: {variants_updated}")
        print(f"   Responses: {responses_updated}")
        print(f"   Total: {sessions_updated + variants_updated + responses_updated} items now pending")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error updating embedding status: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    fix_embedding_status()