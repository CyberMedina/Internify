import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Tabs from './Tabs';
import SplashScreen from 'src/screens/SplashScreen';

import LoginScreen from 'src/screens/LoginScreen';
import OnboardingStack from './OnboardingStack';
import JobDetailScreen from '../screens/JobDetailScreen';

import NotificationConsentScreen from 'src/screens/NotificationConsentScreen';

import ApplicationStatusScreen from 'src/screens/ApplicationStatusScreen';
import { Application } from 'src/types/vacancy';

export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  NotificationConsent: undefined;
  Onboarding: undefined;
  MainTabs: undefined;
  JobDetail: { job: any } | undefined;
  ApplicationStatus: { application: Application; from?: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="NotificationConsent" component={NotificationConsentScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Onboarding" component={OnboardingStack} />
      <Stack.Screen name="MainTabs" component={Tabs} />
      <Stack.Screen name="JobDetail" component={JobDetailScreen} />
      <Stack.Screen name="ApplicationStatus" component={ApplicationStatusScreen} />
    </Stack.Navigator>
  );
}
