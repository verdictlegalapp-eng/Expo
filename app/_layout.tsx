import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts, Outfit_400Regular, Outfit_600SemiBold, Outfit_700Bold } from '@expo-google-fonts/outfit';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Colors } from '../constants/Colors';

// Prevent auto hide until fonts load
SplashScreen.preventAutoHideAsync();

const VerdictTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: Colors.gold,
    background: Colors.background,
    card: Colors.surfaceDeep,
    text: Colors.text,
    border: Colors.border,
    notification: Colors.gold,
  },
};


import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { View, Image, StyleSheet, Animated } from 'react-native';
import { useState, useRef } from 'react';
import { usePathname, useRouter } from 'expo-router';
import FloatingGlassNav from '../components/FloatingGlassNav';
import { UserProvider, useUser } from '../context/UserContext';
import { fetchCurrentUser } from '../lib/authApi';
import { registerForPushIfConfigured } from '../lib/pushRegistration';

function AppContent() {
  const pathname = usePathname();
  const router = useRouter();
  const { setRole } = useUser();
  const [isAppReady, setIsAppReady] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const [fontsLoaded, fontError] = useFonts({
    Outfit_400Regular,
    Outfit_600SemiBold,
    Outfit_700Bold,
  });

  // Define routes where the navigation bar should be visible
  const showNav = [
    '/discovery', 
    '/explore', 
    '/likes', 
    '/messages', 
    '/boost',
    '/client-profile', 
    '/attorney-profile',
    '/license-verification'
  ].includes(pathname);

  useEffect(() => {
    const checkLogin = async () => {
      try {
        console.log('[AutoLogin] Checking session...');
        const user = await fetchCurrentUser();
        console.log('[AutoLogin] User found:', user?.role);
        
        if (user) {
          const role = user.role === 'lawyer' ? 'attorney' : 'client';
          setRole(role);
          registerForPushIfConfigured({ id: user.id, role: user.role }).catch(() => {});
          
          // Small delay to ensure router is ready
          setTimeout(() => {
            if (user.role === 'lawyer') {
              router.replace('/attorney-profile');
            } else {
              router.replace('/client-profile');
            }
          }, 100);
        }
      } catch (e) {
        console.log('[AutoLogin] No active session or error:', e);
      }
    };

    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
      checkLogin();
      
      const timer = setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }).start(() => {
          setIsAppReady(true);
        });
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <ThemeProvider value={VerdictTheme}>
      <View style={{ flex: 1 }}>
        <Stack screenOptions={{ 
          contentStyle: { backgroundColor: Colors.background },
          headerShown: false
        }}>

          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="discovery" options={{ headerShown: false }} />
          <Stack.Screen name="lawyer/[id]" options={{ presentation: 'modal', headerShown: false }} />
          <Stack.Screen name="license-verification" options={{ presentation: 'modal', headerShown: false }} />
        </Stack>
        
        {/* Global Navigation - Only shown on main screens */}
        {showNav && <FloatingGlassNav />}
      </View>

      <StatusBar style="light" />

      
      {/* Custom JS Splash Screen Overlay */}
      {!isAppReady && (
        <Animated.View 
          style={[
            StyleSheet.absoluteFill, 
            styles.splashContainer, 
            { opacity: fadeAnim }
          ]}
        >
          <Image 
            source={require('../assets/images/logo-full.jpg')} 
            style={styles.splashLogo} 
            resizeMode="contain"
          />
        </Animated.View>
      )}
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <UserProvider>
        <AppContent />
      </UserProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    backgroundColor: '#020617',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },

  splashLogo: {
    width: '70%',
    height: 100,
  },
});
