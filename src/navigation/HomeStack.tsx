import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import ApplicationSuccessScreen from '../screens/ApplicationSuccessScreen';
import ProfileScreen from '../screens/ProfileScreen';
import MyApplicationsScreen from '../screens/MyApplicationsScreen';
import MyProfileScreen from '../screens/MyProfileScreen';
import ApplicationStatusScreen from '../screens/ApplicationStatusScreen';
import { Application } from '../types/vacancy';

export type HomeStackParamList = {
  HomeMain: undefined;
  ApplicationSuccess: undefined;
  ProfileMain: undefined;
  MyApplications: undefined;
  MyProfile: undefined;
  ApplicationStatus: { application: Application };
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
    </Stack.Navigator>
  );
}
