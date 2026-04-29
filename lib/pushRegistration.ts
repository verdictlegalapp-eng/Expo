import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { isServicesConfigured, registerPushToken } from './servicesApi';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function registerForPushIfConfigured(user: { id: number; role: string }): Promise<void> {
  if (!isServicesConfigured()) return;
  try {
    const { status: existing } = await Notifications.getPermissionsAsync();
    let finalStatus = existing;
    if (existing !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') return;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.DEFAULT,
      });
    }

    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
    const expoPushToken = await Notifications.getExpoPushTokenAsync(
      projectId ? { projectId } : {},
    );
    const token = expoPushToken.data;
    const role = user.role === 'lawyer' ? 'attorney' : user.role;
    await registerPushToken(token, role, user.id);
  } catch (e) {
    if (__DEV__) console.warn('[pushRegistration]', e);
  }
}
