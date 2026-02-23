-- ================================================
-- Job Assist - Supabase Schema
-- Run this in your Supabase SQL Editor
-- ================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ================================================
-- Table: resumes
-- ================================================
CREATE TABLE IF NOT EXISTS resumes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  file_name TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  parsed_text TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS Policies for resumes
ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own resumes"
  ON resumes FOR SELECT
  USING (user_id = requesting_user_id());

CREATE POLICY "Users can insert their own resumes"
  ON resumes FOR INSERT
  WITH CHECK (user_id = requesting_user_id());

CREATE POLICY "Users can delete their own resumes"
  ON resumes FOR DELETE
  USING (user_id = requesting_user_id());

-- ================================================
-- Table: jobs (for Kanban tracker)
-- ================================================
CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  company TEXT NOT NULL,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Saved',
  job_description TEXT,
  url TEXT,
  notes TEXT,
  salary TEXT,
  location TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS Policies for jobs
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own jobs"
  ON jobs FOR SELECT
  USING (user_id = requesting_user_id());

CREATE POLICY "Users can insert their own jobs"
  ON jobs FOR INSERT
  WITH CHECK (user_id = requesting_user_id());

CREATE POLICY "Users can update their own jobs"
  ON jobs FOR UPDATE
  USING (user_id = requesting_user_id());

CREATE POLICY "Users can delete their own jobs"
  ON jobs FOR DELETE
  USING (user_id = requesting_user_id());

-- ================================================
-- Storage Bucket: resumes
-- Create this in Supabase Dashboard → Storage
-- Or run via Supabase CLI:
-- ================================================
-- Note: Create a bucket named "resumes" and set it to PRIVATE.
-- Add this storage policy:
-- Allow authenticated users to upload/read their own files
-- Policy: storage.foldername(name)[1] = auth.uid()::text

-- ================================================
-- Helper function for RLS (Clerk user ID)
-- Since we use Clerk (not Supabase Auth), we pass user_id
-- from our server-side API using service role key.
-- RLS is enforced at API level, disable RLS if preferred:
-- ================================================
ALTER TABLE resumes DISABLE ROW LEVEL SECURITY;
ALTER TABLE jobs DISABLE ROW LEVEL SECURITY;
-- Note: We use service role key on the server, which bypasses RLS.
-- Security is enforced by filtering user_id in every query.
