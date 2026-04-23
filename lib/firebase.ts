import { initializeApp, getApps, getApp, type FirebaseApp, type FirebaseOptions } from 'firebase/app';
import { initializeAuth, getReactNativePersistence, type Auth, getAuth } from 'firebase/auth';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// HARD-CODED CONFIG (Rules out .env issues)
const firebaseConfig: FirebaseOptions = {
  apiKey: "AIzaSyBNm2rcAHKRL_BglglzVN8-l637EoOKz-E",
  authDomain: "verdict-8b602.firebaseapp.com",
  projectId: "verdict-8b602",
  storageBucket: "verdict-8b602.firebasestorage.app",
  messagingSenderId: "773812557132",
  appId: "1:773812557132:web:b42e9900a4042f250dabe9",
  measurementId: "G-ZKRH4RHHYR"
};

console.log('[firebase] Using Hard-coded Config');

// Initialize App
let app: FirebaseApp;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
  console.log('✅ Firebase Default App Initialized');
} else {
  app = getApp();
  console.log('✅ Firebase App already exists');
}

export function getFirebaseApp(): FirebaseApp {
  return app;
}

// Initialize Auth
let auth: Auth;
if (Platform.OS === 'web') {
  auth = getAuth(app);
} else {
  try {
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage)
    });
    console.log('✅ Firebase Auth Initialized with persistence');
  } catch (e) {
    auth = getAuth(app);
    console.log('✅ Firebase Auth already exists (using getAuth)');
  }
}

export function getFirebaseAuth(): Auth {
  return auth;
}

export function getFirebaseWebConfig(): FirebaseOptions {
  return firebaseConfig;
}
