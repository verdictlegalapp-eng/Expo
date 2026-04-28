import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
  Image,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

import { Colors } from '../constants/Colors';
import { useUser } from '../context/UserContext';

export default function LandingPage() {
  const router = useRouter();
  const { setRole } = useUser();

  const handleNavigation = (role: 'client' | 'attorney') => {
    setRole(role);
    router.push({ pathname: '/auth/login', params: { role } });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.content}>
        {/* Logo Section */}
        <View style={styles.logoContainer}>
          <Image 
            source={require('../assets/images/logo-full.jpg')} 
            style={styles.logo} 
            resizeMode="contain"
          />
        </View>

        {/* Action Buttons Section */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.button}
            onPress={() => handleNavigation('client')}
            activeOpacity={0.8}
          >
            <Ionicons name="search" size={20} color="white" style={styles.buttonIcon} />
            <Text style={styles.buttonText}>Find an Attorney</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.button}
            onPress={() => handleNavigation('attorney')}
            activeOpacity={0.8}
          >
            <FontAwesome5 name="balance-scale" size={18} color="white" style={styles.buttonIcon} />
            <Text style={styles.buttonText}>I am an Attorney</Text>
          </TouchableOpacity>

          <View style={styles.loginLinkContainer}>
            <Text style={styles.loginLabel}>Already have an account?</Text>
            <TouchableOpacity onPress={() => router.push('/auth/login-existing')}>
              <Text style={styles.loginLinkText}> Log in</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer section (Terms and Policy) */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By continuing, you agree to our{' '}
            <Text style={styles.linkText}>Terms of Service</Text> and{' '}
            <Text style={styles.linkText}>Privacy Policy</Text>.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    paddingVertical: 60,
  },
  logoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: width * 0.7,
    height: 120,
  },
  buttonContainer: {
    width: '100%',
    gap: 16,
    marginBottom: 40,
  },
  button: {
    width: '100%',
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.navy,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonIcon: {
    marginRight: 10,
  },
  buttonText: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 18,
    color: 'white',
    letterSpacing: 0.5,
  },
  loginLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  loginLabel: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 16,
    color: '#64748B',
  },
  loginLinkText: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 16,
    color: Colors.navy,
  },
  footer: {
    paddingHorizontal: 20,
  },
  footerText: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
  },
  linkText: {
    fontFamily: 'Outfit_600SemiBold',
    color: '#0F172A',
    textDecorationLine: 'underline',
  },
});
