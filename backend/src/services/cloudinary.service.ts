import { v2 as cloudinary } from 'cloudinary';
import { AttachmentCategory } from '../models/attachment.model';

// Configure Cloudinary if credentials present
if (
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

export const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100 MB

export const DANGEROUS_EXTENSIONS = [
  '.exe',
  '.sh',
  '.bat',
  '.cmd',
  '.dll',
  '.msi',
  '.vbs',
  '.scr',
  '.php',
  '.js',
  '.py',
  '.cgi',
  '.jar',
  '.com',
];

export const ALLOWED_MIME_TYPES = [
  // Images
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'image/gif',
  'image/svg+xml',
  // Documents
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
  'text/csv',
  'text/markdown',
  // Archives
  'application/zip',
  'application/x-zip-compressed',
  'application/x-rar-compressed',
  'application/vnd.rar',
  'application/x-7z-compressed',
  'application/x-tar',
  'application/gzip',
  // Videos
  'video/mp4',
  'video/quicktime',
  'video/x-msvideo',
  'video/webm',
  'video/mkv',
  // Audio
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/ogg',
  'audio/aac',
  'audio/m4a',
];

/**
 * Determine category from mimeType and file extension
 */
export function categorizeFile(mimeType: string, originalName: string): AttachmentCategory {
  const ext = originalName.substring(originalName.lastIndexOf('.')).toLowerCase();

  if (mimeType.startsWith('image/') || ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg'].includes(ext)) {
    return 'image';
  }
  if (mimeType.startsWith('video/') || ['.mp4', '.mov', '.avi', '.webm', '.mkv'].includes(ext)) {
    return 'video';
  }
  if (mimeType.startsWith('audio/') || ['.mp3', '.wav', '.ogg', '.aac', '.m4a'].includes(ext)) {
    return 'audio';
  }
  if (
    mimeType.includes('zip') ||
    mimeType.includes('rar') ||
    mimeType.includes('tar') ||
    ['.zip', '.rar', '.7z', '.tar', '.gz'].includes(ext)
  ) {
    return 'archive';
  }
  if (
    mimeType.includes('pdf') ||
    mimeType.includes('word') ||
    mimeType.includes('excel') ||
    mimeType.includes('powerpoint') ||
    mimeType.includes('text') ||
    ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt', '.csv', '.md'].includes(ext)
  ) {
    return 'document';
  }

  return 'other';
}

/**
 * Validate uploaded file before Cloudinary upload
 */
export function validateFile(file: Express.Multer.File): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: 'No file provided.' };
  }

  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: 'File size exceeds maximum allowed limit of 100 MB.' };
  }

  const ext = file.originalname.substring(file.originalname.lastIndexOf('.')).toLowerCase();
  if (DANGEROUS_EXTENSIONS.includes(ext)) {
    return { valid: false, error: `Executable or script file type "${ext}" is not allowed for security reasons.` };
  }

  return { valid: true };
}

export interface CloudinaryUploadResult {
  fileUrl: string;
  publicId: string;
}

export class CloudinaryService {
  /**
   * Upload buffer to Cloudinary or fallback storage
   */
  public static async uploadBuffer(
    buffer: Buffer,
    folderPath: string,
    originalName: string,
    mimeType: string
  ): Promise<CloudinaryUploadResult> {
    const hasCloudinary =
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET;

    if (hasCloudinary) {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: folderPath,
            resource_type: 'auto',
            use_filename: true,
            unique_filename: true,
          },
          (error, result) => {
            if (error || !result) {
              return reject(new Error(error?.message || 'Cloudinary upload failed'));
            }
            resolve({
              fileUrl: result.secure_url,
              publicId: result.public_id,
            });
          }
        );

        uploadStream.end(buffer);
      });
    }

    // Fallback when Cloudinary keys are not provided: Create base64 Data URL or mock storage URL
    const uniqueId = `file_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const base64Data = buffer.toString('base64');
    const fileUrl = `data:${mimeType};base64,${base64Data}`;

    return {
      fileUrl,
      publicId: `${folderPath}/${uniqueId}`,
    };
  }

  /**
   * Delete asset from Cloudinary
   */
  public static async deleteAsset(publicId: string): Promise<boolean> {
    if (!publicId) return false;

    const hasCloudinary =
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET;

    if (hasCloudinary) {
      try {
        await cloudinary.uploader.destroy(publicId);
        return true;
      } catch (err) {
        console.error('Failed to delete asset from Cloudinary:', err);
        return false;
      }
    }

    return true;
  }
}
