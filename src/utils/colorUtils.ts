import { Platform } from 'react-native';

let getColors: any = null;
if (Platform.OS !== 'web') {
  try {
    getColors = require('react-native-image-colors').getColors;
  } catch (e) {
    console.log('Error loading react-native-image-colors', e);
  }
}

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

export function getSaturation(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;
  const max = Math.max(rgb.r, rgb.g, rgb.b);
  const min = Math.min(rgb.r, rgb.g, rgb.b);
  return max === 0 ? 0 : (max - min) / max;
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
  if (!imageUrl || !getColors) return fallback;
  
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
        // En iOS, la API extrae paletas de contraste (a menudo oscuras). 
        // Vamos a evaluar la "vibrancia" de cada color disponible y elegir el más llamativo.
        // @ts-ignore
        const candidates = [result.detail, result.primary, result.secondary, result.background];
        let bestColor = null;
        let maxVibrancy = -1;

        for (const color of candidates) {
            if (!color) continue;
            
            // Calculamos Saturación y Brillo (Value en HSV)
            // @ts-ignore (porque usamos hexToRgb interna, que puede fallar con strings raros)
            const rgb = hexToRgb(color);
            if (!rgb) continue;

            const max = Math.max(rgb.r, rgb.g, rgb.b);
            const min = Math.min(rgb.r, rgb.g, rgb.b);
            const saturation = max === 0 ? 0 : (max - min) / max;
            const value = max / 255;
            
            // Multiplicamos para obtener un score de "Vibrancia": colores puros y brillantes ganan
            const vibrancy = saturation * value;

            if (vibrancy > maxVibrancy) {
                maxVibrancy = vibrancy;
                bestColor = color;
            }
        }

        // Si encontramos un color medianamente vibrante, lo usamos
        if (bestColor && maxVibrancy > 0.15) {
            return bestColor;
        }

        // De lo contrario, iOS no sacó ningún color vivo. Retornamos primary, background o fallback.
        // @ts-ignore
        return result.primary || result.background || fallback;
    }
  } catch (e) {
    console.log('Error extracting colors', e);
    return fallback;
  }
};
