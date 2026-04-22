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
    primary: Colors.electricBlue,
    background: '#FFFFFF',
    card: '#FFFFFF',
    text: '#0F172A',
    border: '#E2E8F0',
    notification: Colors.navy,
  },
};

import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { View, Image, StyleSheet, Animated } from 'react-native';
import { useState, useRef } from 'react';
import { usePathname } from 'expo-router';
import FloatingGlassNav from '../components/FloatingGlassNav';
import { UserProvider } from '../context/UserContext';

export default function RootLayout() {
  const pathname = usePathname();
  const [loaded, error] = useFonts({
    Outfit_400Regular,
    Outfit_600SemiBold,
    Outfit_700Bold,
  });

  const [isAppReady, setIsAppReady] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Define routes where the navigation bar should be visible
  const showNav = [
    '/discovery', 
    '/explore', 
    '/likes', 
    '/messages', 
    '/boost',
    '/client-profile', 
    '/attorney-profile'
  ].includes(pathname);

  useEffect(() => {
    if (loaded || error) {
      // Hide native splash immediately once bundle is loaded
      SplashScreen.hideAsync();
      
      // Wait for 1.5s as requested
      const timer = setTimeout(() => {
        // Fade out animation
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
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <UserProvider>
        <ThemeProvider value={VerdictTheme}>
          <View style={{ flex: 1 }}>
            <Stack screenOptions={{ 
              contentStyle: { backgroundColor: '#FFFFFF' },
              headerShown: false
            }}>
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen name="discovery" options={{ headerShown: false }} />
              <Stack.Screen name="lawyer/[id]" options={{ presentation: 'modal', headerShown: false }} />
            </Stack>
            
            {/* Global Navigation - Only shown on main screens */}
            {showNav && <FloatingGlassNav />}
          </View>

          <StatusBar style="dark" />
          
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
      </UserProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  splashLogo: {
    width: '70%',
    height: 100,
  },
});
