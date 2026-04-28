import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';
import { Colors } from '../constants/Colors';
import { LinearGradient } from 'expo-linear-gradient';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

export default function LicenseVerification() {
  const router = useRouter();
  const [barId, setBarId] = React.useState('');
  const [selectedState, setSelectedState] = React.useState<'CA' | 'TX'>('CA');
  const [status, setStatus] = React.useState<'verified' | 'pending' | 'unverified' | 'failed'>('unverified');
  const [isLoading, setIsLoading] = React.useState(false);
  const [lawyerName, setLawyerName] = React.useState('');

  const handleVerify = async () => {
    if (!barId.trim()) {
      Alert.alert('Error', 'Please enter your Bar ID');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/lawyers/verify-license`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state: selectedState, barNumber: barId.trim() })
      });
      
      const result = await response.json();
      
      if (response.ok && result.data && result.data.verified) {
        setStatus('verified');
        if (result.data.details && result.data.details.name) {
          setLawyerName(result.data.details.name);
        }
      } else {
        setStatus('failed');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Verification Failed', 'Could not reach the verification server. Please try again later.');
      setStatus('failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={styles.title}>License Verification</Text>
            <Text style={styles.subtitle}>Verify your professional credentials to build trust with clients.</Text>
          </View>

          <View style={styles.statusCard}>
            <LinearGradient
              colors={status === 'verified' ? ['#10B981', '#059669'] : ['#6366F1', '#4F46E5']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.statusGradient}
            >
              <View style={styles.statusHeader}>
                <View style={[styles.statusBadge, status === 'failed' && { backgroundColor: 'rgba(239, 68, 68, 0.2)' }]}>
                  <Ionicons 
                    name={status === 'verified' ? "checkmark-circle" : (status === 'failed' ? "close-circle" : "time")} 
                    size={24} 
                    color="#FFFFFF" 
                  />
                  <Text style={styles.statusBadgeText}>
                    {status === 'verified' ? 'VERIFIED' : (status === 'failed' ? 'VERIFICATION FAILED' : 'UNVERIFIED')}
                  </Text>
                </View>
                <MaterialCommunityIcons name="shield-check" size={40} color="rgba(255,255,255,0.3)" />
              </View>
              
              <Text style={styles.statusMessage}>
                {status === 'verified' 
                  ? `Your profile is verified. Match found: ${lawyerName || 'Eligible Attorney'}` 
                  : (status === 'failed' 
                      ? 'We could not verify your bar number with the state registry. Please check your Bar ID.'
                      : 'Please enter your Bar ID and select your state to verify your credentials.')}
              </Text>
            </LinearGradient>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Bar Association Details</Text>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>State Bar ID</Text>
              <View style={styles.inputWrapper}>
                <FontAwesome5 name="id-card" size={18} color={Colors.electricBlue} style={styles.inputIcon} />
                <TextInput 
                  style={styles.input}
                  value={barId}
                  onChangeText={setBarId}
                  placeholder="Enter your Bar ID"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Issuing State</Text>
              <View style={styles.stateToggleContainer}>
                <TouchableOpacity 
                  style={[styles.stateToggleBtn, selectedState === 'CA' && styles.stateToggleActive]}
                  onPress={() => setSelectedState('CA')}
                >
                  <Text style={[styles.stateToggleText, selectedState === 'CA' && styles.stateToggleTextActive]}>California</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.stateToggleBtn, selectedState === 'TX' && styles.stateToggleActive]}
                  onPress={() => setSelectedState('TX')}
                >
                  <Text style={[styles.stateToggleText, selectedState === 'TX' && styles.stateToggleTextActive]}>Texas</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Documents</Text>
            
            <TouchableOpacity style={styles.uploadCard}>
              <View style={styles.uploadIconCircle}>
                <Ionicons name="cloud-upload" size={28} color={Colors.electricBlue} />
              </View>
              <View style={styles.uploadInfo}>
                <Text style={styles.uploadTitle}>Certificate of Good Standing</Text>
                <Text style={styles.uploadSubtitle}>Upload a PDF or Image (Max 5MB)</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.border} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.uploadCard}>
              <View style={[styles.uploadIconCircle, { backgroundColor: '#F0FDF4' }]}>
                <Ionicons name="document-text" size={28} color="#10B981" />
              </View>
              <View style={styles.uploadInfo}>
                <Text style={styles.uploadTitle}>bar_certificate_final.pdf</Text>
                <Text style={[styles.uploadSubtitle, { color: '#10B981' }]}>Uploaded on May 12, 2024</Text>
              </View>
              <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={styles.submitButton} 
            onPress={handleVerify}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitButtonText}>Verify License</Text>
            )}
          </TouchableOpacity>

          <View style={{ height: 100 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    padding: 24,
    paddingBottom: 16,
  },
  title: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 28,
    color: Colors.text,
  },
  subtitle: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 15,
    color: Colors.subtext,
    marginTop: 8,
    lineHeight: 22,
  },
  statusCard: {
    marginHorizontal: 24,
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 32,
    elevation: 8,
    shadowColor: Colors.navy,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
  },
  statusGradient: {
    padding: 24,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 8,
  },
  statusBadgeText: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 12,
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  statusMessage: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 15,
    color: '#FFFFFF',
    lineHeight: 22,
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionTitle: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 18,
    color: Colors.text,
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 14,
    color: Colors.subtext,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.slate,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 56,
    fontFamily: 'Outfit_400Regular',
    fontSize: 16,
    color: Colors.text,
  },
  stateToggleContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.slate,
    borderRadius: 16,
    padding: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  stateToggleBtn: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 12,
  },
  stateToggleActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  stateToggleText: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 14,
    color: Colors.subtext,
  },
  stateToggleTextActive: {
    color: Colors.electricBlue,
  },
  uploadCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.slate,
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  uploadIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#F0F9FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  uploadInfo: {
    flex: 1,
  },
  uploadTitle: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 15,
    color: Colors.text,
    marginBottom: 2,
  },
  uploadSubtitle: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 12,
    color: Colors.subtext,
  },
  submitButton: {
    marginHorizontal: 24,
    backgroundColor: Colors.navy,
    height: 58,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.navy,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 5,
  },
  submitButtonText: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 16,
    color: '#FFFFFF',
  },
});
