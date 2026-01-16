import { config } from '../config';
import { Api } from 'grammy';

/**
 * Valid CV file extensions
 */
const VALID_CV_EXTENSIONS = ['.pdf', '.doc', '.docx'];
const MAX_CV_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

/**
 * Validates if a file is a valid CV format
 * @param filename - The filename to validate
 * @param fileSize - The file size in bytes
 * @returns Object with isValid flag and error message if invalid
 */
export function validateCVFile(
  filename: string,
  fileSize: number
): { isValid: boolean; error?: string } {
  // Check file extension
  const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'));
  if (!VALID_CV_EXTENSIONS.includes(ext)) {
    return {
      isValid: false,
      error: `Invalid file type. Supported formats: ${VALID_CV_EXTENSIONS.join(', ').toUpperCase()}`,
    };
  }

  // Check file size
  if (fileSize > MAX_CV_SIZE_BYTES) {
    const maxSizeMB = MAX_CV_SIZE_BYTES / (1024 * 1024);
    return {
      isValid: false,
      error: `File size exceeds maximum of ${maxSizeMB}MB`,
    };
  }

  return { isValid: true };
}

/**
 * Downloads a file from Telegram and returns it as a Buffer
 * @param api - Grammy API instance
 * @param fileId - Telegram file ID
 * @returns Buffer containing the file data
 * @throws Error if download fails
 */
export async function downloadTelegramFile(
  api: Api,
  fileId: string
): Promise<Buffer> {
  try {
    // Get file info from Telegram
    const file = await api.getFile(fileId);
    
    if (!file.file_path) {
      throw new Error('File path not available from Telegram');
    }

    // Download file from Telegram
    const fileUrl = `https://api.telegram.org/file/bot${config.BOT_TOKEN}/${file.file_path}`;
    const response = await fetch(fileUrl);

    if (!response.ok) {
      throw new Error(`Failed to download file: ${response.statusText}`);
    }

    // Convert response to Buffer
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to download file from Telegram: ${error.message}`);
    }
    throw new Error('Unknown error while downloading file from Telegram');
  }
}


