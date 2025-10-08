/**
 * Storage Service - Handle file uploads to Supabase Storage
 */

import { supabase } from '@/integrations/supabase/client';

export interface UploadResult {
  url: string;
  path: string;
  fileName: string;
}

export const storageService = {
  /**
   * Upload a file to Supabase Storage
   */
  uploadFile: async (
    bucket: string,
    file: File,
    path?: string
  ): Promise<UploadResult> => {
    const fileName = `${Date.now()}-${file.name}`;
    const filePath = path ? `${path}/${fileName}` : fileName;

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;

    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return {
      url: urlData.publicUrl,
      path: data.path,
      fileName: file.name
    };
  },

  /**
   * Upload multiple files
   */
  uploadFiles: async (
    bucket: string,
    files: File[],
    path?: string
  ): Promise<UploadResult[]> => {
    const uploadPromises = files.map(file =>
      storageService.uploadFile(bucket, file, path)
    );
    return Promise.all(uploadPromises);
  },

  /**
   * Delete a file from storage
   */
  deleteFile: async (bucket: string, path: string): Promise<void> => {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);

    if (error) throw error;
  },

  /**
   * Get public URL for a file
   */
  getPublicUrl: (bucket: string, path: string): string => {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);
    
    return data.publicUrl;
  }
};
