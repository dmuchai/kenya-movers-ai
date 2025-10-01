-- Fix RLS policies for quotes and profiles tables to allow anonymous users
-- This migration addresses the "row-level security policy" errors for guest users

-- ===== PROFILES TABLE POLICIES =====

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow anonymous profile creation" ON profiles;
DROP POLICY IF EXISTS "Allow users to insert their own profiles" ON profiles;
DROP POLICY IF EXISTS "Allow users to view their own profiles" ON profiles;
DROP POLICY IF EXISTS "Allow users to update their own profiles" ON profiles;

-- Create policy to allow anonymous users to insert profiles (for guest quotes)
CREATE POLICY "Allow anonymous profile creation" ON profiles
    FOR INSERT 
    TO anon
    WITH CHECK (true);

-- Create policy to allow authenticated users to insert their own profiles
CREATE POLICY "Allow users to insert their own profiles" ON profiles
    FOR INSERT 
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to view their own profiles
CREATE POLICY "Allow users to view their own profiles" ON profiles
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Create policy to allow users to update their own profiles
CREATE POLICY "Allow users to update their own profiles" ON profiles
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- ===== QUOTES TABLE POLICIES =====

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow anonymous quote submissions" ON quotes;
DROP POLICY IF EXISTS "Allow authenticated users to insert quotes" ON quotes;
DROP POLICY IF EXISTS "Allow users to view their own quotes" ON quotes;
DROP POLICY IF EXISTS "Allow anonymous quote viewing" ON quotes;

-- Create policy to allow anonymous users to insert quotes
CREATE POLICY "Allow anonymous quote submissions" ON quotes
    FOR INSERT 
    TO anon
    WITH CHECK (true);

-- Create policy to allow authenticated users to insert their own quotes
CREATE POLICY "Allow authenticated users to insert quotes" ON quotes
    FOR INSERT 
    TO authenticated
    WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Create policy to allow users to select their own quotes
CREATE POLICY "Allow users to view their own quotes" ON quotes
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Allow anonymous users to select quotes (for immediate feedback after submission)
CREATE POLICY "Allow anonymous quote viewing" ON quotes
    FOR SELECT
    TO anon
    USING (true);