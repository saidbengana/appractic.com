import sharp from 'sharp';
import { join } from 'path';
import { writeFile } from 'fs/promises';

interface MediaConversion {
  width: number;
  height: number;
  quality: number;
  format: 'jpeg' | 'png' | 'webp';
}

interface ConversionResult {
  path: string;
  size: number;
}

const UPLOAD_DIR = join(process.cwd(), 'public', 'uploads');

export class MediaService {
  private static conversions: { [key: string]: MediaConversion } = {
    thumbnail: {
      width: 150,
      height: 150,
      quality: 80,
      format: 'webp',
    },
    medium: {
      width: 600,
      height: 600,
      quality: 85,
      format: 'webp',
    },
    large: {
      width: 1200,
      height: 1200,
      quality: 90,
      format: 'webp',
    },
  };

  static async processImage(
    buffer: Buffer,
    filename: string,
    mimeType: string
  ): Promise<{ path: string; conversions: { [key: string]: ConversionResult } }> {
    const image = sharp(buffer);
    const conversions: { [key: string]: ConversionResult } = {};

    // Save original file
    const originalPath = join('uploads', filename);
    await writeFile(join(UPLOAD_DIR, filename), buffer);

    // Process conversions
    for (const [name, conversion] of Object.entries(this.conversions)) {
      const { width, height, quality, format } = conversion;
      const conversionFilename = `${filename.split('.')[0]}-${name}.${format}`;
      const conversionPath = join('uploads', conversionFilename);

      const processedBuffer = await image
        .resize(width, height, { fit: 'inside', withoutEnlargement: true })
        [format]({ quality })
        .toBuffer();

      await writeFile(join(UPLOAD_DIR, conversionFilename), processedBuffer);

      conversions[name] = {
        path: conversionPath,
        size: processedBuffer.length,
      };
    }

    return {
      path: originalPath,
      conversions,
    };
  }

  static async processVideo(
    buffer: Buffer,
    filename: string,
    mimeType: string
  ): Promise<{ path: string; conversions: { [key: string]: ConversionResult } }> {
    // For now, just save the original video
    // Video processing can be added later using ffmpeg or a cloud service
    const path = join('uploads', filename);
    await writeFile(join(UPLOAD_DIR, filename), buffer);

    return {
      path,
      conversions: {},
    };
  }

  static async processMedia(
    buffer: Buffer,
    filename: string,
    mimeType: string
  ) {
    if (mimeType.startsWith('image/')) {
      return this.processImage(buffer, filename, mimeType);
    } else if (mimeType.startsWith('video/')) {
      return this.processVideo(buffer, filename, mimeType);
    } else {
      throw new Error('Unsupported media type');
    }
  }
}
