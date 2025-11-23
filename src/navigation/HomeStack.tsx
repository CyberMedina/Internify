import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import JobDetailScreen from '../screens/JobDetailScreen';
import ApplicationSuccessScreen from '../screens/ApplicationSuccessScreen';
import ProfileScreen from '../screens/ProfileScreen';
import MyApplicationsScreen from '../screens/MyApplicationsScreen';

export type HomeStackParamList = {
  HomeMain: undefined;
  JobDetail: { job: any } | undefined;
  ApplicationSuccess: undefined;
  ProfileMain: undefined;
  MyApplications: undefined;
};

const Stack = createNativeStackNavigator<HomeStackParamList>();

export default function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="JobDetail" component={JobDetailScreen} />
      <Stack.Screen name="ApplicationSuccess" component={ApplicationSuccessScreen} />
      <Stack.Screen name="ProfileMain" component={ProfileScreen} />
      <Stack.Screen name="MyApplications" component={MyApplicationsScreen} />
    </Stack.Navigator>
  );
}
