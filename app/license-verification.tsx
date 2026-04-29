import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  ActivityIndicator,
  Alert,
  Dimensions
} from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';
import { Colors } from '../constants/Colors';
import { LinearGradient } from 'expo-linear-gradient';
import { fetchCurrentUser } from '../lib/authApi';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

export default function LicenseVerification() {
  const router = useRouter();
  const [barId, setBarId] = useState('');
  const [selectedState, setSelectedState] = useState<'CA' | 'TX'>('TX');
  const [status, setStatus] = useState<'unverified' | 'verifying' | 'success' | 'failed'>('unverified');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Input, 2: Verifying, 3: Success

  const handleVerify = async () => {
    if (!barId.trim()) {
      Alert.alert('Missing Bar ID', 'Please enter your state bar number to continue.');
      return;
    }

    setLoading(true);
    setStatus('verifying');
    setStep(2);

    try {
      // Simulate real-time progress for better UX
      const response = await fetch(`${API_URL}/api/lawyers/verify-license`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state: selectedState, barNumber: barId.trim() })
      });
      
      const result = await response.json();
      
      if (response.ok && result.data && result.data.verified) {
        setStatus('success');
        setStep(3);
      } else {
        setStatus('failed');
        setStep(1);
        Alert.alert('Verification Failed', result.message || 'We could not find a match for this Bar ID in the state registry.');
      }
    } catch (error) {
      console.error(error);
      setStatus('failed');
      setStep(1);
      Alert.alert('Connection Error', 'Could not reach the verification server. Please check your internet.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ 
        title: 'License Verification',
        headerShown: true,
        headerLeft: () => (
          <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 10 }}>
            <Ionicons name="arrow-back" size={24} color={Colors.navy} />
          </TouchableOpacity>
        ),
        headerTitleStyle: { fontFamily: 'Outfit_700Bold', fontSize: 20 },
        headerShadowVisible: false,
      }} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBarBackground}>
            <View style={[styles.progressBarFill, { width: `${(step / 3) * 100}%` }]} />
          </View>
          <View style={styles.stepLabels}>
            <Text style={[styles.stepLabel, step >= 1 && styles.activeStepLabel]}>Details</Text>
            <Text style={[styles.stepLabel, step >= 2 && styles.activeStepLabel]}>Checking</Text>
            <Text style={[styles.stepLabel, step >= 3 && styles.activeStepLabel]}>Verified</Text>
          </View>
        </View>

        <View style={styles.header}>
          <Text style={styles.title}>Official Verification</Text>
          <Text style={styles.subtitle}>Enter your State Bar number. We will instantly verify your credentials with the Texas Bar registry.</Text>
        </View>

        {step < 3 ? (
          <View style={styles.formCard}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>STATE BAR NUMBER</Text>
              <View style={styles.inputWrapper}>
                <FontAwesome5 name="id-card" size={18} color={Colors.electricBlue} style={styles.inputIcon} />
                <TextInput 
                  style={styles.input}
                  value={barId}
                  onChangeText={setBarId}
                  placeholder="e.g. 240XXXXX"
                  keyboardType="numeric"
                  editable={!loading}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>ISSUING STATE</Text>
              <View style={styles.stateToggleContainer}>
                <TouchableOpacity 
                  style={[styles.stateToggleBtn, selectedState === 'TX' && styles.stateToggleActive]}
                  onPress={() => setSelectedState('TX')}
                  disabled={loading}
                >
                  <Text style={[styles.stateToggleText, selectedState === 'TX' && styles.stateToggleTextActive]}>Texas</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.stateToggleBtn, selectedState === 'CA' && styles.stateToggleActive]}
                  onPress={() => setSelectedState('CA')}
                  disabled={loading}
                >
                  <Text style={[styles.stateToggleText, selectedState === 'CA' && styles.stateToggleTextActive]}>California</Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity 
              style={[styles.submitButton, loading && { opacity: 0.7 }]} 
              onPress={handleVerify}
              disabled={loading}
            >
              {loading ? (
                <View style={styles.loaderRow}>
                  <ActivityIndicator color="#FFFFFF" />
                  <Text style={styles.submitButtonText}>Searching Registry...</Text>
                </View>
              ) : (
                <Text style={styles.submitButtonText}>Verify License Now</Text>
              )}
            </TouchableOpacity>

            <View style={styles.hintBox}>
              <Ionicons name="information-circle" size={16} color="#64748B" />
              <Text style={styles.hintText}>No documents required. We use live scraping to confirm your status instantly.</Text>
            </View>
          </View>
        ) : (
          <View style={styles.successCard}>
            <LinearGradient
              colors={['#10B981', '#059669']}
              style={styles.successIconCircle}
            >
              <Ionicons name="checkmark-sharp" size={48} color="white" />
            </LinearGradient>
            <Text style={styles.successTitle}>Identity Verified!</Text>
            <Text style={styles.successSubtitle}>
              We found your license in the {selectedState === 'TX' ? 'Texas' : 'California'} Bar registry. Your profile now displays the Verified Badge.
            </Text>
            <TouchableOpacity 
              style={styles.doneButton} 
              onPress={() => router.replace('/attorney-profile')}
            >
              <Text style={styles.doneButtonText}>Return to Profile</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    padding: 24,
  },
  progressContainer: {
    marginBottom: 40,
  },
  progressBarBackground: {
    height: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.electricBlue,
  },
  stepLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stepLabel: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 12,
    color: '#94A3B8',
  },
  activeStepLabel: {
    color: Colors.electricBlue,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 28,
    color: Colors.navy,
    marginBottom: 12,
  },
  subtitle: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 16,
    color: '#64748B',
    lineHeight: 24,
  },
  formCard: {
    backgroundColor: '#F8FAFC',
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 11,
    color: '#64748B',
    letterSpacing: 1,
    marginBottom: 12,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 56,
    fontFamily: 'Outfit_400Regular',
    fontSize: 18,
    color: Colors.navy,
  },
  stateToggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    borderRadius: 16,
    padding: 4,
  },
  stateToggleBtn: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 12,
  },
  stateToggleActive: {
    backgroundColor: '#FFFFFF',
  },
  stateToggleText: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 14,
    color: '#64748B',
  },
  stateToggleTextActive: {
    color: Colors.electricBlue,
  },
  submitButton: {
    backgroundColor: Colors.navy,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    shadowColor: Colors.navy,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 5,
  },
  loaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  submitButtonText: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 16,
    color: '#FFFFFF',
  },
  hintBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 24,
    paddingHorizontal: 8,
  },
  hintText: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 12,
    color: '#64748B',
    flex: 1,
  },
  successCard: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#F0FDF4',
    borderRadius: 32,
    borderWidth: 1,
    borderColor: '#DCFCE7',
  },
  successIconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  successTitle: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 26,
    color: '#065F46',
    marginBottom: 12,
  },
  successSubtitle: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 16,
    color: '#047857',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  doneButton: {
    backgroundColor: '#065F46',
    paddingHorizontal: 32,
    paddingVertical: 18,
    borderRadius: 30,
  },
  doneButtonText: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 16,
    color: '#FFFFFF',
  },
});
