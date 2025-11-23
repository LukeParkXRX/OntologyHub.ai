-- OntologyHub.AI Database Schema
-- Run this in Supabase SQL Editor

-- Create graphs table
CREATE TABLE IF NOT EXISTS graphs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  graph_data JSONB NOT NULL,
  is_public BOOLEAN DEFAULT FALSE,
  share_token TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_graphs_user_id ON graphs(user_id);
CREATE INDEX IF NOT EXISTS idx_graphs_share_token ON graphs(share_token) WHERE share_token IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_graphs_created_at ON graphs(created_at DESC);

-- Enable Row Level Security
ALTER TABLE graphs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own graphs" ON graphs;
DROP POLICY IF EXISTS "Users can insert own graphs" ON graphs;
DROP POLICY IF EXISTS "Users can update own graphs" ON graphs;
DROP POLICY IF EXISTS "Users can delete own graphs" ON graphs;
DROP POLICY IF EXISTS "Anyone can view public graphs" ON graphs;

-- Policy: Users can view their own graphs
CREATE POLICY "Users can view own graphs"
  ON graphs FOR SELECT
  USING (auth.uid()::text = user_id);

-- Policy: Users can insert their own graphs
CREATE POLICY "Users can insert own graphs"
  ON graphs FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

-- Policy: Users can update their own graphs
CREATE POLICY "Users can update own graphs"
  ON graphs FOR UPDATE
  USING (auth.uid()::text = user_id);

-- Policy: Users can delete their own graphs
CREATE POLICY "Users can delete own graphs"
  ON graphs FOR DELETE
  USING (auth.uid()::text = user_id);

-- Policy: Anyone can view public graphs with share token
CREATE POLICY "Anyone can view public graphs"
  ON graphs FOR SELECT
  USING (is_public = TRUE AND share_token IS NOT NULL);

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Database schema created successfully!';
END $$;
