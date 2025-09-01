#!/usr/bin/env python3
"""Check current embedding_status values"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal, Session, PromptVariant, Response

def check_embedding_status():
    """Check current embedding_status values"""
    db = SessionLocal()
    
    try:
        # Check sessions
        sessions = db.query(Session).all()
        print(f"=== Sessions ({len(sessions)}) ===")
        for s in sessions:
            print(f"  ID {s.id}: embedding_status='{s.embedding_status}', name='{s.name}'")
        
        # Check prompt variants
        variants = db.query(PromptVariant).limit(10).all()
        total_variants = db.query(PromptVariant).count()
        print(f"\n=== Prompt Variants ({total_variants} total, showing first 10) ===")
        for v in variants:
            print(f"  ID {v.id}: embedding_status='{v.embedding_status}', session_id={v.session_id}")
        
        # Check responses
        responses = db.query(Response).limit(5).all()
        total_responses = db.query(Response).count()
        print(f"\n=== Responses ({total_responses} total, showing first 5) ===")
        for r in responses:
            print(f"  ID {r.id}: embedding_status='{r.embedding_status}', prompt_variant_id={r.prompt_variant_id}")
        
    except Exception as e:
        print(f"❌ Error checking embedding status: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    check_embedding_status()