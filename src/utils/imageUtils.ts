import Color from 'color';

export async function getDominantColor(imageUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = imageUrl;

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      const colorCounts: { [color: string]: number } = {};

      for (let i = 0; i < imageData.length; i += 4) {
        const r = imageData[i];
        const g = imageData[i + 1];
        const b = imageData[i + 2];
        const color = `rgb(${r},${g},${b})`;
        colorCounts[color] = (colorCounts[color] || 0) + 1;
      }

      let dominantColor = 'rgb(255,255,255)';
      let maxCount = 0;
      for (const color in colorCounts) {
        if (colorCounts[color] > maxCount) {
          maxCount = colorCounts[color];
          dominantColor = color;
        }
      }
      resolve(dominantColor);
    };

    img.onerror = (error) => {
      reject(error);
    };
  });
}

export function getContrastingColor(color: string): string {
  try {
    const rgbColor = Color(color);
    const luminance = rgbColor.luminosity();
    return luminance > 0.45 ? '#000' : '#fff';
  } catch (error) {
    console.error("Error calculating contrasting color:", error);
    return '#000';
  }
}
