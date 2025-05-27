-- Migration file: 20250127140000_add_missing_flashcards_indexes.sql
-- Purpose: Add missing indexes for flashcards table to optimize GET /api/flashcards endpoint performance
-- Created: UTC 2025-01-27 14:00:00
-- Note: Adds indexes for updated_at sorting and question text search

-- ====================================
-- Add index for updated_at sorting
-- ====================================
-- This index improves performance when sorting by updatedAt field
CREATE INDEX IF NOT EXISTS idx_flashcards_updated_at ON flashcards(updated_at);

-- ====================================
-- Add composite index for user_id + updated_at
-- ====================================
-- This composite index optimizes queries that filter by user and sort by updated_at
CREATE INDEX IF NOT EXISTS idx_flashcards_user_id_updated_at ON flashcards(user_id, updated_at);

-- ====================================
-- Add composite index for user_id + created_at
-- ====================================
-- This composite index optimizes queries that filter by user and sort by created_at
CREATE INDEX IF NOT EXISTS idx_flashcards_user_id_created_at ON flashcards(user_id, created_at);

-- ====================================
-- Enable pg_trgm extension and add trigram index for text search
-- ====================================
-- Enable pg_trgm extension for efficient ILIKE searches
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create trigram index for question field to optimize ILIKE searches
CREATE INDEX IF NOT EXISTS idx_flashcards_question_trgm ON flashcards USING gin (question gin_trgm_ops);

-- ====================================
-- Add composite index for user_id + is_ai_generated
-- ====================================
-- This composite index optimizes queries that filter by user and AI generation status
CREATE INDEX IF NOT EXISTS idx_flashcards_user_id_is_ai_generated ON flashcards(user_id, is_ai_generated);

-- End of migration 