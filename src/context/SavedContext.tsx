import React, { useEffect } from 'react';
import type { Job } from '../components/JobCardLarge';
import { useAuth } from './AuthContext';
import { getSavedVacancies, saveVacancy, deleteSavedVacancy } from '../services/vacancyService';
import { Vacancy } from '../types/vacancy';
import { useToast } from './ToastContext';

type SavedContextType = {
  saved: Record<string, Job>;
  isSaved: (id: string) => boolean;
  toggle: (job: Job) => Promise<void>;
  remove: (id: string) => Promise<void>;
  list: Job[];
  isLoading: boolean;
  loadingMore: boolean;
  refresh: () => Promise<void>;
  loadMore: () => Promise<void>;
  hasMore: boolean;
  isProcessing: (id: string) => boolean;
  mergeSaved: (jobs: Job[]) => void;
};

const SavedContext = React.createContext<SavedContextType | undefined>(undefined);

const vacancyToJob = (v: Vacancy): Job => {
  const companyName = typeof v.company === 'string' ? v.company : v.company?.name || 'Empresa Confidencial';
  
  // Use a sensible default or fetch from v.company.logo if available
  const companyLogo = (typeof v.company === 'object' && v.company?.logo) ? v.company.logo : undefined;
  
  let tags: string[] = [];

  if (v.tags && v.tags.length > 0) {
    tags = v.tags;
  } else {
    // 1. Modality
    if (typeof v.modality === 'string') {
      tags.push(v.modality);
    } else if (v.modality?.label) {
      tags.push(v.modality.label);
    } else {
      tags.push('Presencial');
    }

    // 2. Type (e.g. Pasantía, Empleo)
    if (v.type?.name) {
      tags.push(v.type.name);
    }

    // 3. Category
    if (v.category?.name) {
      tags.push(v.category.name);
    }
  }
  
  return {
    id: v.id.toString(),
    title: v.title,
    company: companyName,
    companyLogo: companyLogo,
    location: v.location,
    tags: tags.slice(0, 3),
    applicants: v.applicants_count || 0,
    salary: v.salary_range || 'No especificado',
    avatars: [],
    postedTime: v.dates?.posted_human,
    isApplied: v.is_applied
  };
};

export function SavedProvider({ children }: { children: React.ReactNode }) {
  const { userToken } = useAuth();
  const { showToast } = useToast();
  
  // savedMap for O(1) lookup
  const [saved, setSaved] = React.useState<Record<string, Job>>({});
  
  // list state for Ordered UI
  const [list, setList] = React.useState<Job[]>([]);
  
  const [isLoading, setIsLoading] = React.useState(false);
  const [loadingMore, setLoadingMore] = React.useState(false);
  const [page, setPage] = React.useState(1);
  const [hasMore, setHasMore] = React.useState(true);
  const [processingIds, setProcessingIds] = React.useState<Set<string>>(new Set());

  const fetchVacancies = React.useCallback(async (pageNum: number, isRefresh = false) => {
    if (!userToken) {
        setSaved({});
        setList([]);
        return;
    }

    try {
        if (pageNum === 1) setIsLoading(true);
        else setLoadingMore(true);

        const limit = 15;
        const response = await getSavedVacancies(userToken, pageNum, limit);
        
        const newItems: Job[] = [];
        const newMap: Record<string, Job> = {};

        if (response.data) {
            response.data.forEach((v) => {
                const job = vacancyToJob(v);
                newItems.push(job);
                newMap[job.id] = job;
            });
        }

        if (isRefresh || pageNum === 1) {
            setList(newItems);
            setSaved(newMap);
            setPage(1);
        } else {
            setList(prev => [...prev, ...newItems]);
            setSaved(prev => ({ ...prev, ...newMap }));
            setPage(pageNum);
        }

        // Check if we have more pages
        // The API returns current_page, last_page, total, etc.
        // If response.next_page_url is null or current_page >= last_page, we are done.
        const meta = response as any; 
        if (meta.current_page >= meta.last_page) {
            setHasMore(false);
        } else {
            setHasMore(true);
        }

    } catch (error) {
        console.error('Error loading saved vacancies:', error);
    } finally {
        setIsLoading(false);
        setLoadingMore(false);
    }
  }, [userToken]);

  // Initial load
  useEffect(() => {
     fetchVacancies(1);
  }, [fetchVacancies]);

  const refresh = React.useCallback(async () => {
      setHasMore(true); 
      await fetchVacancies(1, true);
  }, [fetchVacancies]);

  const loadMore = React.useCallback(async () => {
      if (!isLoading && !loadingMore && hasMore) {
          await fetchVacancies(page + 1);
      }
  }, [isLoading, loadingMore, hasMore, page, fetchVacancies]);


  const isSaved = React.useCallback((id: string) => Boolean(saved[id]), [saved]);
  const isProcessing = React.useCallback((id: string) => processingIds.has(id), [processingIds]);

  const toggle = React.useCallback(async (job: Job) => {
    if (!userToken) return;
    if (processingIds.has(job.id)) return;

    setProcessingIds(prev => new Set(prev).add(job.id));
    const isCurrentlySaved = !!saved[job.id];

    try {
        if (isCurrentlySaved) {
            await deleteSavedVacancy(userToken, parseInt(job.id));
        } else {
            await saveVacancy(userToken, parseInt(job.id));
        }
        
        // Update ONLY after success
        setSaved((prev) => {
             const next = { ...prev };
             if (isCurrentlySaved) delete next[job.id];
             else next[job.id] = job;
             return next; 
        });

        if (isCurrentlySaved) {
            setList((prev) => prev.filter(item => item.id !== job.id));
            showToast('La vacante se eliminó de tus guardados', 'info', 'Guardado removido', 3000, 'bookmark');
        } else {
             setList((prev) => [job, ...prev]);
             showToast('La vacante se ha guardado correctamente', 'success', 'Vacante guardada', 3000, 'bookmark');
        }

    } catch (error: any) {
        console.error('Error toggling saved vacancy:', error);
        
        let message = 'Error al guardar vacante';
        let title = 'Error';
        
        // Attempt to parse validation errors from API
        let errorData = error;
        try {
            if (error.message && typeof error.message === 'string' && error.message.trim().startsWith('{')) {
                errorData = JSON.parse(error.message);
            }
        } catch (e) {
            // Ignore parse errors, run with original error
        }

        // Handle specific limit reached error from API
        if (errorData.error_code === 'SAVED_VACANCIES_LIMIT_REACHED' || 
            (typeof errorData.message === 'string' && errorData.message.includes('SAVED_VACANCIES_LIMIT_REACHED'))) {
            
            title = errorData.title || '¡Llegaste al límite!';
            message = errorData.message || 'Solo puedes guardar hasta 20 vacantes. Gestiona tus guardados para añadir más.';
            showToast(message, 'error', title);
        } else {
             const errorMsg = errorData.message || error.message || '';
             // Fallback for other errors
             if (errorMsg.includes('400')) {
                message = 'No se pudo guardar la vacante';
             } else if (typeof errorData.message === 'string' && errorData.message) {
                // If we have a clean message from API, use it
                message = errorData.message;
             }
             showToast(message, 'error');
        }
    } finally {
        setProcessingIds(prev => {
            const next = new Set(prev);
            next.delete(job.id);
            return next;
        });
    }
  }, [saved, userToken, processingIds, showToast]);

  const remove = React.useCallback(async (id: string) => {
     if (!saved[id]) return;
     await toggle(saved[id]);
  }, [saved, toggle]);

  const mergeSaved = React.useCallback((jobs: Job[]) => {
      setSaved((prev) => {
          const next = { ...prev };
          let changed = false;
          jobs.forEach(job => {
              if (job.isSaved && !next[job.id]) {
                  next[job.id] = job;
                  changed = true;
              }
          });
          return changed ? next : prev;
      });
  }, []);

  const value = React.useMemo<SavedContextType>(() => ({
    saved,
    isSaved,
    toggle,
    remove,
    list,
    isLoading,
    loadingMore,
    refresh,
    loadMore,
    hasMore,
    isProcessing,
    mergeSaved,
  }), [saved, isSaved, toggle, remove, list, isLoading, loadingMore, refresh, loadMore, hasMore, isProcessing, mergeSaved]);

  return <SavedContext.Provider value={value}>{children}</SavedContext.Provider>;
}

export function useSaved() {
  const ctx = React.useContext(SavedContext);
  if (!ctx) return undefined;
  return ctx;
}
