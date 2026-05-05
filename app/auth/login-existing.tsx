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
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { useUser } from '../../context/UserContext';
import { requestEmailOtp } from '../../lib/authApi';
import PrivacyConsent from '../../components/PrivacyConsent';
import { LinearGradient } from 'expo-linear-gradient';

export default function LoginExisting() {
  const router = useRouter();
  const { userRole, setRole } = useUser();
  
  const [email, setEmail] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');
  const [showConsent, setShowConsent] = useState(false);

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
    setIsSending(true);
    setError('');
    try {
      // In a "simple" version, we'll use the existing role or default to client
      const roleToUse = userRole || 'client';
      await requestEmailOtp(email);
      router.push({
        pathname: '/auth/otp',
        params: {
          role: roleToUse,
          email: email,
          isLogin: 'true'
        }
      });
    } catch (e: any) {
      setError(e.message || 'Could not send verification email');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0F172A', '#020617']}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView 
          style={{ flex: 1 }} 
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={{ flex: 1 }}>
              <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                  <Ionicons name="arrow-back" size={24} color={Colors.white} />
                </TouchableOpacity>
              </View>

              <ScrollView 
                style={{ flex: 1 }} 
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.logoContainer}>
                   <Image 
                     source={require('../../assets/images/logo-full.jpg')} 
                     style={styles.logo} 
                     resizeMode="contain"
                   />
                   <Text style={styles.logoText}>Verdict</Text>
                </View>

                <Text style={styles.title}>Sign In To Your Account.</Text>
                <Text style={styles.subtitle}>Enter your email to receive a secure login code.</Text>

                <View style={styles.form}>
                  <Text style={styles.label}>Email Address</Text>
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

                  {error ? <Text style={styles.errorText}>{error}</Text> : null}

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
                         <Text style={styles.btnText}>Send Code</Text>
                       )}
                     </LinearGradient>
                  </TouchableOpacity>

                  <View style={styles.dividerRow}>
                    <View style={styles.line} />
                    <Text style={styles.orText}>Or</Text>
                    <View style={styles.line} />
                  </View>

                  <TouchableOpacity style={styles.socialBtn}>
                    <Ionicons name="logo-google" size={20} color="white" />
                    <Text style={styles.socialText}>Sign in with Google</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.socialBtn}>
                    <Ionicons name="logo-apple" size={20} color="white" />
                    <Text style={styles.socialText}>Continue with Apple</Text>
                  </TouchableOpacity>

                  <View style={styles.signUpRow}>
                    <Text style={styles.noAccountText}>Don't have an account?</Text>
                    <TouchableOpacity onPress={() => router.push('/auth/role')}>
                      <Text style={styles.signUpLink}>Sign up</Text>
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
  header: { paddingHorizontal: 24, paddingTop: 16 },
  backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center' },
  scrollContent: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 40 },
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
  errorText: { color: '#EF4444', fontFamily: 'Outfit_400Regular', fontSize: 12, marginTop: 8, marginLeft: 4 },
  getStartedBtn: { width: '100%', height: 56, borderRadius: 28, overflow: 'hidden', marginTop: 30 },
  gradientBtn: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  btnText: { fontFamily: 'Outfit_700Bold', fontSize: 16, color: Colors.deepBlue },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 30 },
  line: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.1)' },
  orText: { fontFamily: 'Outfit_400Regular', fontSize: 14, color: Colors.subtext },
  socialBtn: { height: 56, width: '100%', borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 12 },
  socialText: { fontFamily: 'Outfit_600SemiBold', fontSize: 15, color: Colors.white },
  signUpRow: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 20 },
  noAccountText: { fontFamily: 'Outfit_400Regular', fontSize: 14, color: Colors.subtext },
  signUpLink: { fontFamily: 'Outfit_700Bold', fontSize: 14, color: Colors.gold },
});
