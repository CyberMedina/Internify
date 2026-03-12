import { getColors } from 'react-native-image-colors';
import { Platform } from 'react-native';

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const shorthand = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthand, (_, r, g, b) => r + r + g + g + b + b);
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return null;
  return { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) };
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(x => {
    const h = Math.max(0, Math.min(255, Math.round(x))).toString(16);
    return h.length === 1 ? '0' + h : h;
  }).join('');
}

export function lightenColor(hex: string, amount: number = 0.3): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  return rgbToHex(
    rgb.r + (255 - rgb.r) * amount,
    rgb.g + (255 - rgb.g) * amount,
    rgb.b + (255 - rgb.b) * amount,
  );
}

export function getLuminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;
  const a = [rgb.r, rgb.g, rgb.b].map(v => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

/** Ajusta un color para que sea visible sobre fondos oscuros */
export function adjustColorForDarkMode(hex: string): string {
  const luminance = getLuminance(hex);
  if (luminance < 0.1) return lightenColor(hex, 0.55);
  if (luminance < 0.2) return lightenColor(hex, 0.35);
  if (luminance < 0.3) return lightenColor(hex, 0.2);
  return hex;
}

export const extractDominantColor = async (imageUrl: string | undefined | null, fallback: string) => {
  if (!imageUrl || !imageUrl.startsWith('http')) return fallback;
  
  try {
    const result = await getColors(imageUrl, {
      fallback,
      cache: true,
      key: imageUrl,
    });
    
    if (Platform.OS === 'android') {
        // @ts-ignore
        return result.dominant || result.vibrant || fallback;
    } else {
        // @ts-ignore
        return result.primary || fallback;
    }
  } catch (e) {
    console.log('Error extracting colors', e);
    return fallback;
  }
};
