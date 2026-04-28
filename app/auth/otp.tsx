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
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { verifyEmailOtp, requestEmailOtp } from '../../lib/authApi';


function sp(v: string | string[] | undefined): string {
  if (Array.isArray(v)) return v[0] ?? '';
  return typeof v === 'string' ? v : '';
}

export default function OTP() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const phoneDisplay = sp(params.phone);
  const countryCode = sp(params.countryCode) || '+91';
  const roleParam = sp(params.role);

  const [code, setCode] = useState(['', '', '', '', '', '']);
  const inputs = useRef<Array<TextInput | null>>([]);
  const [busy, setBusy] = useState(false);
  const [resending, setResending] = useState(false);


  const handleTextChange = (text: string, index: number) => {
    const newCode = [...code];
    newCode[index] = text.replace(/\D/g, '').slice(0, 1);
    setCode(newCode);

    if (text.length >= 1 && index < 5) {
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
  });

  const handleVerify = async () => {
    if (!isComplete) return;
    setBusy(true);
    try {
      const email = sp(params.email);
      if (!email) throw new Error('Email is missing. Go back and re-enter.');
      
      const codeStr = code.join('');
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
    const email = sp(params.email);
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
    <SafeAreaView style={styles.container}>
      <View style={styles.progressBarContainer}>
        <LinearGradient
          colors={['#3B82F6', '#273951']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.progressBar, { width: '66%' }]}
        />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView 
            style={{ flex: 1 }} 
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.inner}>
              <View>
                <View style={styles.header}>
                  <TouchableOpacity
                    onPress={() => router.back()}
                    hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                  >
                    <Ionicons name="arrow-back" size={28} color="#0F172A" />
                  </TouchableOpacity>
                  <Text style={styles.stepIndicator}>Step 2 of 3</Text>
                </View>

                <View style={styles.content}>
                  <Text style={styles.title}>Verify email</Text>
                  <Text style={styles.subtitle}>
                    We sent a 6-digit code to{' '}
                    <Text style={styles.boldPhone}>{sp(params.email) || 'your email'}</Text>.
                  </Text>


                  <View style={styles.otpContainer}>
                    {code.map((digit, index) => (
                      <TextInput
                        key={index}
                        ref={(ref) => {
                          inputs.current[index] = ref;
                        }}
                        style={[styles.otpInput, digit.length > 0 && styles.otpInputActive]}
                        keyboardType="number-pad"
                        maxLength={1}
                        value={digit}
                        onChangeText={(text) => handleTextChange(text, index)}
                        onKeyPress={(e) => handleKeyPress(e, index)}
                        editable={!busy}
                        autoFocus={index === 0}
                      />
                    ))}
                  </View>

                  <TouchableOpacity
                    style={styles.resendButton}
                    onPress={() => void handleResend()}
                    disabled={resending || busy}
                  >
                    <Text style={styles.resendText}>
                      {resending ? 'Sending…' : "I didn't receive a code"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.footer}>
                <TouchableOpacity
                  style={[styles.button, (!isComplete || busy) && styles.buttonDisabled]}
                  onPress={() => void handleVerify()}
                  disabled={!isComplete || busy}
                >
                  {busy ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.buttonText}>Verify & Continue</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

    </SafeAreaView>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: '#F1F5F9',
    width: '100%',
  },
  progressBar: {
    height: '100%',
  },
  inner: {
    flex: 1,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  stepIndicator: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 12,
    color: '#94A3B8',
  },
  content: {
    padding: 24,
    flex: 1,
  },
  title: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 32,
    color: '#0F172A',
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 16,
    color: '#475569',
    marginBottom: 40,
    lineHeight: 24,
  },
  boldPhone: {
    fontFamily: 'Outfit_600SemiBold',
    color: '#273951',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  otpInput: {
    width: 48,
    height: 56,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    textAlign: 'center',
    fontFamily: 'Outfit_700Bold',
    fontSize: 24,
    color: '#0F172A',
  },
  otpInputActive: {
    borderColor: '#273951',
    borderWidth: 2,
  },
  resendButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  resendText: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 14,
    color: '#273951',
  },
  footer: {
    padding: 24,
  },
  button: {
    backgroundColor: '#273951',
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#273951',
    minHeight: 56,
    justifyContent: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#CBD5E1',
    borderColor: '#CBD5E1',
  },
  buttonText: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 18,
    color: '#FFFFFF',
  },
});
