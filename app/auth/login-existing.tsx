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
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { useUser } from '../../context/UserContext';
import { requestEmailOtp } from '../../lib/authApi';

export default function LoginExisting() {
  const router = useRouter();
  const { setRole } = useUser();
  
  const [selectedRole, setSelectedRole] = useState<'client' | 'attorney'>('client');
  const [email, setEmail] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');

  const onNext = async () => {
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsSending(true);
    setError('');
    try {
      setRole(selectedRole);
      await requestEmailOtp(email);
      router.push({
        pathname: '/auth/otp',
        params: {
          role: selectedRole,
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
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={{ flex: 1 }}>
            <View style={styles.header}>
              <TouchableOpacity onPress={() => router.back()}>
                <Ionicons name="arrow-back" size={28} color="#0F172A" />
              </TouchableOpacity>
            </View>

            <ScrollView 
              style={{ flex: 1 }} 
              contentContainerStyle={{ flexGrow: 1 }}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.content}>
                <Text style={styles.title}>Welcome back</Text>
                <Text style={styles.subtitle}>Log in to your existing account</Text>

                <Text style={styles.label}>I AM LOGGING IN AS</Text>
                <View style={styles.roleContainer}>
                  <TouchableOpacity 
                    style={[styles.roleBtn, selectedRole === 'client' && styles.roleBtnActive]} 
                    onPress={() => setSelectedRole('client')}
                  >
                    <Ionicons name="person" size={20} color={selectedRole === 'client' ? Colors.electricBlue : '#64748B'} />
                    <Text style={[styles.roleText, selectedRole === 'client' && styles.roleTextActive]}>Client</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={[styles.roleBtn, selectedRole === 'attorney' && styles.roleBtnActive]} 
                    onPress={() => setSelectedRole('attorney')}
                  >
                    <FontAwesome5 name="balance-scale" size={16} color={selectedRole === 'attorney' ? Colors.electricBlue : '#64748B'} />
                    <Text style={[styles.roleText, selectedRole === 'attorney' && styles.roleTextActive]}>Attorney</Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.label}>EMAIL ADDRESS</Text>
                <View style={[styles.inputBox, error ? styles.inputBoxError : null]}>
                  <TextInput
                    keyboardType="email-address"
                    autoCapitalize="none"
                    style={styles.input}
                    placeholder="Enter your email"
                    value={email}
                    onChangeText={(t) => {
                      setEmail(t);
                      setError('');
                    }}
                    editable={!isSending}
                  />
                </View>
                {error ? <Text style={styles.errorLabel}>{error}</Text> : null}
              </View>

              <View style={styles.footer}>
                 <TouchableOpacity
                   style={[styles.btnWrapper, isSending && { opacity: 0.75 }]}
                   onPress={onNext}
                   disabled={isSending}
                 >
                    <View style={styles.btn}>
                      {isSending ? (
                        <ActivityIndicator color="#fff" />
                      ) : (
                        <>
                          <Text style={styles.btnText}>Send Code</Text>
                          <Ionicons name="arrow-forward" size={20} color="white" />
                        </>
                      )}
                    </View>
                 </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { padding: 24, paddingTop: 16 },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 20 },
  title: { fontFamily: 'Outfit_700Bold', fontSize: 32, color: '#0F172A', marginBottom: 8 },
  subtitle: { fontFamily: 'Outfit_400Regular', fontSize: 16, color: '#64748B', marginBottom: 40 },
  label: { fontFamily: 'Outfit_700Bold', fontSize: 10, color: '#64748B', letterSpacing: 1, marginBottom: 12, textTransform: 'uppercase', marginTop: 10 },
  roleContainer: { flexDirection: 'row', gap: 12, marginBottom: 32 },
  roleBtn: { flex: 1, height: 60, borderRadius: 16, borderWidth: 2, borderColor: '#E2E8F0', backgroundColor: '#F8FAFC', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  roleBtnActive: { borderColor: Colors.electricBlue, backgroundColor: '#FFFFFF' },
  roleText: { fontFamily: 'Outfit_600SemiBold', fontSize: 16, color: '#64748B' },
  roleTextActive: { color: '#0F172A' },
  inputBox: { height: 68, backgroundColor: '#F8FAFC', borderRadius: 20, borderWidth: 2, borderColor: '#E2E8F0', justifyContent: 'center', overflow: 'hidden' },
  inputBoxError: { borderColor: '#EF4444', backgroundColor: '#FFF5F5' },
  input: { flex: 1, paddingHorizontal: 16, fontSize: 18, fontFamily: 'Outfit_400Regular', color: '#0F172A' },
  errorLabel: { marginTop: 8, color: '#EF4444', fontSize: 13, fontFamily: 'Outfit_400Regular', marginLeft: 4 },
  footer: { padding: 24, paddingBottom: 40 },
  btnWrapper: { borderRadius: 32, overflow: 'hidden', backgroundColor: Colors.navy },
  btn: { height: 64, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12 },
  btnText: { color: 'white', fontSize: 18, fontFamily: 'Outfit_700Bold' },
});
