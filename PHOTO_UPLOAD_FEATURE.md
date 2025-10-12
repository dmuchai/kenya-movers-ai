# Photo Upload Feature for MoveLink

## Overview
This feature allows users to upload photos of bulky or special items when requesting quotes. Photos help moving companies provide more accurate estimates and reduce disputes.

## Components

### 1. Storage Bucket Setup
**File:** `supabase/migrations/20251012000001_setup_quote_photos_storage.sql`

- **Bucket Name:** `quote-photos`
- **Public Access:** Yes (for movers to view)
- **File Size Limit:** 5MB per photo
- **Allowed Types:** JPEG, PNG, WebP, HEIC

**Folder Structure:**
```
quote-photos/
  ├── {user_id}/
  │   └── {quote_id}/
  │       ├── 1697123456789_sofa.jpg
  │       └── 1697123456790_piano.jpg
  └── guest/
      └── temp/
          └── 1697123456791_wardrobe.jpg
```

### 2. Upload Utilities
**File:** `src/lib/photoUpload.ts`

#### Functions:

**`uploadQuotePhoto(file, userId, quoteId)`**
- Uploads a single photo to Supabase Storage
- Validates file type and size
- Returns public URL

**`deleteQuotePhoto(photoUrl)`**
- Deletes a photo from Supabase Storage
- Extracts file path from URL
- Returns success boolean

**`uploadMultiplePhotos(files, userId, quoteId, onProgress)`**
- Uploads multiple photos with progress tracking
- Continues even if individual uploads fail
- Returns array of successful upload URLs

**`compressImage(file, maxWidth, quality)`**
- Optional image compression (for mobile optimization)
- Reduces file size before upload
- Maintains aspect ratio

### 3. QuoteForm Integration
**File:** `src/components/QuoteForm.tsx`

**Features:**
- Drag-and-drop file upload
- Real-time upload progress indicator
- Thumbnail preview with delete button
- Photo count display
- Error handling with toast notifications

**State Management:**
```typescript
const [uploadingPhotos, setUploadingPhotos] = useState(false);
const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });
```

**Photo URLs stored in:**
```typescript
formData.inventory.bulkyItemPhotos: string[]
```

## Storage Policies

### Upload Policies:
1. **Authenticated Users:** Can upload to their own folder (`{user_id}/`)
2. **Anonymous Users:** Can upload to guest folder (`guest/`)

### Read Policies:
- **Public:** Anyone can view photos (for movers to see inventory)

### Delete Policies:
1. **Authenticated Users:** Can delete their own photos
2. **Anonymous Users:** Can delete guest photos

## Usage

### In QuoteForm (Step 3: Inventory):

```typescript
// User clicks "Choose Photos" button
handlePhotoUpload(files: FileList | null)
  ↓
  uploadMultiplePhotos() → Uploads to Supabase Storage
  ↓
  URLs added to formData.inventory.bulkyItemPhotos[]
  ↓
  Thumbnails displayed with delete buttons
```

### Delete Photo:

```typescript
// User clicks X button on thumbnail
handlePhotoDelete(photoUrl: string)
  ↓
  deleteQuotePhoto() → Removes from Supabase Storage
  ↓
  URL removed from formData.inventory.bulkyItemPhotos[]
  ↓
  Thumbnail removed from UI
```

### Quote Submission:

```typescript
// Photo URLs saved to database
quoteInsertData.inventory = {
  ...otherInventoryFields,
  bulkyItemPhotos: ["url1.jpg", "url2.jpg"]
}
```

## Validation

### File Type:
- ✅ JPEG (.jpg, .jpeg)
- ✅ PNG (.png)
- ✅ WebP (.webp)
- ✅ HEIC (.heic)
- ❌ Other formats rejected

### File Size:
- **Max:** 5MB per photo
- **Rejection:** Files > 5MB show error toast

### Error Handling:
- Network errors → Toast notification
- Invalid file type → Toast with allowed types
- File too large → Toast with size limit
- Storage errors → Console log + toast

## Benefits

### For Customers:
✅ Visual proof of items to move
✅ Reduces back-and-forth with movers
✅ More accurate quotes

### For Movers:
✅ Better understanding of job requirements
✅ Accurate vehicle and crew allocation
✅ Evidence for disputes

### For Platform:
✅ Improved quote accuracy
✅ Higher mover acceptance rate
✅ Reduced customer complaints

## Security

### Access Control:
- Users can only delete their own photos
- Public read access (necessary for movers)
- RLS policies enforce user boundaries

### File Validation:
- MIME type checking
- File size limits
- Sanitized filenames

### Storage:
- Supabase Storage (secure, scalable)
- CDN-backed (fast delivery)
- Automatic backups

## Performance

### Optimization:
- Lazy loading of thumbnails
- Optional image compression
- Progress indicators for UX
- Parallel uploads (up to 5 concurrent)

### Mobile Considerations:
- Camera capture supported
- HEIC format (iPhone) supported
- Compressed uploads optional
- Touch-friendly delete buttons

## Future Enhancements

1. **Image Compression:**
   - Auto-compress large images before upload
   - Reduce bandwidth usage on mobile

2. **AI Analysis:**
   - Auto-detect furniture types
   - Estimate weight/volume from photos
   - Suggest packing materials

3. **Video Support:**
   - Allow short videos of large items
   - 360° room scans

4. **Annotation:**
   - Draw on photos to highlight issues
   - Add notes to specific items

## Testing

### Manual Testing:
```bash
# 1. Start dev server
npm run dev

# 2. Navigate to quote form Step 3
# 3. Click "Choose Photos"
# 4. Select 2-3 photos
# 5. Verify upload progress
# 6. Check thumbnails display
# 7. Click X to delete one photo
# 8. Submit quote and verify URLs in database
```

### Database Verification:
```sql
-- Check uploaded photos in quotes table
SELECT id, inventory->>'bulkyItemPhotos' as photos
FROM quotes
WHERE inventory->>'bulkyItemPhotos' IS NOT NULL;

-- Check storage objects
SELECT name, created_at, metadata->>'size' as size_bytes
FROM storage.objects
WHERE bucket_id = 'quote-photos'
ORDER BY created_at DESC
LIMIT 10;
```

## Troubleshooting

### Photos not uploading:
1. Check storage bucket exists: `quote-photos`
2. Verify RLS policies are active
3. Check browser console for errors
4. Ensure file size < 5MB

### Thumbnails not showing:
1. Verify public URL is correct
2. Check CORS settings in Supabase
3. Ensure bucket is public
4. Check browser network tab

### Delete not working:
1. Verify RLS delete policy exists
2. Check user authentication
3. Ensure URL parsing is correct
4. Check storage.objects permissions

## Support

For issues or questions:
- **Email:** support@movelink.co.ke
- **GitHub:** github.com/dmuchai/kenya-movers-ai/issues
- **Docs:** See migration file comments
