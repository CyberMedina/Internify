import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MyApplicationsScreen from '../screens/MyApplicationsScreen';
import ApplicationStatusScreen from '../screens/ApplicationStatusScreen';
import { Application } from '../types/vacancy';

export type ApplicationsStackParamList = {
  MyApplications: undefined;
  ApplicationStatus: { application: Application };
};

const Stack = createNativeStackNavigator<ApplicationsStackParamList>();

export default function ApplicationsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MyApplications" component={MyApplicationsScreen} />
      <Stack.Screen name="ApplicationStatus" component={ApplicationStatusScreen} />
    </Stack.Navigator>
  );
}
