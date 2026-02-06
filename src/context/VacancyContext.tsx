import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';

interface VacancyContextType {
  isFeedOutdated: boolean;
  markFeedAsOutdated: () => void;
  markFeedAsUpdated: () => void;
}

const VacancyContext = createContext<VacancyContextType | undefined>(undefined);

export const VacancyProvider = ({ children }: { children: ReactNode }) => {
  const [isFeedOutdated, setIsFeedOutdated] = useState(false);

  // Acción cuando llega una notificación
  const markFeedAsOutdated = useCallback(() => {
    setIsFeedOutdated(true);
  }, []);

  // Acción cuando el usuario actualiza el feed (pull-to-refresh o clic en pastilla)
  const markFeedAsUpdated = useCallback(() => {
    setIsFeedOutdated(false);
  }, []);

  return (
    <VacancyContext.Provider
      value={{
        isFeedOutdated,
        markFeedAsOutdated,
        markFeedAsUpdated,
      }}
    >
      {children}
    </VacancyContext.Provider>
  );
};

export const useVacancyContext = () => {
  const context = useContext(VacancyContext);
  if (!context) {
    throw new Error('useVacancyContext must be used within a VacancyProvider');
  }
  return context;
};
