import React, { useEffect, useRef, useState } from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme, createNavigationContainerRef } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider, useTheme } from 'src/theme/ThemeContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RootStack from 'src/navigation/RootStack';
import { getPendingDeeplink, setPendingDeeplink } from 'src/utils/storage';
import { SavedProvider } from 'src/context/SavedContext';
import { AuthProvider } from 'src/context/AuthContext';
import { I18nProvider } from 'src/i18n/i18n';
import { ApplicationsProvider } from 'src/context/ApplicationsContext';
import { VacancyProvider, useVacancyContext } from 'src/context/VacancyContext';
import * as Notifications from 'expo-notifications';
import { registerForPushNotificationsAsync } from 'src/utils/notifications';
import { ErrorBoundary } from 'src/components/ErrorBoundary';
import { ToastProvider } from 'src/context/ToastContext';
import { navigationRef } from 'src/navigation/navigationRef';
import * as Linking from 'expo-linking';
import { ENV } from './src/config/env';

// Configuración de notificaciones en primer plano: Silenciar alerta visual (banner) y sonido
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: false, // No mostrar banner nativo
    shouldPlaySound: false, // No reproducir sonido en primer plano
    shouldSetBadge: false,
  }),
});

// Parsea una URL de deep link y extrae la pantalla destino y sus parámetros
function parseDeepLinkUrl(url: string): { screen: string; params: any } | null {
  try {
    const match = url.match(/\/vacancies\/(\d+)/);
    if (match) {
      return { screen: 'JobDetail', params: { job: { id: Number(match[1]) } } };
    }
    return null;
  } catch {
    return null;
  }
}

const linking = {
  prefixes: [
    ENV.BASE_URL,
    Linking.createURL('/'),
  ],
  config: {
    screens: {
      MainTabs: {
        screens: {
          HomeStack: {
            screens: {
              HomeScreen: 'home',
            },
          },
        },
      },
    },
  },
};


import { useAuth } from 'src/context/AuthContext';
import { useNavigationContainerRef } from '@react-navigation/native';

function Root() {
  const { isDark } = useTheme();
  const { userToken, isLoading } = useAuth();
  const { markFeedAsOutdated } = useVacancyContext();
  const [expoPushToken, setExpoPushToken] = useState('');
  const [notification, setNotification] = useState<Notifications.Notification | undefined>(undefined);
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();
  const [initialUrlChecked, setInitialUrlChecked] = useState(false);

  // 1. Al montar, guardar deep link pendiente (SIEMPRE, sin importar auth)
  useEffect(() => {
    const checkInitialUrl = async () => {
      const url = await Linking.getInitialURL();
      if (url && parseDeepLinkUrl(url)) {
        await setPendingDeeplink(url);
      }
      setInitialUrlChecked(true);
    };
    checkInitialUrl();
  }, []);

  // 2. Procesar deep link pendiente una vez el usuario está autenticado
  useEffect(() => {
    if (!userToken || !initialUrlChecked) return;

    const processPending = async () => {
      const url = await getPendingDeeplink();
      if (!url) return;

      await setPendingDeeplink(null);
      const parsed = parseDeepLinkUrl(url);
      if (!parsed) return;

      // Esperar a que la navegación normal llegue a MainTabs (splash/login flow)
      let attempts = 0;
      const maxAttempts = 20; // ~6 segundos máximo

      const tryNavigate = () => {
        attempts++;
        if (!navigationRef.isReady() || attempts > maxAttempts) return;

        const state = navigationRef.getRootState();
        const currentRoute = state?.routes?.[state.index];

        if (currentRoute?.name === 'MainTabs') {
          // Ya estamos en MainTabs, navegar al destino del deep link
          navigationRef.navigate(parsed.screen as never, parsed.params as never);
        } else {
          // Aún no llegamos a MainTabs, reintentar
          setTimeout(tryNavigate, 300);
        }
      };

      setTimeout(tryNavigate, 500);
    };

    processPending();
  }, [userToken, initialUrlChecked]);

  // 3. Escuchar deep links en tiempo de ejecución (app abierta o en background)
  useEffect(() => {
    const subscription = Linking.addEventListener('url', async ({ url }) => {
      const parsed = parseDeepLinkUrl(url);
      if (!parsed) return;

      if (!userToken) {
        // Sin sesión: guardar para después del login
        await setPendingDeeplink(url);
        return;
      }

      // Con sesión: navegar directamente (MainTabs ya está en el stack)
      if (navigationRef.isReady()) {
        navigationRef.navigate(parsed.screen as never, parsed.params as never);
      }
    });

    return () => subscription.remove();
  }, [userToken]);

  useEffect(() => {
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log("🔔 [NOTIFICACIÓN RECIBIDA]", JSON.stringify(notification, null, 2));
      setNotification(notification);
      
      // "El Oído" Global: Atrapamos notificaciones de nuevas vacantes
      const data = notification.request.content.data;
      console.log("📦 [PAYLOAD DATA]", JSON.stringify(data, null, 2));

      if (data.type === 'vacancy_created' || data.type === 'NEW_VACANCY') {
        console.log("✅ Detectada nueva vacante. Actualizando Feed...");
        markFeedAsOutdated();
      }
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;
      const type = data.type;

      if (navigationRef.isReady()) {
        switch (type) {
          case 'vacancy_created':
          case 'vacancy_status':
            if (data.id) {
              navigationRef.navigate('JobDetail', { job: { id: data.id } });
            }
            break;
          case 'application_status':
            navigationRef.navigate('MainTabs', { screen: 'MyApplications' });
            break;
          case 'test':
            // Handle test notification if needed
            break;
        }
      }
    });

    return () => {
      notificationListener.current && notificationListener.current.remove();
      responseListener.current && responseListener.current.remove();
    };
  }, []);

  if (!initialUrlChecked && !userToken) return null;

  return (
    <NavigationContainer
      ref={navigationRef}
      theme={isDark ? DarkTheme : DefaultTheme}
      linking={linking}
    >
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <RootStack />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <ThemeProvider>
          <I18nProvider>
            <ToastProvider>
              <AuthProvider>
                <ApplicationsProvider>
                  <SavedProvider>
                    <VacancyProvider>
                      <Root />
                    </VacancyProvider>
                  </SavedProvider>
                </ApplicationsProvider>
              </AuthProvider>
            </ToastProvider>
          </I18nProvider>
        </ThemeProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
