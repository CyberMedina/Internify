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

// Configuración de notificaciones en primer plano: Silenciar alerta visual (banner) y sonido
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: false, // No mostrar banner nativo
    shouldPlaySound: false, // No reproducir sonido en primer plano
    shouldSetBadge: false,
  }),
});

const linking = {
  prefixes: [
    'https://overfoul-domingo-unharmable.ngrok-free.dev',
    Linking.createURL('/'),
  ],
  config: {
    screens: {
      // Mapea la ruta vacancies/:id a la pantalla JobDetail
      JobDetail: 'vacancies/:id',
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

  // Guardar deep link pendiente si no hay sesión
  useEffect(() => {
    const checkInitialUrl = async () => {
      const url = await Linking.getInitialURL();
      if (url && !userToken) {
        await setPendingDeeplink(url);
      }
      setInitialUrlChecked(true);
    };
    checkInitialUrl();
  }, [userToken]);

  // Restaurar deep link tras login
  useEffect(() => {
    if (userToken && initialUrlChecked) {
      getPendingDeeplink().then(async (url) => {
        if (url) {
          // Limpiar para no repetir
          await setPendingDeeplink(null);
          // Navegar usando el sistema de linking
          setTimeout(() => {
            Linking.openURL(url);
          }, 500);
        }
      });
    }
  }, [userToken, initialUrlChecked]);

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
