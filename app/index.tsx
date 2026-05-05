import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  TextInput, 
  KeyboardAvoidingView, 
  Platform, 
  TouchableWithoutFeedback, 
  Keyboard,
  ActivityIndicator,
  ScrollView,
  Image,
  Dimensions,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { useUser } from '../context/UserContext';
import { requestEmailOtp } from '../lib/authApi';
import PrivacyConsent from '../components/PrivacyConsent';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function LoginScreen() {
  const router = useRouter();
  const { userRole, setRole } = useUser();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');
  const [showConsent, setShowConsent] = useState(false);

  // Default role to client if not set
  const currentRole = userRole || 'client';

  const onNext = async () => {
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    setShowConsent(true);
  };

  const handleAgree = async () => {
    setShowConsent(false);
    await startAuth();
  };

  const startAuth = async () => {
    const cleanEmail = email.trim().toLowerCase();

    setIsSending(true);
    setError('');
    try {
      await requestEmailOtp(cleanEmail);
      router.push({
        pathname: '/auth/otp',
        params: {
          role: currentRole,
          email: cleanEmail,
          isLogin: 'true'
        }
      });

    } catch (e: any) {
      setError(e.message || 'Could not send verification email');
    } finally {
      setIsSending(false);
    }
  };

  const toggleRole = () => {
    const nextRole = currentRole === 'client' ? 'attorney' : 'client';
    setRole(nextRole);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Base Dark Background */}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: '#020617' }]} />
      
      {/* Top Right Intense Gold Glow */}
      <LinearGradient
        colors={['rgba(212, 175, 55, 0.35)', 'rgba(212, 175, 55, 0.15)', 'rgba(212, 175, 55, 0.05)', 'transparent']}
        start={{ x: 1, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFill}
      />


      <SafeAreaView style={{ flex: 1 }}>
        {/* Top Left Role Toggle */}
        <View style={styles.topHeader}>
          <TouchableOpacity 
            style={styles.toggleContainer} 
            onPress={toggleRole}
            activeOpacity={0.8}
          >
            <View style={[styles.toggleBg, currentRole === 'attorney' && styles.toggleBgRight]}>
               <LinearGradient
                 colors={Colors.goldGradient}
                 style={StyleSheet.absoluteFill}
               />
            </View>
            <View style={styles.toggleOption}>
              <Text style={[styles.toggleText, currentRole === 'client' && styles.toggleTextActive]}>Client</Text>
            </View>
            <View style={styles.toggleOption}>
              <Text style={[styles.toggleText, currentRole === 'attorney' && styles.toggleTextActive]}>Attorney</Text>
            </View>
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView 
          style={{ flex: 1 }} 
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={{ flex: 1 }}>
              <ScrollView 
                style={{ flex: 1 }} 
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.logoContainer}>
                   <Image 
                     source={require('../assets/images/logo-full.jpg')} 
                     style={styles.logo} 
                     resizeMode="contain"
                   />
                   <Text style={styles.logoText}>Verdict</Text>
                </View>

                <Text style={styles.title}>Sign In To Your Account.</Text>
                <Text style={styles.subtitle}>
                  {currentRole === 'attorney' ? 'Access your professional account.' : 'Access your account to find an attorney.'}
                </Text>

                <View style={styles.form}>
                  <Text style={styles.label}>Email</Text>
                  <View style={[styles.inputBox, error && styles.inputBoxError]}>
                    <TextInput
                      keyboardType="email-address"
                      autoCapitalize="none"
                      style={styles.input}
                      placeholder="almalawson@example.com"
                      placeholderTextColor="rgba(255,255,255,0.2)"
                      value={email}
                      onChangeText={(t) => {
                        setEmail(t);
                        setError('');
                      }}
                    />
                  </View>

                  <Text style={[styles.label, { marginTop: 20 }]}>Password</Text>
                  <View style={styles.inputBox}>
                    <TextInput
                      secureTextEntry={!showPassword}
                      style={styles.input}
                      placeholder="••••••••"
                      placeholderTextColor="rgba(255,255,255,0.2)"
                      value={password}
                      onChangeText={setPassword}
                    />
                    <TouchableOpacity 
                      onPress={() => setShowPassword(!showPassword)}
                      style={styles.eyeBtn}
                    >
                      <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color="rgba(255,255,255,0.4)" />
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity
                     style={styles.getStartedBtn}
                     onPress={onNext}
                     disabled={isSending}
                   >
                     <LinearGradient
                       colors={Colors.goldGradient}
                       start={{ x: 0, y: 0 }}
                       end={{ x: 1, y: 0 }}
                       style={styles.gradientBtn}
                     >
                       {isSending ? (
                         <ActivityIndicator color={Colors.deepBlue} />
                       ) : (
                         <Text style={styles.btnText}>Get Started</Text>
                       )}
                     </LinearGradient>
                  </TouchableOpacity>

                  <View style={styles.optionsRow}>
                    <View style={styles.rememberMe}>
                      <View style={styles.checkbox} />
                      <Text style={styles.rememberText}>Remember me</Text>
                    </View>
                    <TouchableOpacity>
                      <Text style={styles.forgotText}>Forgot password?</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.signUpRow}>
                    <Text style={styles.noAccountText}>Don't have an account?</Text>
                    <TouchableOpacity onPress={() => router.push({ pathname: '/auth/login', params: { role: currentRole } })}>
                      <Text style={styles.signUpLink}> Create Account</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </SafeAreaView>

      <PrivacyConsent 
        visible={showConsent} 
        onAgree={handleAgree} 
        onDecline={() => setShowConsent(false)} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617' },
  topHeader: {
    paddingHorizontal: 24,
    paddingTop: 10,
    zIndex: 100,
  },
  toggleContainer: {
    width: 180,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20,
    flexDirection: 'row',
    padding: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  toggleBg: {
    position: 'absolute',
    width: '50%',
    height: '100%',
    borderRadius: 18,
    top: 3,
    left: 4,
    overflow: 'hidden',
  },
  toggleBgRight: {
    left: '50%',
  },
  toggleOption: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleText: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 14,
    color: 'rgba(255,255,255,0.4)',
  },
  toggleTextActive: {
    color: Colors.deepBlue,
  },

  scrollContent: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 40, paddingTop: 40 },
  logoContainer: { alignItems: 'center', marginTop: 20, marginBottom: 30 },
  logo: { width: 48, height: 48, tintColor: Colors.gold },
  logoText: { fontFamily: 'Outfit_700Bold', fontSize: 24, color: Colors.white, marginTop: 10 },
  title: { fontFamily: 'Outfit_700Bold', fontSize: 28, color: Colors.white, textAlign: 'center' },
  subtitle: { fontFamily: 'Outfit_400Regular', fontSize: 14, color: Colors.subtext, textAlign: 'center', marginTop: 10, marginBottom: 40 },
  form: { width: '100%' },
  label: { fontFamily: 'Outfit_600SemiBold', fontSize: 14, color: Colors.white, marginBottom: 10 },
  inputBox: { height: 56, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 },
  inputBoxError: { borderColor: '#EF4444' },
  input: { flex: 1, fontSize: 16, fontFamily: 'Outfit_400Regular', color: Colors.white },
  eyeBtn: { padding: 8 },
  getStartedBtn: { width: '100%', height: 56, borderRadius: 28, overflow: 'hidden', marginTop: 30 },
  gradientBtn: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  btnText: { fontFamily: 'Outfit_700Bold', fontSize: 16, color: Colors.deepBlue },
  optionsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20 },
  rememberMe: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  checkbox: { width: 20, height: 20, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  rememberText: { fontFamily: 'Outfit_400Regular', fontSize: 14, color: Colors.subtext },
  forgotText: { fontFamily: 'Outfit_600SemiBold', fontSize: 14, color: Colors.gold },
  signUpRow: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 40 },
  noAccountText: { fontFamily: 'Outfit_400Regular', fontSize: 15, color: Colors.subtext },
  signUpLink: { fontFamily: 'Outfit_700Bold', fontSize: 15, color: Colors.gold },
});
