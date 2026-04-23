import { initializeApp, getApps, type FirebaseApp, type FirebaseOptions } from 'firebase/app';
import { initializeAuth, getReactNativePersistence, type Auth } from 'firebase/auth';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { defaultFirebaseWebConfig } from '../constants/firebaseConfig';

function readConfig(): FirebaseOptions {
  const d = defaultFirebaseWebConfig;
  const apiKey = process.env.EXPO_PUBLIC_FIREBASE_API_KEY || d.apiKey;
  const authDomain = process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || d.authDomain;
  const projectId = process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || d.projectId;
  const storageBucket = process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || d.storageBucket;
  const messagingSenderId =
    process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || d.messagingSenderId;
  const appId = process.env.EXPO_PUBLIC_FIREBASE_APP_ID || d.appId;
  const measurementId =
    process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID || d.measurementId;

  if (!apiKey || !projectId || !appId) {
    console.warn('[firebase] Missing Firebase web config. Set EXPO_PUBLIC_FIREBASE_* in .env or constants/firebaseConfig.ts.');
  }

  return {
    apiKey,
    authDomain,
    projectId,
    storageBucket,
    messagingSenderId,
    appId,
    ...(measurementId ? { measurementId } : {}),
  };
}

let appInstance: FirebaseApp | null = null;

export function getFirebaseApp(): FirebaseApp {
  if (!appInstance) {
    const config = readConfig();
    appInstance = getApps().length ? getApps()[0]! : initializeApp(config);
  }
  return appInstance;
}

let authInstance: Auth | null = null;

export function getFirebaseAuth(): Auth {
  if (!authInstance) {
    const app = getFirebaseApp();
    if (Platform.OS === 'web') {
      const { getAuth } = require('firebase/auth');
      authInstance = getAuth(app);
    } else {
      authInstance = initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage)
      });
    }
  }
  return authInstance;
}

/** Plain object for `FirebaseRecaptchaVerifierModal` / Expo. */
export function getFirebaseWebConfig(): FirebaseOptions {
  return readConfig();
}

/**
 * Google Analytics (Firebase) — web only. On iOS/Android this resolves to null.
 * Call once after app mount if you need analytics on web.
 */
export async function getFirebaseAnalytics(): Promise<
  import('firebase/analytics').Analytics | null
> {
  if (Platform.OS !== 'web') {
    return null;
  }
  try {
    const { getAnalytics, isSupported } = await import('firebase/analytics');
    const app = getFirebaseApp();
    if (await isSupported()) {
      return getAnalytics(app);
    }
  } catch {
    // Analytics not available in this environment
  }
  return null;
}
