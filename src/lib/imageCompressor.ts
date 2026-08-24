/**
 * Image processing and compression utility to ensure uploaded user photos
 * are lightweight, high-performance, and fit comfortably within browser storage quotas.
 */

export interface ProcessImageOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  cropToSquare?: boolean;
}

export async function processImageFile(
  file: File,
  options: ProcessImageOptions = {}
): Promise<string> {
  const {
    maxWidth = 400,
    maxHeight = 400,
    quality = 0.88,
    cropToSquare = true,
  } = options;

  return new Promise((resolve, reject) => {
    // Check MIME type or extension
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/bmp', 'image/svg+xml'];
    const isImageExt = /\.(png|jpe?g|webp|gif|bmp|svg)$/i.test(file.name);
    
    if (!validTypes.includes(file.type) && !isImageExt && !file.type.startsWith('image/')) {
      reject(new Error('Please upload an image file (PNG, JPG, JPEG, WEBP).'));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.onload = (readerEvent) => {
      const src = readerEvent.target?.result as string;
      if (!src) {
        reject(new Error('Empty image data.'));
        return;
      }

      // If already a tiny SVG or string, return as is
      if (file.type === 'image/svg+xml' && file.size < 100000) {
        resolve(src);
        return;
      }

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onerror = () => reject(new Error('Unable to decode image. Please try another image format.'));
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          let targetWidth = img.width;
          let targetHeight = img.height;

          if (cropToSquare) {
            // Square crop centered
            const minDim = Math.min(img.width, img.height);
            const cropX = (img.width - minDim) / 2;
            const cropY = (img.height - minDim) / 2;

            const finalSize = Math.min(minDim, maxWidth);
            canvas.width = finalSize;
            canvas.height = finalSize;

            const ctx = canvas.getContext('2d');
            if (!ctx) {
              resolve(src);
              return;
            }

            // High-quality downsampling
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';

            ctx.drawImage(
              img,
              cropX,
              cropY,
              minDim,
              minDim,
              0,
              0,
              finalSize,
              finalSize
            );
          } else {
            // Aspect ratio preserving fit
            if (targetWidth > maxWidth || targetHeight > maxHeight) {
              const ratio = Math.min(maxWidth / targetWidth, maxHeight / targetHeight);
              targetWidth = Math.round(targetWidth * ratio);
              targetHeight = Math.round(targetHeight * ratio);
            }

            canvas.width = targetWidth;
            canvas.height = targetHeight;

            const ctx = canvas.getContext('2d');
            if (!ctx) {
              resolve(src);
              return;
            }

            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
          }

          // Convert to JPEG data URL with compression
          const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(compressedDataUrl);
        } catch (err) {
          // If canvas fails (e.g. taint), fallback to raw FileReader result
          console.warn('Canvas compression error, using direct image data:', err);
          resolve(src);
        }
      };

      img.src = src;
    };

    reader.readAsDataURL(file);
  });
}
