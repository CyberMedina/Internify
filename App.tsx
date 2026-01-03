import React, { useEffect, useRef, useState } from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme, createNavigationContainerRef } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider, useTheme } from 'src/theme/ThemeContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RootStack from 'src/navigation/RootStack';
import { SavedProvider } from 'src/context/SavedContext';
import { AuthProvider } from 'src/context/AuthContext';
import { I18nProvider } from 'src/i18n/i18n';
import * as Notifications from 'expo-notifications';
import { registerForPushNotificationsAsync } from 'src/utils/notifications';

export const navigationRef = createNavigationContainerRef<any>();

function Root() {
  const { isDark } = useTheme();
  const [expoPushToken, setExpoPushToken] = useState('');
  const [notification, setNotification] = useState<Notifications.Notification | undefined>(undefined);
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  useEffect(() => {
    registerForPushNotificationsAsync().then(token => token && setExpoPushToken(token));

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
      notificationListener.current && Notifications.removeNotificationSubscription(notificationListener.current);
      responseListener.current && Notifications.removeNotificationSubscription(responseListener.current);
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
      <ThemeProvider>
        <I18nProvider>
          <AuthProvider>
            <SavedProvider>
              <Root />
            </SavedProvider>
          </AuthProvider>
        </I18nProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
