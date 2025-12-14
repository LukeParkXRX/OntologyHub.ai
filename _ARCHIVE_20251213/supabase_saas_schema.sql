-- OntologyHub.AI SaaS Multi-Domain Schema
-- Run this in Supabase SQL Editor after running supabase_schema.sql

-- ============================================================================
-- DOMAINS TABLE
-- ============================================================================
-- Stores user-created domains for organizing knowledge graphs
CREATE TABLE IF NOT EXISTS domains (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT, -- e.g., "Healthcare", "Finance", "Education"
  settings JSONB DEFAULT '{}'::jsonb, -- Domain-specific settings
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_domains_user_id ON domains(user_id);
CREATE INDEX IF NOT EXISTS idx_domains_category ON domains(category);
CREATE INDEX IF NOT EXISTS idx_domains_created_at ON domains(created_at DESC);

-- ============================================================================
-- DOMAIN_DATA TABLE
-- ============================================================================
-- Stores collected data entries for each domain
CREATE TABLE IF NOT EXISTS domain_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  domain_id UUID NOT NULL REFERENCES domains(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL, -- Original text input
  metadata JSONB DEFAULT '{}'::jsonb, -- Additional metadata
  graph_data JSONB, -- Generated knowledge graph (Cytoscape format)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_domain_data_domain_id ON domain_data(domain_id);
CREATE INDEX IF NOT EXISTS idx_domain_data_user_id ON domain_data(user_id);
CREATE INDEX IF NOT EXISTS idx_domain_data_created_at ON domain_data(created_at DESC);

-- ============================================================================
-- SUBSCRIPTIONS TABLE
-- ============================================================================
-- Tracks user subscription plans and features
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  plan_type TEXT NOT NULL DEFAULT 'free', -- 'free', 'pro', 'enterprise'
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'cancelled', 'expired'
  features JSONB DEFAULT '{
    "max_domains": 3,
    "max_data_per_domain": 50,
    "export_formats": ["json"],
    "max_export_size_mb": 10
  }'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);

-- ============================================================================
-- EXPORT_HISTORY TABLE
-- ============================================================================
-- Tracks data export operations for analytics and rate limiting
CREATE TABLE IF NOT EXISTS export_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  domain_id UUID REFERENCES domains(id) ON DELETE SET NULL,
  format TEXT NOT NULL, -- 'json', 'csv', 'graphml'
  file_size_bytes INTEGER,
  status TEXT NOT NULL DEFAULT 'success', -- 'success', 'failed'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_export_history_user_id ON export_history(user_id);
CREATE INDEX IF NOT EXISTS idx_export_history_domain_id ON export_history(domain_id);
CREATE INDEX IF NOT EXISTS idx_export_history_created_at ON export_history(created_at DESC);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE domain_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE export_history ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- DOMAINS TABLE POLICIES
-- ============================================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own domains" ON domains;
DROP POLICY IF EXISTS "Users can insert own domains" ON domains;
DROP POLICY IF EXISTS "Users can update own domains" ON domains;
DROP POLICY IF EXISTS "Users can delete own domains" ON domains;

-- Users can view their own domains
CREATE POLICY "Users can view own domains"
  ON domains FOR SELECT
  USING (auth.uid()::text = user_id);

-- Users can insert their own domains
CREATE POLICY "Users can insert own domains"
  ON domains FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

-- Users can update their own domains
CREATE POLICY "Users can update own domains"
  ON domains FOR UPDATE
  USING (auth.uid()::text = user_id);

-- Users can delete their own domains
CREATE POLICY "Users can delete own domains"
  ON domains FOR DELETE
  USING (auth.uid()::text = user_id);

-- ============================================================================
-- DOMAIN_DATA TABLE POLICIES
-- ============================================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own domain data" ON domain_data;
DROP POLICY IF EXISTS "Users can insert own domain data" ON domain_data;
DROP POLICY IF EXISTS "Users can update own domain data" ON domain_data;
DROP POLICY IF EXISTS "Users can delete own domain data" ON domain_data;

-- Users can view their own domain data
CREATE POLICY "Users can view own domain data"
  ON domain_data FOR SELECT
  USING (auth.uid()::text = user_id);

-- Users can insert their own domain data
CREATE POLICY "Users can insert own domain data"
  ON domain_data FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

-- Users can update their own domain data
CREATE POLICY "Users can update own domain data"
  ON domain_data FOR UPDATE
  USING (auth.uid()::text = user_id);

-- Users can delete their own domain data
CREATE POLICY "Users can delete own domain data"
  ON domain_data FOR DELETE
  USING (auth.uid()::text = user_id);

-- ============================================================================
-- SUBSCRIPTIONS TABLE POLICIES
-- ============================================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own subscription" ON subscriptions;
DROP POLICY IF EXISTS "Users can insert own subscription" ON subscriptions;
DROP POLICY IF EXISTS "Users can update own subscription" ON subscriptions;

-- Users can view their own subscription
CREATE POLICY "Users can view own subscription"
  ON subscriptions FOR SELECT
  USING (auth.uid()::text = user_id);

-- Users can insert their own subscription (for initial setup)
CREATE POLICY "Users can insert own subscription"
  ON subscriptions FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

-- Users can update their own subscription
CREATE POLICY "Users can update own subscription"
  ON subscriptions FOR UPDATE
  USING (auth.uid()::text = user_id);

-- ============================================================================
-- EXPORT_HISTORY TABLE POLICIES
-- ============================================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own export history" ON export_history;
DROP POLICY IF EXISTS "Users can insert own export history" ON export_history;

-- Users can view their own export history
CREATE POLICY "Users can view own export history"
  ON export_history FOR SELECT
  USING (auth.uid()::text = user_id);

-- Users can insert their own export history
CREATE POLICY "Users can insert own export history"
  ON export_history FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for domains table
DROP TRIGGER IF EXISTS update_domains_updated_at ON domains;
CREATE TRIGGER update_domains_updated_at
  BEFORE UPDATE ON domains
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for domain_data table
DROP TRIGGER IF EXISTS update_domain_data_updated_at ON domain_data;
CREATE TRIGGER update_domain_data_updated_at
  BEFORE UPDATE ON domain_data
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for subscriptions table
DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON subscriptions;
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- INITIAL DATA
-- ============================================================================

-- Function to create default subscription for new users
CREATE OR REPLACE FUNCTION create_default_subscription()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO subscriptions (user_id, plan_type, status)
  VALUES (NEW.id::text, 'free', 'active')
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Note: This trigger would be added to auth.users table if we have access
-- For now, we'll handle subscription creation in the application layer

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'SaaS Multi-Domain schema created successfully!';
  RAISE NOTICE 'Tables created: domains, domain_data, subscriptions, export_history';
  RAISE NOTICE 'RLS policies enabled for multi-tenant isolation';
END $$;
