const PENDING_DEEPLINK_KEY = 'pending_deeplink';

export const setPendingDeeplink = async (url: string | null) => {
  try {
    if (url) {
      await AsyncStorage.setItem(PENDING_DEEPLINK_KEY, url);
    } else {
      await AsyncStorage.removeItem(PENDING_DEEPLINK_KEY);
    }
  } catch (e) {
    // ignore
  }
};

export const getPendingDeeplink = async (): Promise<string | null> => {
  try {
    const url = await AsyncStorage.getItem(PENDING_DEEPLINK_KEY);
    return url || null;
  } catch (e) {
    return null;
  }
};
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Job } from '../components/JobCardLarge';

const RECENT_SEARCHES_KEY = 'recent_searches';
const RECENTLY_VIEWED_KEY = 'recently_viewed_jobs';
const BANNER_CLOSED_KEY = 'home_banner_closed_v1';

export const getBannerClosed = async (): Promise<boolean> => {
  try {
    const value = await AsyncStorage.getItem(BANNER_CLOSED_KEY);
    return value === 'true';
  } catch (e) {
    return false;
  }
};

export const setBannerClosed = async (closed: boolean) => {
  try {
    if (closed) {
      await AsyncStorage.setItem(BANNER_CLOSED_KEY, 'true');
    } else {
      await AsyncStorage.removeItem(BANNER_CLOSED_KEY);
    }
  } catch (e) {
    // ignore
  }
};

export const getRecentSearches = async (): Promise<string[]> => {
  try {
    const json = await AsyncStorage.getItem(RECENT_SEARCHES_KEY);
    return json ? JSON.parse(json) : [];
  } catch (e) {
    return [];
  }
};

export const addRecentSearch = async (query: string) => {
  try {
    const searches = await getRecentSearches();
    const newSearches = [query, ...searches.filter(s => s !== query)].slice(0, 4);
    await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(newSearches));
    return newSearches;
  } catch (e) {
    return [];
  }
};

export const removeRecentSearch = async (query: string) => {
  try {
    const searches = await getRecentSearches();
    const newSearches = searches.filter(s => s !== query);
    await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(newSearches));
    return newSearches;
  } catch (e) {
    return [];
  }
};

export const getRecentlyViewed = async (): Promise<Job[]> => {
  try {
    const json = await AsyncStorage.getItem(RECENTLY_VIEWED_KEY);
    return json ? JSON.parse(json) : [];
  } catch (e) {
    return [];
  }
};

export const addRecentlyViewed = async (job: Job) => {
  try {
    const jobs = await getRecentlyViewed();
    const newJobs = [job, ...jobs.filter(j => j.id !== job.id)].slice(0, 6);
    await AsyncStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(newJobs));
    return newJobs;
  } catch (e) {
    return [];
  }
};

export const clearRecentlyViewed = async () => {
  try {
    await AsyncStorage.removeItem(RECENTLY_VIEWED_KEY);
    return [];
  } catch (e) {
    return [];
  }
};

const NOTIFICATION_CONSENT_KEY = 'notification_consent_shown';

export const getNotificationConsent = async (): Promise<boolean> => {
  try {
    const value = await AsyncStorage.getItem(NOTIFICATION_CONSENT_KEY);
    return value === 'true';
  } catch (e) {
    return false;
  }
};

export const setNotificationConsent = async (shown: boolean) => {
  try {
    await AsyncStorage.setItem(NOTIFICATION_CONSENT_KEY, String(shown));
  } catch (e) {
    // ignore
  }
};

const NOTIFICATION_CONSENT_GRANTED_KEY = 'notification_consent_granted';

export const getNotificationConsentGranted = async (): Promise<boolean> => {
  try {
    const value = await AsyncStorage.getItem(NOTIFICATION_CONSENT_GRANTED_KEY);
    return value === 'true';
  } catch (e) {
    return false;
  }
};

export const setNotificationConsentGranted = async (granted: boolean) => {
  try {
    await AsyncStorage.setItem(NOTIFICATION_CONSENT_GRANTED_KEY, String(granted));
  } catch (e) {
    // ignore
  }
};



