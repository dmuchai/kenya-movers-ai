import { supabase } from "@/integrations/supabase/client";

/**
 * Upload a photo to Supabase Storage
 * @param file - File object to upload
 * @param userId - User ID (or 'guest' for anonymous users)
 * @param quoteId - Quote ID (or 'temp' for pre-submission)
 * @returns Promise with public URL of uploaded file
 */
export async function uploadQuotePhoto(
  file: File,
  userId: string = 'guest',
  quoteId: string = 'temp'
): Promise<string> {
  try {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error(`Invalid file type: ${file.type}. Only JPEG, PNG, WebP, and HEIC images are allowed.`);
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new Error(`File too large: ${(file.size / 1024 / 1024).toFixed(2)}MB. Maximum size is 5MB.`);
    }

    // Generate unique filename
    const timestamp = Date.now();
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filePath = `${userId}/${quoteId}/${timestamp}_${sanitizedFileName}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('quote-photos')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Upload error:', error);
      throw new Error(`Upload failed: ${error.message}`);
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('quote-photos')
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    console.error('Error uploading photo:', error);
    throw error;
  }
}

/**
 * Delete a photo from Supabase Storage
 * @param photoUrl - Full URL of the photo to delete
 * @returns Promise<boolean> - True if deleted successfully
 */
export async function deleteQuotePhoto(photoUrl: string): Promise<boolean> {
  try {
    // Extract file path from URL
    const url = new URL(photoUrl);
    const pathParts = url.pathname.split('/');
    
    // Find the index of 'quote-photos' in the path
    const bucketIndex = pathParts.indexOf('quote-photos');
    if (bucketIndex === -1) {
      throw new Error('Invalid photo URL: bucket not found');
    }
    
    // Get the file path after the bucket name
    const filePath = pathParts.slice(bucketIndex + 1).join('/');

    // Delete from Supabase Storage
    const { error } = await supabase.storage
      .from('quote-photos')
      .remove([filePath]);

    if (error) {
      console.error('Delete error:', error);
      throw new Error(`Delete failed: ${error.message}`);
    }

    return true;
  } catch (error) {
    console.error('Error deleting photo:', error);
    return false;
  }
}

/**
 * Upload multiple photos with progress tracking
 * @param files - Array of File objects
 * @param userId - User ID
 * @param quoteId - Quote ID
 * @param onProgress - Callback for upload progress
 * @returns Promise with array of public URLs
 */
export async function uploadMultiplePhotos(
  files: File[],
  userId: string = 'guest',
  quoteId: string = 'temp',
  onProgress?: (uploadedCount: number, total: number) => void
): Promise<string[]> {
  const uploadedUrls: string[] = [];
  
  for (let i = 0; i < files.length; i++) {
    try {
      const url = await uploadQuotePhoto(files[i], userId, quoteId);
      uploadedUrls.push(url);
      
      if (onProgress) {
        onProgress(i + 1, files.length);
      }
    } catch (error) {
      console.error(`Failed to upload file ${files[i].name}:`, error);
      // Continue with other files even if one fails
    }
  }
  
  return uploadedUrls;
}

/**
 * Compress image before upload (optional - for mobile optimization)
 * @param file - File to compress
 * @param maxWidth - Maximum width in pixels
 * @param quality - JPEG quality (0-1)
 * @returns Promise with compressed File
 */
export async function compressImage(
  file: File,
  maxWidth: number = 1920,
  quality: number = 0.8
): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // Calculate new dimensions
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }
        
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to compress image'));
              return;
            }
            
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now()
            });
            
            resolve(compressedFile);
          },
          'image/jpeg',
          quality
        );
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}
