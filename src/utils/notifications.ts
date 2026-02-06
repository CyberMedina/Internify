import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!');
      return;
    }
    
    // Learn more about projectId:
    // https://docs.expo.dev/push-notifications/push-notifications-setup/#configure-projectid
    // For bare workflow or if you don't have EAS project ID, you might not need projectId, 
    // but it's good practice if you are using Expo's push service.
    // If you are using FCM directly without Expo's push service, the token might be different.
    // But usually with expo-notifications we use Expo Push Token.
    
    try {
        const projectId =
            Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
        
        console.log('[Notifications] Using Project ID:', projectId);
            
        if (!projectId) {
            console.log("Project ID not found. Run 'eas init' to configure it for Push Notifications.");
        }

        token = (await Notifications.getExpoPushTokenAsync({
            projectId,
        })).data;
        console.log("Expo Push Token:", token);
    } catch (e) {
        console.log("Error getting push token (this is expected in dev without EAS project ID):", e);
    }
  } else {
    alert('Must use physical device for Push Notifications');
  }

  return token;
}
