import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeStack from './HomeStack';
import ApplicationsStack from './ApplicationsStack';
import SavedStack from './SavedStack';
import { View, Text, DeviceEventEmitter, Pressable } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming, interpolate } from 'react-native-reanimated';
import { useTheme } from '../theme/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, Ionicons } from '@expo/vector-icons';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import MyApplicationsScreen from '../screens/MyApplicationsScreen';
import { useI18n } from '../i18n/i18n';
import { useVacancyContext } from '../context/VacancyContext';

const Tab = createBottomTabNavigator();

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/** Ícono con píldora indicadora estilo Material Design 3 */
const TabIcon = ({ icon, focused, color, size, badge }: {
  icon: string;
  focused: boolean;
  color: string;
  size: number;
  badge?: React.ReactNode;
}) => {
  const { colors } = useTheme();
  const progress = useSharedValue(focused ? 1 : 0);

  React.useEffect(() => {
    progress.value = withSpring(focused ? 1 : 0, { damping: 15, stiffness: 150 });
  }, [focused]);

  const pillStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ scaleX: interpolate(progress.value, [0, 1], [0.5, 1]) }],
  }));

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', width: 64, height: 32 }}>
      {/* Píldora indicadora detrás del ícono */}
      <Animated.View
        style={[
          {
            position: 'absolute',
            width: 64,
            height: 32,
            borderRadius: 16,
            backgroundColor: colors.primary + '1A',
          },
          pillStyle,
        ]}
      />
      <View>
        <Feather name={icon as any} size={size} color={color} />
        {badge}
      </View>
    </View>
  );
};

const Placeholder: React.FC<{ title: string }> = ({ title }) => (
  <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
    <Text>{title}</Text>
  </View>
);

export default function Tabs() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { t } = useI18n();
  const { isFeedOutdated } = useVacancyContext();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          height: 56 + insets.bottom,
          paddingBottom: Math.max(8, insets.bottom),
          paddingTop: 4,
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
        },
      }}
    >
      <Tab.Screen
        name="HomeTab" 
        component={HomeStack}
        options={({ route }) => {
          const routeName = getFocusedRouteNameFromRoute(route) ?? 'HomeMain';
          const hideTab = routeName === 'ApplicationSuccess' 
            || routeName === 'ProfileMain' 
            || routeName === 'MyApplications' 
            || routeName === 'MyProfile' 
            || routeName === 'ApplicationStatus' 
            || routeName === 'Notifications'
            || routeName === 'SuggestedJobs'
            || routeName === 'Settings'
            || routeName === 'PDFViewer'
            || routeName === 'Search';
          return {
            title: t('tabs.home'),
            tabBarIcon: ({ color, size, focused }) => (
              <TabIcon icon="home" focused={focused} color={color} size={size}
                badge={isFeedOutdated ? (
                  <View
                    style={{
                      position: 'absolute',
                      right: -1,
                      top: -1,
                      backgroundColor: colors.error || '#FF3B30',
                      width: 10,
                      height: 10,
                      borderRadius: 5,
                      borderWidth: 1,
                      borderColor: colors.surface,
                    }}
                  />
                ) : undefined}
              />
            ),
            ...(hideTab ? { tabBarStyle: { display: 'none' as const } } : {}),
          };
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            if (navigation.isFocused()) {
              DeviceEventEmitter.emit('event.homeTabPressed');
            }
          },
        })}
      />
      <Tab.Screen
        name="ApplicationsStack"
        component={ApplicationsStack}
        options={({ route }) => {
          // Hide tab bar on ApplicationStatus screen
          const routeName = getFocusedRouteNameFromRoute(route) ?? 'MyApplications';
          const hideTab = routeName === 'ApplicationStatus' || routeName === 'JobDetail';
          
          return {
            title: t('applications.title'), // Postulaciones
            tabBarIcon: ({ color, size, focused }) => <TabIcon icon="briefcase" focused={focused} color={color} size={size} />,
            ...(hideTab ? { tabBarStyle: { display: 'none' as const } } : {}),
            headerShown: false
          };
        }}
      />
      <Tab.Screen
        name="SavedStack"
        component={SavedStack}
        options={{ 
          title: t('tabs.saved'),
          tabBarIcon: ({ color, size, focused }) => <TabIcon icon="bookmark" focused={focused} color={color} size={size} /> 
        }}
      />
    </Tab.Navigator>
  );
}
