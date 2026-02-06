import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeStack from './HomeStack';
import ApplicationsStack from './ApplicationsStack';
import SavedStack from './SavedStack';
import { View, Text, DeviceEventEmitter, Pressable } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming } from 'react-native-reanimated';
import { useTheme } from '../theme/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, Ionicons } from '@expo/vector-icons';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import MyApplicationsScreen from '../screens/MyApplicationsScreen';
import { useI18n } from '../i18n/i18n';
import { useVacancyContext } from '../context/VacancyContext';

const Tab = createBottomTabNavigator();

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const TabBarButton = (props: any) => {
  const { onPress, onLongPress, children, style } = props;
  const { colors } = useTheme();
  const opacity = useSharedValue(0);

  const rBackgroundStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  const handlePressIn = () => {
    opacity.value = withTiming(1, { duration: 150 });
  };

  const handlePressOut = () => {
    opacity.value = withTiming(0, { duration: 300 });
  };

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={style}
      android_ripple={{ borderless: true, color: colors.primary + '10', radius: 40 }}
    >
      <Animated.View
        style={[
          {
            position: 'absolute',
            alignSelf: 'center',
            top: 2, 
            width: '90%', // Adaptable al ancho del tab (cubre textos largos)
            height: 48, 
            borderRadius: 12, 
            backgroundColor: colors.text + '1A', 
            zIndex: -1,
          },
          rBackgroundStyle
        ]}
      />
      {children}
    </Pressable>
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
        tabBarStyle: {
          height: 56 + insets.bottom,
          paddingBottom: Math.max(8, insets.bottom),
          paddingTop: 8,
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
        },
        tabBarButton: (props) => <TabBarButton {...props} />,
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
            || routeName === 'PDFViewer';
          return {
            title: t('tabs.home'),
            tabBarIcon: ({ color, size, focused }) => (
              <View>
                <Feather name="home" size={size} color={color} />
                {/* Visual Cue: Rojo sutil si hay vacantes nuevas */}
                {isFeedOutdated && (
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
                )}
              </View>
            ),
            tabBarStyle: hideTab
              ? { display: 'none' }
              : undefined,
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
          const hideTab = routeName === 'ApplicationStatus';
          
          return {
            title: t('applications.title'), // Postulaciones
            tabBarIcon: ({ color, size }) => <Feather name="briefcase" size={size} color={color} />,
            tabBarStyle: hideTab ? { display: 'none' } : undefined,
            headerShown: false // Ensure header is hidden as stack handles it or screens do
          };
        }}
      />
      <Tab.Screen
        name="SavedStack"
        component={SavedStack}
        options={{ 
          title: t('tabs.saved'),
          tabBarIcon: ({ color, size }) => <Feather name="bookmark" size={size} color={color} /> 
        }}
      />
    </Tab.Navigator>
  );
}
