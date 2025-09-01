#!/usr/bin/env python3
"""Reset any items stuck in processing state"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal, Session, PromptVariant, Response

def reset_processing_items():
    """Reset any items stuck in 'processing' state back to 'pending'"""
    db = SessionLocal()
    
    try:
        # Reset processing sessions
        sessions_reset = db.query(Session).filter(
            Session.embedding_status == "processing"
        ).update({
            Session.embedding_status: "pending"
        }, synchronize_session=False)
        
        # Reset processing variants
        variants_reset = db.query(PromptVariant).filter(
            PromptVariant.embedding_status == "processing"
        ).update({
            PromptVariant.embedding_status: "pending"
        }, synchronize_session=False)
        
        # Reset processing responses
        responses_reset = db.query(Response).filter(
            Response.embedding_status == "processing"
        ).update({
            Response.embedding_status: "pending"
        }, synchronize_session=False)
        
        db.commit()
        
        print(f"✅ Reset processing items:")
        print(f"   Sessions: {sessions_reset}")
        print(f"   Prompt Variants: {variants_reset}")
        print(f"   Responses: {responses_reset}")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error resetting processing items: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    reset_processing_items()