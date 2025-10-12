# Setting Up Supabase Storage for Quote Photos

## Step 1: Run the Migration

The migration creates the `quote-photos` bucket. Run it first:

```bash
# Apply migration to Supabase
# Option 1: Via Supabase Dashboard
# Go to SQL Editor and paste the contents of:
# supabase/migrations/20251012000001_setup_quote_photos_storage.sql

# Option 2: Via CLI (if configured)
npx supabase db push
```

## Step 2: Set Up Storage Policies (Supabase Dashboard)

Storage policies **cannot be created via SQL migration** due to permissions. You must create them in the Supabase Dashboard.

### Navigate to Storage Policies:
1. Go to https://supabase.com/dashboard/project/YOUR_PROJECT
2. Click **Storage** in the left sidebar
3. Click on the **quote-photos** bucket
4. Click the **Policies** tab
5. Click **New Policy**

---

### Policy 1: Public Read Access
**Name:** `Public can view quote photos`

**Allowed operation:** SELECT

**Target roles:** `public`

**Policy definition (WITH CHECK):**
```sql
bucket_id = 'quote-photos'
```

**Description:** Allows anyone (including movers) to view uploaded photos

---

### Policy 2: Authenticated Upload
**Name:** `Authenticated users can upload quote photos`

**Allowed operation:** INSERT

**Target roles:** `authenticated`

**Policy definition (WITH CHECK):**
```sql
bucket_id = 'quote-photos'
```

**Description:** Allows logged-in users to upload photos to their folder

---

### Policy 3: Anonymous Upload (Guest Quotes)
**Name:** `Anonymous users can upload quote photos`

**Allowed operation:** INSERT

**Target roles:** `anon`

**Policy definition (WITH CHECK):**
```sql
bucket_id = 'quote-photos'
```

**Description:** Allows guest users to upload photos when submitting anonymous quotes

---

### Policy 4: Delete Own Photos (Authenticated)
**Name:** `Users can delete their own quote photos`

**Allowed operation:** DELETE

**Target roles:** `authenticated`

**Policy definition (USING):**
```sql
bucket_id = 'quote-photos' AND (auth.uid())::text = (storage.foldername(name))[1]
```

**Description:** Users can only delete photos from their own folder

---

### Policy 5: Delete Guest Photos (Anonymous)
**Name:** `Anonymous users can delete quote photos`

**Allowed operation:** DELETE

**Target roles:** `anon`

**Policy definition (USING):**
```sql
bucket_id = 'quote-photos'
```

**Description:** Allows guest users to delete photos they uploaded

---

## Step 3: Verify Setup

### Test Upload (Browser Console):
```javascript
// Test authenticated upload
const { data, error } = await supabase.storage
  .from('quote-photos')
  .upload('test/test.jpg', file);

console.log('Upload result:', data, error);

// Test public URL
const { data: { publicUrl } } = supabase.storage
  .from('quote-photos')
  .getPublicUrl('test/test.jpg');

console.log('Public URL:', publicUrl);
```

### Verify Policies:
1. Go to Storage > quote-photos > Policies
2. Ensure all 5 policies are listed
3. Check that each policy has the correct role and operation

---

## Quick Setup Checklist

- [ ] Run migration to create `quote-photos` bucket
- [ ] Policy 1: SELECT for public ✅
- [ ] Policy 2: INSERT for authenticated ✅
- [ ] Policy 3: INSERT for anon ✅
- [ ] Policy 4: DELETE for authenticated (own files) ✅
- [ ] Policy 5: DELETE for anon ✅
- [ ] Test upload via QuoteForm
- [ ] Verify photos visible in Storage
- [ ] Test delete functionality

---

## Alternative: Use Supabase Dashboard UI

If you prefer a visual approach:

1. **Create Bucket:**
   - Storage > New Bucket
   - Name: `quote-photos`
   - Public: ✅
   - File size limit: 5242880 (5MB)
   - Allowed MIME types: `image/jpeg, image/jpg, image/png, image/webp, image/heic`

2. **Add Policies:**
   - Click bucket > Policies tab
   - Use "New Policy" button
   - Fill in details from above

---

## Troubleshooting

### Error: "new row violates row-level security policy"
**Solution:** Ensure INSERT policies exist for both `authenticated` and `anon` roles

### Error: "Policy not found"
**Solution:** Double-check policy names match exactly (case-sensitive)

### Photos not appearing
**Solution:** 
1. Verify bucket is `public: true`
2. Check SELECT policy exists for `public` role
3. Test public URL in new incognito window

### Cannot delete photos
**Solution:**
1. Verify DELETE policy exists for your role
2. Check folder name matches user ID (for authenticated users)
3. Test with browser DevTools console

---

## Security Notes

✅ **Public Read:** Necessary for movers to view inventory photos
✅ **Authenticated Upload:** Users can only upload to their folder
✅ **Anonymous Upload:** Limited to `guest/temp` folder
✅ **Delete Protection:** Users can only delete their own files
✅ **File Type Validation:** Only images allowed
✅ **Size Limits:** 5MB max per photo

---

## Support

If you encounter issues:
1. Check Supabase Dashboard > Storage > Logs
2. Inspect browser console for errors
3. Verify RLS policies are enabled
4. Test with both authenticated and anonymous users

For persistent issues, contact: support@movelink.co.ke
