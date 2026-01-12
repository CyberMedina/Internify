import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Application } from '../types/vacancy';
import { getMyApplications } from '../services/vacancyService';
import { useAuth } from './AuthContext';

interface ApplicationsContextType {
  applications: Application[];
  appliedIds: Set<number>;
  isLoading: boolean;
  isRefreshing: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  refreshApplications: () => Promise<void>;
  loadMoreApplications: () => Promise<void>;
  hasApplied: (id: string | number) => boolean;
}

const ApplicationsContext = createContext<ApplicationsContextType | undefined>(undefined);

export const ApplicationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { userToken } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  // Derived state for O(1) lookups
  const appliedIds = React.useMemo(() => {
    return new Set(applications.map(app => app.vacancy_id));
  }, [applications]);

  const fetchApplications = useCallback(async (pageToFetch: number, isRefresh: boolean = false) => {
    if (!userToken) return;

    try {
      const response = await getMyApplications(userToken, pageToFetch);
      // Handle both structured pagination and potential array response fallback
      // The actual API response has paginator fields at root level based on user input
      const resAny = response as any;
      const newData = Array.isArray(response) ? response : (response.data || []);
      
      // Determine hasMore based on various pagination styles
      let hasMoreData = false;
      if (resAny.last_page && resAny.current_page) {
          // Flat style: { data: [...], current_page: 1, last_page: 5 }
          hasMoreData = resAny.current_page < resAny.last_page;
      } else if (resAny.meta && resAny.meta.last_page && resAny.meta.current_page) {
          // Meta style: { data: [...], meta: { current_page: 1 ... } }
          hasMoreData = resAny.meta.current_page < resAny.meta.last_page;
      } else {
          // Fallback if no meta info but we got data, assume there might be more if full page
          // Assuming default page size of 10 or 15
          hasMoreData = newData.length >= 10; 
      }

      if (isRefresh) {
        setApplications(newData);
      } else {
        setApplications(prev => {
          // Filter duplicates just in case
          const existingIds = new Set(prev.map(p => p.id));
          const uniqueNewData = newData.filter(item => !existingIds.has(item.id));
          return [...prev, ...uniqueNewData];
        });
      }

      setHasMore(hasMoreData);
    } catch (error) {
      console.error("Failed to fetch applications:", error);
    }
  }, [userToken]);

  const refreshApplications = useCallback(async () => {
    if (!userToken) {
       setApplications([]);
       return;
    }
    setIsRefreshing(true);
    // Reset page to 1
    setPage(1);
    await fetchApplications(1, true);
    setIsRefreshing(false);
  }, [userToken, fetchApplications]);

  const loadMoreApplications = useCallback(async () => {
    if (!hasMore || isLoadingMore || isRefreshing) return;
    
    setIsLoadingMore(true);
    const nextPage = page + 1;
    await fetchApplications(nextPage, false);
    setPage(nextPage);
    setIsLoadingMore(false);
  }, [hasMore, isLoadingMore, isRefreshing, page, fetchApplications]);

  // Initial load
  useEffect(() => {
     if (userToken) {
         fetchApplications(1, true).finally(() => setIsLoading(false));
     } else {
         setIsLoading(false);
     }
  }, [userToken]); // Only dependent on userToken change

  const hasApplied = useCallback((id: string | number) => {
     const numId = typeof id === 'string' ? parseInt(id, 10) : id;
     return appliedIds.has(numId);
  }, [appliedIds]);

  return (
    <ApplicationsContext.Provider value={{ 
        applications, 
        appliedIds, 
        isLoading, 
        isRefreshing, 
        isLoadingMore, 
        hasMore,
        refreshApplications, 
        loadMoreApplications, 
        hasApplied 
    }}>
      {children}
    </ApplicationsContext.Provider>
  );
};

export const useApplications = () => {
  const context = useContext(ApplicationsContext);
  if (!context) {
    throw new Error('useApplications must be used within an ApplicationsProvider');
  }
  return context;
};
