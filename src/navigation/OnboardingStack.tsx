import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import OnboardingWelcomeScreen from '../screens/onboarding/OnboardingWelcomeScreen';
import OnboardingPersonalDataScreen from '../screens/onboarding/OnboardingPersonalDataScreen';
import OnboardingAcademicScreen from '../screens/onboarding/OnboardingAcademicScreen';

import OnboardingCVStartScreen from '../screens/onboarding/OnboardingCVStartScreen';
import OnboardingCVWizardScreen from '../screens/onboarding/OnboardingCVWizardScreen';
import OnboardingCVPreviewScreen from '../screens/onboarding/OnboardingCVPreviewScreen';
import OnboardingRenewalScreen from '../screens/onboarding/OnboardingRenewalScreen';
import OnboardingProcessScreen from '../screens/onboarding/OnboardingProcessScreen';
import OnboardingCompletionScreen from '../screens/onboarding/OnboardingCompletionScreen';

export type OnboardingStackParamList = {
  Welcome: undefined;
  PersonalData: undefined;
  AcademicProfile: undefined;
  Renewal: undefined;
  Process: undefined;
  Completion: undefined;
  CVStart: undefined;
  CVWizard: { 
    mode: 'ai' | 'manual';
    cvData?: {
      cv_profile: {
        summary: string | null;
        secondary_education: {
          school: string | null;
          title: string | null;
          start_date: { month: string | null; year: string | null };
          end_date: { month: string | null; year: string | null };
        };
        experience: any[];
        certifications: any[];
        languages: any[];
        skills: string[];
        references: any[];
      };
      missing_sections: {
        summary: boolean;
        secondary_education: boolean;
        experience: boolean;
        certifications: boolean;
        languages: boolean;
        skills: boolean;
        references: boolean;
      };
    };
  };
  CVPreview: undefined;
};

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

export default function OnboardingStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Welcome" component={OnboardingWelcomeScreen} />
      <Stack.Screen name="PersonalData" component={OnboardingPersonalDataScreen} />
      <Stack.Screen name="AcademicProfile" component={OnboardingAcademicScreen} />
      <Stack.Screen name="Renewal" component={OnboardingRenewalScreen} />
      <Stack.Screen name="Process" component={OnboardingProcessScreen} />
      <Stack.Screen name="Completion" component={OnboardingCompletionScreen} />
      <Stack.Screen name="CVStart" component={OnboardingCVStartScreen} />
      <Stack.Screen name="CVWizard" component={OnboardingCVWizardScreen} />
      <Stack.Screen name="CVPreview" component={OnboardingCVPreviewScreen} />
    </Stack.Navigator>
  );
}
