import React, { useState, useEffect } from 'react';
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
import { 
  fetchVerificationStatus, 
  submitPhysicalVerificationRequest, 
  type VerificationUiStatus 
} from '../lib/servicesApi';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function LicenseVerification() {
  const router = useRouter();
  const [barId, setBarId] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [lawFirm, setLawFirm] = useState('');
  const [selectedState, setSelectedState] = useState<'CA' | 'TX'>('TX');
  
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState<VerificationUiStatus>('none');
  
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    try {
      setPageLoading(true);
      const user = await fetchCurrentUser();
      setCurrentUser(user);
      
      const statusData = await fetchVerificationStatus(user.id);
      
      // Check if official isVerified flag is true OR if request is approved
      if (user.lawyerProfile?.isVerified || statusData.status === 'approved') {
        setVerificationStatus('approved');
      } else {
        setVerificationStatus(statusData.status);
      }
    } catch (e) {
      console.error('Failed to load status:', e);
    } finally {
      setPageLoading(false);
    }
  };

  const handleSubmitRequest = async () => {
    if (!barId.trim() || !firstName.trim() || !lastName.trim() || !lawFirm.trim()) {
      Alert.alert('Missing Details', 'Please enter your Name, Last Name, Bar ID, and Law Firm to continue.');
      return;
    }

    if (!currentUser) return;

    setLoading(true);
    try {
      await submitPhysicalVerificationRequest({
        userId: currentUser.id,
        name: `${firstName} ${lastName}`,
        firstName,
        lastName,
        email: currentUser.email,
        barId: barId.trim(),
        state: selectedState,
        lawFirm: lawFirm.trim()
      });
      
      setVerificationStatus('pending');
      Alert.alert(
        'Request Submitted', 
        'Your verification request has been sent to the admin. We will manually verify your status with the state bar and update your profile.'
      );
    } catch (error: any) {
      console.error(error);
      Alert.alert('Submission Failed', error?.message || 'Could not send your request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={Colors.electricBlue} />
      </View>
    );
  }

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
        {/* Status Header */}
        <View style={styles.statusBox}>
          <View style={[
            styles.statusBadge, 
            verificationStatus === 'approved' && { backgroundColor: '#DCFCE7' },
            verificationStatus === 'pending' && { backgroundColor: '#FEF9C3' },
            verificationStatus === 'rejected' && { backgroundColor: '#FEE2E2' },
          ]}>
            <Ionicons 
              name={verificationStatus === 'approved' ? "shield-checkmark" : (verificationStatus === 'pending' ? "time" : "shield-outline")} 
              size={20} 
              color={verificationStatus === 'approved' ? "#10B981" : (verificationStatus === 'pending' ? "#CA8A04" : "#64748B")} 
            />
            <Text style={[
              styles.statusText,
              verificationStatus === 'approved' && { color: "#10B981" },
              verificationStatus === 'pending' && { color: "#CA8A04" },
            ]}>
              {verificationStatus === 'approved' ? 'Verified Attorney' : (verificationStatus === 'pending' ? 'Verification Pending' : 'Unverified Profile')}
            </Text>
          </View>
        </View>

        <View style={styles.header}>
          <Text style={styles.title}>Submit Credentials</Text>
          <Text style={styles.subtitle}>Enter your professional details. Our administrators will manually verify your license with the state bar registry.</Text>
        </View>

        {verificationStatus === 'none' || verificationStatus === 'rejected' ? (
          <View style={styles.formCard}>
            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 12 }]}>
                <Text style={styles.label}>FIRST NAME</Text>
                <View style={styles.inputWrapper}>
                  <TextInput 
                    style={styles.input}
                    value={firstName}
                    onChangeText={setFirstName}
                    placeholder="John"
                    editable={!loading}
                  />
                </View>
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>LAST NAME</Text>
                <View style={styles.inputWrapper}>
                  <TextInput 
                    style={styles.input}
                    value={lastName}
                    onChangeText={setLastName}
                    placeholder="Doe"
                    editable={!loading}
                  />
                </View>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>LAW FIRM NAME</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="business" size={18} color={Colors.electricBlue} style={styles.inputIcon} />
                <TextInput 
                  style={styles.input}
                  value={lawFirm}
                  onChangeText={setLawFirm}
                  placeholder="e.g. Smith & Associates"
                  editable={!loading}
                />
              </View>
            </View>

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
              onPress={handleSubmitRequest}
              disabled={loading}
            >
              {loading ? (
                <View style={styles.loaderRow}>
                  <ActivityIndicator color="#FFFFFF" />
                  <Text style={styles.submitButtonText}>Sending Request...</Text>
                </View>
              ) : (
                <Text style={styles.submitButtonText}>Submit for Verification</Text>
              )}
            </TouchableOpacity>

            <View style={styles.hintBox}>
              <Ionicons name="shield-checkmark" size={16} color="#64748B" />
              <Text style={styles.hintText}>Your data is securely sent to our administrators for manual validation.</Text>
            </View>
          </View>
        ) : verificationStatus === 'pending' ? (
          <View style={styles.pendingCard}>
            <View style={styles.pendingIconCircle}>
              <Ionicons name="time" size={48} color="#CA8A04" />
            </View>
            <Text style={styles.successTitle}>Review in Progress</Text>
            <Text style={styles.successSubtitle}>
              Our administrators are currently verifying your credentials. You will receive a notification and your badge once the review is complete.
            </Text>
            <TouchableOpacity 
              style={styles.doneButton} 
              onPress={() => router.replace('/attorney-profile')}
            >
              <Text style={styles.doneButtonText}>Return to Profile</Text>
            </TouchableOpacity>
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
              Congratulations! Your professional license has been verified. You now have a Verified Badge on your profile.
            </Text>
            <TouchableOpacity 
              style={styles.doneButton} 
              onPress={() => router.replace('/attorney-profile')}
            >
              <Text style={styles.doneButtonText}>Go to My Profile</Text>
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
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 24,
  },
  statusBox: {
    marginBottom: 20,
    alignItems: 'flex-start',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 8,
  },
  statusText: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 13,
    color: '#64748B',
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
  row: {
    flexDirection: 'row',
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
  pendingCard: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#FFFBEB',
    borderRadius: 32,
    borderWidth: 1,
    borderColor: '#FEF3C7',
  },
  successIconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  pendingIconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#FEF9C3',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  successTitle: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 26,
    color: Colors.navy,
    marginBottom: 12,
  },
  successSubtitle: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  doneButton: {
    backgroundColor: Colors.navy,
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
