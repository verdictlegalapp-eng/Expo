import React, { useState, useRef } from 'react';
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
  Alert,
  ActivityIndicator,
  ScrollView,
  Dimensions,
  StatusBar,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { verifyEmailOtp, requestEmailOtp } from '../../lib/authApi';
import { Colors } from '../../constants/Colors';

const { width } = Dimensions.get('window');

function sp(v: string | string[] | undefined): string {
  if (Array.isArray(v)) return v[0] ?? '';
  return typeof v === 'string' ? v : '';
}

export default function OTP() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const email = sp(params.email);
  const roleParam = sp(params.role);

  const [code, setCode] = useState(['', '', '', '', '', '']);
  const inputs = useRef<Array<TextInput | null>>([]);
  const [busy, setBusy] = useState(false);
  const [resending, setResending] = useState(false);

  const handleTextChange = (text: string, index: number) => {
    // Handle multi-character input (like pasting)
    if (text.length > 1) {
      const pasteData = text.replace(/\D/g, '').slice(0, 6).split('');
      const newCode = [...code];
      pasteData.forEach((char, i) => {
        if (index + i < 6) newCode[index + i] = char;
      });
      setCode(newCode);
      const nextIndex = Math.min(index + pasteData.length, 5);
      inputs.current[nextIndex]?.focus();
      return;
    }

    const newCode = [...code];
    newCode[index] = text.replace(/\D/g, '').slice(0, 1);
    setCode(newCode);

    if (text.length === 1 && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };


  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && code[index] === '' && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const isComplete = code.every((digit) => digit.length === 1);

  const buildProfile = () => ({
    name: sp(params.name),
    email: sp(params.email),
    phone: sp(params.phone),
    role: roleParam || 'client',
    state: sp(params.state) || undefined,
    city: sp(params.city) || undefined,
    specialization: sp(params.specialization) || undefined,
    barId: sp(params.barId) || undefined,
    legalNeed: sp(params.legalNeed) || undefined,
  });

  const handleVerify = async () => {
    if (!isComplete) return;
    setBusy(true);
    try {
      if (!email) throw new Error('Email is missing. Go back and re-enter.');
      
      const codeStr = code.join('').trim();
      if (codeStr.length !== 6) throw new Error('Please enter all 6 digits');

      console.log(`[OTP] Verifying for ${email} with code ${codeStr}`);
      await verifyEmailOtp(email, codeStr, buildProfile());

      
      if (params.isLogin === 'true') {
        if (roleParam === 'attorney') {
          router.replace('/attorney-profile');
        } else {
          router.replace('/discovery');
        }
      } else {
        router.push({
          pathname: '/auth/profile-pic',
          params: { role: roleParam || 'client' },
        });
      }
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Verification failed';
      Alert.alert('Could not verify', message);
    } finally {
      setBusy(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      Alert.alert('Missing email', 'Go back to re-enter your email.');
      return;
    }
    setResending(true);
    try {
      await requestEmailOtp(email);
      Alert.alert('Code sent', 'Check your email for a new code.');
      setCode(['', '', '', '', '', '']);
      inputs.current[0]?.focus();
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Could not resend';
      Alert.alert('Resend failed', message);
    } finally {
      setResending(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <View style={[StyleSheet.absoluteFill, { backgroundColor: '#020617' }]} />
      
      <LinearGradient
        colors={['rgba(212, 175, 55, 0.35)', 'rgba(212, 175, 55, 0.15)', 'rgba(212, 175, 55, 0.05)', 'transparent']}
        start={{ x: 1, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFill}
      />


      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={Colors.white} />
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <ScrollView 
              style={{ flex: 1 }} 
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.title}>Verify Email</Text>
              <Text style={styles.subtitle}>
                We sent a 6-digit code to{'\n'}
                <Text style={styles.emailText}>{email}</Text>
              </Text>

              <View style={styles.otpContainer}>
                {code.map((digit, index) => (
                  <View key={index} style={[styles.otpInputWrapper, digit.length > 0 && styles.otpInputActive]}>
                    <TextInput
                      ref={(ref) => {
                        inputs.current[index] = ref;
                      }}
                      style={styles.otpInput}
                      keyboardType="number-pad"
                      maxLength={1}
                      value={digit}
                      onChangeText={(text) => handleTextChange(text, index)}
                      onKeyPress={(e) => handleKeyPress(e, index)}
                      editable={!busy}
                      autoFocus={index === 0}
                      placeholderTextColor="rgba(255,255,255,0.1)"
                      placeholder="0"
                    />
                  </View>
                ))}
              </View>

              <TouchableOpacity
                style={[styles.verifyBtn, !isComplete && { opacity: 0.5 }]}
                onPress={handleVerify}
                disabled={!isComplete || busy}
              >
                <LinearGradient
                  colors={Colors.goldGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.gradientBtn}
                >
                  {busy ? (
                    <ActivityIndicator color={Colors.deepBlue} />
                  ) : (
                    <Text style={styles.btnText}>Verify & Continue</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.resendBtn}
                onPress={handleResend}
                disabled={resending || busy}
              >
                <Text style={styles.resendText}>
                  {resending ? 'Sending Code...' : "Didn't receive code? Resend"}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617' },
  header: { paddingHorizontal: 24, paddingTop: 16 },
  backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center' },

  scrollContent: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 40, paddingTop: 40, alignItems: 'center' },
  title: { fontFamily: 'Outfit_700Bold', fontSize: 32, color: Colors.white, textAlign: 'center' },
  subtitle: { fontFamily: 'Outfit_400Regular', fontSize: 16, color: Colors.subtext, textAlign: 'center', marginTop: 12, lineHeight: 24, marginBottom: 40 },
  emailText: { fontFamily: 'Outfit_600SemiBold', color: Colors.gold },
  otpContainer: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 40 },
  otpInputWrapper: {
    width: (width - 48 - 50) / 6,
    height: 64,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  otpInputActive: {
    borderColor: Colors.gold,
    backgroundColor: 'rgba(212, 175, 55, 0.05)',
  },
  otpInput: {
    width: '100%',
    height: '100%',
    textAlign: 'center',
    fontSize: 28,
    fontFamily: 'Outfit_700Bold',
    color: Colors.white,
  },
  verifyBtn: { width: '100%', height: 56, borderRadius: 28, overflow: 'hidden', marginTop: 20 },
  gradientBtn: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  btnText: { fontFamily: 'Outfit_700Bold', fontSize: 16, color: Colors.deepBlue },
  resendBtn: { marginTop: 30, padding: 10 },
  resendText: { fontFamily: 'Outfit_600SemiBold', fontSize: 14, color: Colors.gold, textAlign: 'center' },
});
