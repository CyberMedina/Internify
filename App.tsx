import React, { useEffect, useRef, useState } from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme, createNavigationContainerRef } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider, useTheme } from 'src/theme/ThemeContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RootStack from 'src/navigation/RootStack';
import { SavedProvider } from 'src/context/SavedContext';
import { AuthProvider } from 'src/context/AuthContext';
import { I18nProvider } from 'src/i18n/i18n';
import { ApplicationsProvider } from 'src/context/ApplicationsContext';
import * as Notifications from 'expo-notifications';
import { registerForPushNotificationsAsync } from 'src/utils/notifications';
import { ErrorBoundary } from 'src/components/ErrorBoundary';
import { ToastProvider } from 'src/context/ToastContext';
import { navigationRef } from 'src/navigation/navigationRef';

function Root() {
  const { isDark } = useTheme();
  const [expoPushToken, setExpoPushToken] = useState('');
  const [notification, setNotification] = useState<Notifications.Notification | undefined>(undefined);
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  useEffect(() => {
    // registerForPushNotificationsAsync().then(token => token && setExpoPushToken(token));

    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
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

  return (
    <NavigationContainer ref={navigationRef} theme={isDark ? DarkTheme : DefaultTheme}>
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
                    <Root />
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
