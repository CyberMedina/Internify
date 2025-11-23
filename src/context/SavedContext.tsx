import React from 'react';
import type { Job } from '../components/JobCardLarge';

type SavedContextType = {
  saved: Record<string, Job>;
  isSaved: (id: string) => boolean;
  toggle: (job: Job) => void;
  remove: (id: string) => void;
  list: Job[];
};

const SavedContext = React.createContext<SavedContextType | undefined>(undefined);

export function SavedProvider({ children }: { children: React.ReactNode }) {
  const [saved, setSaved] = React.useState<Record<string, Job>>({});

  const isSaved = React.useCallback((id: string) => Boolean(saved[id]), [saved]);

  const toggle = React.useCallback((job: Job) => {
    setSaved((prev) => {
      const next = { ...prev };
      if (next[job.id]) delete next[job.id];
      else next[job.id] = job;
      return next;
    });
  }, []);

  const remove = React.useCallback((id: string) => {
    setSaved((prev) => {
      if (!prev[id]) return prev;
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, []);

  const value = React.useMemo<SavedContextType>(() => ({
    saved,
    isSaved,
    toggle,
    remove,
    list: Object.values(saved),
  }), [saved, isSaved, toggle, remove]);

  return <SavedContext.Provider value={value}>{children}</SavedContext.Provider>;
}

export function useSaved() {
  const ctx = React.useContext(SavedContext);
  if (!ctx) return undefined;
  return ctx;
}
