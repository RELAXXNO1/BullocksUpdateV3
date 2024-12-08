import { WATERMARK_LOGO_PATH } from '../config/constants';

export async function addWatermark(imageFile: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const watermark = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Canvas context not available'));
      return;
    }

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      watermark.onload = () => {
        // Calculate watermark size (20% of the smallest image dimension)
        const size = Math.min(img.width, img.height) * 0.2;
        const padding = 20;
        
        // Position watermark in bottom right corner
        ctx.globalAlpha = 0.5;
        ctx.drawImage(
          watermark,
          canvas.width - size - padding,
          canvas.height - size - padding,
          size,
          size
        );

        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to create blob'));
          }
        }, 'image/jpeg', 0.9);
      };

      watermark.src = WATERMARK_LOGO_PATH;
    };

    img.src = URL.createObjectURL(imageFile);
  });
}