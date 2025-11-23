import React from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider, useTheme } from 'src/theme/ThemeContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RootStack from 'src/navigation/RootStack';
import { SavedProvider } from 'src/context/SavedContext';
import { I18nProvider } from 'src/i18n/i18n';

function Root() {
  const { isDark } = useTheme();
  return (
    <NavigationContainer theme={isDark ? DarkTheme : DefaultTheme}>
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
          <SavedProvider>
            <Root />
          </SavedProvider>
        </I18nProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
