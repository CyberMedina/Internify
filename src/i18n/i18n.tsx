import React from 'react';

// Minimal i18n with ES locale only for now. Can be expanded easily.

type Dict = Record<string, any>;

type I18nContextType = {
  t: (key: string, params?: Record<string, string | number>) => string;
  locale: string;
  setLocale: (loc: string) => void;
};

const I18nContext = React.createContext<I18nContextType | undefined>(undefined);

const es: Dict = {
  common: {
    viewAll: 'Ver todo',
    applicants: 'Postulantes',
    searchPlaceholder: 'Buscar…',
    sending: 'Enviando…',
    apply: 'Aplicar a este trabajo',
    goHome: 'Ir a inicio',
    noJobsFor: 'No se encontraron trabajos para "{{cat}}".',
    noJobsAvailable: 'No hay vacantes disponibles por el momento.',
  },
  tabs: {
    home: 'Inicio',
    search: 'Buscar',
    saved: 'Guardados',
    chat: 'Chat',
    profile: 'Perfil',
  },
  home: {
    suggested: 'Trabajos sugeridos',
    recent: 'Trabajos recientes',
    hello: 'Hola, {{name}}',
    goodMorning: 'Buenos días',
    goodAfternoon: 'Buenas tardes',
    goodEvening: 'Buenas noches',
    newVacancies: 'Nuevas vacantes',
  },
  detail: {
    salaryMonthly: 'Salario (Mensual)',
    jobType: 'Tipo de puesto',
    workingModel: 'Modalidad',
    level: 'Nivel',
    aboutThisJob: 'Acerca de este Trabajo',
    jobDescription: 'Descripción del Trabajo',
    company: 'Sobre la empresa',
    reviews: 'Reseñas',
    readMore: ' Leer más',
  },
  profile: {
    title: 'Perfil',
    viewProfile: 'Ver perfil',
    personalInfo: 'Información personal',
    analytics: 'Analíticas',
    myApplications: 'Mis postulaciones',
    seekingStatus: 'Estado de búsqueda',
    settings: 'Configuración',
    language: 'Idioma',
    helpCenter: 'Centro de ayuda',
    privacyPolicy: 'Política de privacidad',
    inviteFriends: 'Invitar amigos',
  },
  applications: {
    title: 'Mis postulaciones',
    status: {
      sent: 'Enviada',
      accepted: 'Aceptada',
      rejected: 'Rechazada',
      pending: 'Pendiente',
    },
  },
  search: {
    recentSearches: 'Búsquedas recientes',
    recentlyViewed: 'Vistos recientemente',
  },
  success: {
    congrats: '¡Felicidades!',
    body: 'Tu postulación se envió correctamente.\nPuedes revisarla desde tu perfil.',
  }
  ,
  splash: {
    title: 'Internify'
  }
};

const locales: Record<string, Dict> = { es };

function resolveKey(dict: Dict, key: string): string | undefined {
  const parts = key.split('.');
  let cur: any = dict;
  for (const p of parts) {
    cur = cur?.[p];
    if (cur === undefined) return undefined;
  }
  return typeof cur === 'string' ? cur : undefined;
}

function interpolate(str: string, params?: Record<string, string | number>) {
  if (!params) return str;
  return str.replace(/{{(\w+)}}/g, (_, k) => String(params[k] ?? ''));
}

export function I18nProvider({ children, initialLocale = 'es' }: { children: React.ReactNode; initialLocale?: string }) {
  const [locale, setLocale] = React.useState(initialLocale);
  const dict = locales[locale] ?? locales.es;

  const t = React.useCallback((key: string, params?: Record<string, string | number>) => {
    const found = resolveKey(dict, key) ?? key;
    return interpolate(found, params);
  }, [dict]);

  const value = React.useMemo(() => ({ t, locale, setLocale }), [t, locale]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = React.useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}
