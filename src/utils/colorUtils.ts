import { getColors } from 'react-native-image-colors';
import { Platform } from 'react-native';

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
