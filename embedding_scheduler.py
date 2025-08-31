#!/usr/bin/env python3
"""
Embedding Scheduler for BoN HITL MVP

This script runs scheduled embedding generation for macOS using launchd.
It processes the embedding queue during configured times (default 6AM and 11PM).
"""

import os
import sys
import json
import requests
import logging
from datetime import datetime, time
from pathlib import Path

# Setup logging
log_dir = Path(__file__).parent / "logs"
log_dir.mkdir(exist_ok=True)
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(log_dir / "embedding_scheduler.log"),
        logging.StreamHandler()
    ]
)

def load_settings():
    """Load settings from frontend settings file"""
    settings_path = Path(__file__).parent / "frontend/src/settings.json"
    
    # Default settings
    default_settings = {
        "embeddingUrl": "http://localhost:1234/v1",
        "embeddingModel": "text-embedding-3-small",
        "embeddingSchedule1": "06:00",
        "embeddingSchedule2": "23:00",
        "enableEmbeddingQueue": True
    }
    
    try:
        if settings_path.exists():
            with open(settings_path, 'r') as f:
                saved_settings = json.load(f)
                # Merge with defaults
                return {**default_settings, **saved_settings}
    except Exception as e:
        logging.warning(f"Could not load settings: {e}")
    
    return default_settings

def should_run_now(settings):
    """Check if embedding generation should run now based on schedule"""
    if not settings.get("enableEmbeddingQueue", True):
        logging.info("Embedding queue is disabled in settings")
        return False
    
    now = datetime.now().time()
    schedule1 = time.fromisoformat(settings.get("embeddingSchedule1", "06:00"))
    schedule2 = time.fromisoformat(settings.get("embeddingSchedule2", "23:00"))
    
    # Check if current time is within 30 minutes of scheduled times
    def time_diff_minutes(t1, t2):
        dt1 = datetime.combine(datetime.today(), t1)
        dt2 = datetime.combine(datetime.today(), t2)
        return abs((dt1 - dt2).total_seconds() / 60)
    
    if time_diff_minutes(now, schedule1) <= 30 or time_diff_minutes(now, schedule2) <= 30:
        return True
    
    # Also check if we're being run manually (command line arg)
    if len(sys.argv) > 1 and sys.argv[1] == "--force":
        logging.info("Force run requested via command line")
        return True
    
    return False

def check_backend_status():
    """Check if backend is running and accessible"""
    try:
        response = requests.get("http://localhost:50000/api/health", timeout=5)
        if response.status_code == 200:
            return True
    except Exception as e:
        logging.error(f"Backend not accessible: {e}")
    
    return False

def get_embedding_status():
    """Get current embedding queue status"""
    try:
        response = requests.get("http://localhost:50000/api/embeddings/status", timeout=10)
        if response.status_code == 200:
            return response.json()
    except Exception as e:
        logging.error(f"Could not get embedding status: {e}")
    
    return None

def generate_embeddings(settings):
    """Trigger embedding generation"""
    try:
        payload = {
            "embedding_url": settings.get("embeddingUrl", "http://localhost:1234/v1"),
            "embedding_model": settings.get("embeddingModel", "text-embedding-3-small"),
            "batch_size": 20  # Process more items during scheduled runs
        }
        
        logging.info(f"Starting embedding generation with settings: {payload}")
        
        response = requests.post(
            "http://localhost:50000/api/embeddings/generate",
            json=payload,
            timeout=300  # 5 minute timeout for embedding generation
        )
        
        if response.status_code == 200:
            results = response.json()
            logging.info(f"Embedding generation completed: {results}")
            return results
        else:
            logging.error(f"Embedding generation failed: {response.status_code} - {response.text}")
            return None
            
    except Exception as e:
        logging.error(f"Error during embedding generation: {e}")
        return None

def create_launchd_plist():
    """Create launchd plist file for scheduled execution"""
    script_path = Path(__file__).absolute()
    plist_path = Path.home() / "Library/LaunchAgents/com.bonhitl.embedding-scheduler.plist"
    
    # Get settings to determine schedule
    settings = load_settings()
    schedule1 = settings.get("embeddingSchedule1", "06:00")
    schedule2 = settings.get("embeddingSchedule2", "23:00")
    
    # Parse times
    hour1, min1 = map(int, schedule1.split(':'))
    hour2, min2 = map(int, schedule2.split(':'))
    
    plist_content = f'''<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.bonhitl.embedding-scheduler</string>
    <key>ProgramArguments</key>
    <array>
        <string>{sys.executable}</string>
        <string>{script_path}</string>
    </array>
    <key>StartCalendarInterval</key>
    <array>
        <dict>
            <key>Hour</key>
            <integer>{hour1}</integer>
            <key>Minute</key>
            <integer>{min1}</integer>
        </dict>
        <dict>
            <key>Hour</key>
            <integer>{hour2}</integer>
            <key>Minute</key>
            <integer>{min2}</integer>
        </dict>
    </array>
    <key>StandardOutPath</key>
    <string>{log_dir}/embedding_scheduler.log</string>
    <key>StandardErrorPath</key>
    <string>{log_dir}/embedding_scheduler_error.log</string>
    <key>RunAtLoad</key>
    <false/>
</dict>
</plist>'''
    
    try:
        plist_path.parent.mkdir(exist_ok=True)
        with open(plist_path, 'w') as f:
            f.write(plist_content)
        
        logging.info(f"Created launchd plist at: {plist_path}")
        logging.info(f"Scheduled times: {schedule1} and {schedule2}")
        
        # Load the plist
        os.system(f"launchctl unload {plist_path} 2>/dev/null")
        os.system(f"launchctl load {plist_path}")
        
        logging.info("Embedding scheduler registered with launchd")
        return True
        
    except Exception as e:
        logging.error(f"Error creating launchd plist: {e}")
        return False

def main():
    """Main function"""
    logging.info("=== Embedding Scheduler Started ===")
    
    # Handle setup command
    if len(sys.argv) > 1 and sys.argv[1] == "--setup":
        logging.info("Setting up scheduled embedding generation...")
        if create_launchd_plist():
            print("✅ Embedding scheduler setup complete!")
            print(f"Embeddings will be generated automatically at scheduled times.")
            print(f"Check logs at: {log_dir}/embedding_scheduler.log")
        else:
            print("❌ Failed to setup embedding scheduler")
        return
    
    # Handle status command
    if len(sys.argv) > 1 and sys.argv[1] == "--status":
        if not check_backend_status():
            print("❌ Backend not running")
            return
        
        status = get_embedding_status()
        if status:
            print(f"📊 Embedding Queue Status:")
            print(f"   Pending: {status['pending']['total']} items")
            print(f"   Processing: {status['processing']['total']} items") 
            print(f"   Completed: {status['completed']['total']} items")
            
            if status['is_processing']:
                print("   ⚠️  Embedding generation is currently running")
            elif status['pending']['total'] > 0:
                print("   ⏳ Items waiting for embedding generation")
            else:
                print("   ✅ No pending embeddings")
        else:
            print("❌ Could not get embedding status")
        return
    
    # Load settings
    settings = load_settings()
    logging.info(f"Loaded settings: {settings}")
    
    # Check if we should run now
    if not should_run_now(settings):
        logging.info("Not scheduled to run at this time")
        return
    
    # Check backend status
    if not check_backend_status():
        logging.error("Backend is not accessible - cannot generate embeddings")
        return
    
    # Check if already processing
    status = get_embedding_status()
    if status and status.get('is_processing', False):
        logging.info("Embedding generation already in progress - skipping")
        return
    
    # Check if there's work to do
    if status and status['pending']['total'] == 0:
        logging.info("No pending embeddings - nothing to do")
        return
    
    logging.info(f"Found {status['pending']['total']} pending embeddings")
    
    # Generate embeddings
    results = generate_embeddings(settings)
    
    if results:
        total_processed = results['sessions_processed'] + results['variants_processed'] + results['responses_processed']
        logging.info(f"Successfully processed {total_processed} embeddings")
        
        if results['errors']:
            logging.warning(f"Encountered {len(results['errors'])} errors during processing")
            for error in results['errors']:
                logging.warning(f"  - {error}")
    else:
        logging.error("Embedding generation failed")
    
    logging.info("=== Embedding Scheduler Finished ===")

if __name__ == "__main__":
    main()