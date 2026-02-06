import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import ApplicationSuccessScreen from '../screens/ApplicationSuccessScreen';
import ProfileScreen from '../screens/ProfileScreen';
import MyApplicationsScreen from '../screens/MyApplicationsScreen';
import MyProfileScreen from '../screens/MyProfileScreen';
import ApplicationStatusScreen from '../screens/ApplicationStatusScreen';
import SearchScreen from '../screens/SearchScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import SuggestedJobsScreen from '../screens/SuggestedJobsScreen';
import PDFViewerScreen from '../screens/PDFViewerScreen';
import { Application } from '../types/vacancy';
import { Job } from '../components/JobCardLarge';

export type HomeStackParamList = {
  HomeMain: undefined;
  ApplicationSuccess: undefined;
  ProfileMain: undefined;
  MyApplications: undefined;
  MyProfile: undefined;
  ApplicationStatus: { application: Application };
  Search: undefined;
  Notifications: undefined;
  Settings: undefined;
  SuggestedJobs: { jobs: Job[] };
  PDFViewer: { url: string; title: string };
};

const Stack = createNativeStackNavigator<HomeStackParamList>();

export default function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="ApplicationSuccess" component={ApplicationSuccessScreen} />
      <Stack.Screen name="ProfileMain" component={ProfileScreen} />
      <Stack.Screen name="MyApplications" component={MyApplicationsScreen} />
      <Stack.Screen name="ApplicationStatus" component={ApplicationStatusScreen} />
      <Stack.Screen name="MyProfile" component={MyProfileScreen} />
      <Stack.Screen name="Search" component={SearchScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="SuggestedJobs" component={SuggestedJobsScreen} />
      <Stack.Screen name="PDFViewer" component={PDFViewerScreen} />
    </Stack.Navigator>
  );
}
