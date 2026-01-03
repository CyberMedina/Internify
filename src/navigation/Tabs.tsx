import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeStack from './HomeStack';
import SavedScreen from '../screens/SavedScreen';
import { View, Text } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, Ionicons } from '@expo/vector-icons';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import MyApplicationsScreen from '../screens/MyApplicationsScreen';
import { useI18n } from '../i18n/i18n';

const Tab = createBottomTabNavigator();

const Placeholder: React.FC<{ title: string }> = ({ title }) => (
  <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
    <Text>{title}</Text>
  </View>
);

export default function Tabs() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { t } = useI18n();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarStyle: {
          height: 56 + insets.bottom,
          paddingBottom: Math.max(8, insets.bottom),
          paddingTop: 8,
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
        },
      }}
    >
      <Tab.Screen
        name={t('tabs.home')}
        component={HomeStack}
        options={({ route }) => {
          const routeName = getFocusedRouteNameFromRoute(route) ?? 'HomeMain';
          const hideTab = routeName === 'ApplicationSuccess' || routeName === 'ProfileMain' || routeName === 'MyApplications' || routeName === 'MyProfile' || routeName === 'ApplicationStatus' || routeName === 'Notifications';
          return {
            tabBarIcon: ({ color, size }) => <Feather name="home" size={size} color={color} />,
            tabBarStyle: hideTab
              ? { display: 'none' }
              : undefined,
          };
        }}
      />
      <Tab.Screen
        name="MyApplications"
        component={MyApplicationsScreen}
        options={{ 
          title: 'Postulaciones',
          tabBarIcon: ({ color, size }) => <Feather name="briefcase" size={size} color={color} /> 
        }}
      />
      <Tab.Screen
        name={t('tabs.saved')}
        component={SavedScreen}
        options={{ tabBarIcon: ({ color, size }) => <Feather name="bookmark" size={size} color={color} /> }}
      />
    </Tab.Navigator>
  );
}
