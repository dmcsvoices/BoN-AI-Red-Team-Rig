-- PostgreSQL initialization script for BoN HITL MVP
-- This script sets up the database with pgvector extension

-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create necessary indexes for performance (will be created after tables are populated)
-- Vector indexes will be created by the application when data is available