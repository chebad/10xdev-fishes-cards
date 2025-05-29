-- migration file: 20241005123000_create_flashcards_and_contact_form_submissions.sql
-- purpose: create tables flashcards and contact_form_submissions with indexes, triggers, and row-level security (rls) policies
-- created: utc 2024-10-05 12:30:00
-- note: this migration sets up the core schema for the 10xdevs-fishes-cards project

-- enable extension for uuid generation if not exists (this may already be set up in supabase)
create extension if not exists pgcrypto;

-- ====================================
-- create table: flashcards
-- ====================================
create table flashcards (
  id uuid primary key default gen_random_uuid(),  -- unique identifier for flashcard
  user_id uuid not null references auth.users(id) on delete cascade,  -- reference to supabase auth user
  question varchar(1000) not null check (length(question) >= 5),  -- question text with minimum length check
  answer text not null check (length(answer) >= 3),  -- answer text with minimum length check
  source_text_for_ai text,  -- source text used by ai to generate flashcards
  is_ai_generated boolean not null default false,  -- flag indicating if flashcard is ai generated
  ai_accepted_at timestamptz,  -- timestamp when ai generated flashcard is accepted
  created_at timestamptz not null default now(),  -- creation timestamp
  updated_at timestamptz not null default now(),  -- last updated timestamp; will be auto-updated by trigger
  is_deleted boolean not null default false,  -- soft delete flag
  deleted_at timestamptz  -- timestamp for soft deletion
);

-- enable row level security for flashcards table
alter table flashcards enable row level security;

-- ====================================
-- create rls policies for flashcards
-- ====================================

-- policy for select: allow authenticated users to read only their own non-deleted flashcards
create policy flashcards_select_auth on flashcards
  for select
  using (auth.uid() = user_id and is_deleted = false);

-- policy for insert: allow users to insert flashcards for themselves
create policy flashcards_insert_auth on flashcards
  for insert
  with check (auth.uid() = user_id);

-- policy for delete: disallow direct delete to enforce soft deletion
create policy flashcards_delete_deny on flashcards
  for delete
  using (false);

-- ====================================
-- create indexes for flashcards
-- ====================================
create index idx_flashcards_user_id on flashcards(user_id);
create index idx_flashcards_user_id_is_deleted on flashcards(user_id, is_deleted);
create index idx_flashcards_created_at on flashcards(created_at);
create index idx_flashcards_is_ai_generated on flashcards(is_ai_generated);

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

-- optionally, for text search on question using pg_trgm (requires pg_trgm extension)
-- create extension if not exists pg_trgm;
-- create index idx_flashcards_question_trgm on flashcards using gin (question gin_trgm_ops);

-- ====================================
-- create trigger function for auto-updating 'updated_at'
-- ====================================
create or replace function trigger_set_timestamp()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- create trigger for flashcards table to update 'updated_at' column on update
create trigger set_flashcards_timestamp
before update on flashcards
for each row
execute function trigger_set_timestamp();

-- ====================================
-- create table: contact_form_submissions
-- ====================================
create table contact_form_submissions (
  id uuid primary key default gen_random_uuid(),  -- unique identifier for contact form submission
  user_id uuid references auth.users(id) on delete set null,  -- optional reference to user (null for anonymous submissions)
  email_address varchar(255) not null,  -- email address of the submitter
  subject varchar(255),  -- subject of the message
  message_body text not null,  -- content of the message
  submitted_at timestamptz not null default now()  -- submission timestamp
);

-- enable row level security for contact_form_submissions table
alter table contact_form_submissions enable row level security;

-- ====================================
-- create rls policies for contact_form_submissions
-- ====================================

-- policy for insert: allow anyone to submit a contact form; if authenticated, user_id must match auth.uid()
create policy cfs_insert_policy on contact_form_submissions
  for insert
  with check (
    (auth.role() = 'anon' and user_id is null) or
    (auth.role() = 'authenticated' and user_id = auth.uid())
  );

-- policy for select: restrict select access to admin/service role only
create policy cfs_select_policy on contact_form_submissions
  for select
  using (auth.role() = 'service_role');
  
-- policy for update: restrict update access to admin/service role only
create policy cfs_update_policy on contact_form_submissions
  for update
  using (auth.role() = 'service_role');

-- policy for delete: restrict delete access to admin/service role only
create policy cfs_delete_policy on contact_form_submissions
  for delete
  using (auth.role() = 'service_role');

-- ====================================
-- create indexes for contact_form_submissions
-- ====================================
create index idx_cfs_user_id on contact_form_submissions(user_id);
create index idx_cfs_email on contact_form_submissions(email_address);
create index idx_cfs_submitted_at on contact_form_submissions(submitted_at);

-- end of migration 