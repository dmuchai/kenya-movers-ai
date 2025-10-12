-- ============================================================================
-- Setup Storage Bucket for Quote Photos
-- ============================================================================
-- Purpose: Create storage bucket for bulky item photos uploaded with quotes
-- Author: MoveLink Technologies Ltd
-- Date: October 12, 2025
-- 
-- IMPORTANT: Storage policies must be created via Supabase Dashboard
-- Go to Storage > Policies to add:
-- 1. Public read access
-- 2. Authenticated upload
-- 3. Authenticated delete (own files only)
-- 4. Anonymous upload (for guest quotes)
-- ============================================================================

-- Create storage bucket for quote photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'quote-photos',
  'quote-photos',
  true, -- Public bucket for easy access
  5242880, -- 5MB file size limit per photo
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic']
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- Storage Policies (Create these in Supabase Dashboard)
-- ============================================================================
--
-- Policy 1: "Public can view quote photos"
-- Operation: SELECT
-- Target roles: public
-- Policy definition:
-- bucket_id = 'quote-photos'
--
-- Policy 2: "Authenticated users can upload quote photos"
-- Operation: INSERT
-- Target roles: authenticated
-- Policy definition:
-- bucket_id = 'quote-photos'
--
-- Policy 3: "Anonymous users can upload quote photos"
-- Operation: INSERT
-- Target roles: anon
-- Policy definition:
-- bucket_id = 'quote-photos'
--
-- Policy 4: "Users can delete their own quote photos"
-- Operation: DELETE
-- Target roles: authenticated
-- Policy definition:
-- bucket_id = 'quote-photos' AND (auth.uid())::text = (storage.foldername(name))[1]
--
-- Policy 5: "Anonymous users can delete quote photos"
-- Operation: DELETE
-- Target roles: anon
-- Policy definition:
-- bucket_id = 'quote-photos'
--
-- ============================================================================
-- Folder Structure:
-- quote-photos/{user_id}/{quote_id}/{timestamp}_{filename}
-- Example: quote-photos/abc123/quote456/1697123456789_sofa.jpg
-- ============================================================================
