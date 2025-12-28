import AsyncStorage from '@react-native-async-storage/async-storage';
import { Job } from '../components/JobCardLarge';

const RECENT_SEARCHES_KEY = 'recent_searches';
const RECENTLY_VIEWED_KEY = 'recently_viewed_jobs';

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
    const newJobs = [job, ...jobs.filter(j => j.id !== job.id)].slice(0, 10);
    await AsyncStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(newJobs));
    return newJobs;
  } catch (e) {
    return [];
  }
};
