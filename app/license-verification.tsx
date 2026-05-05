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
  Dimensions,
  StatusBar,
  Image
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming, Easing } from 'react-native-reanimated';
import { Colors } from '../constants/Colors';
import { LinearGradient } from 'expo-linear-gradient';
import { fetchCurrentUser } from '../lib/authApi';
import { 
  fetchVerificationStatus, 
  submitPhysicalVerificationRequest, 
  removeVerification,
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

  const pulseAnim = useSharedValue(0.2);

  useEffect(() => {
    loadStatus();
    pulseAnim.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.2, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const animatedPulseStyle = useAnimatedStyle(() => {
    return {
      opacity: pulseAnim.value,
      transform: [{ scale: 0.95 + (pulseAnim.value * 0.05) }]
    };
  });

  const loadStatus = async () => {
    try {
      setPageLoading(true);
      const user = await fetchCurrentUser();
      setCurrentUser(user);
      const statusData = await fetchVerificationStatus(user.id);
      
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
      Alert.alert('Missing Details', 'Please fill all fields to continue.');
      return;
    }
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
      Alert.alert('Submitted', 'Verification request sent.');
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'Could not send request.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveVerification = () => {
    Alert.alert(
      'Remove Verification',
      'Are you sure you want to remove your verification? You will lose your verified badge.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await removeVerification(currentUser.id);
              setVerificationStatus('none');
              Alert.alert('Success', 'Verification removed.');
            } catch (e) {
              Alert.alert('Error', 'Could not remove verification.');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  if (pageLoading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={Colors.gold} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={[StyleSheet.absoluteFill, { backgroundColor: '#020617' }]} />
      <LinearGradient
        colors={['rgba(212, 175, 55, 0.25)', 'rgba(212, 175, 55, 0.05)', 'transparent']}
        start={{ x: 1, y: 0 }}
        end={{ x: 0.4, y: 0.6 }}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={['rgba(212, 175, 55, 0.15)', 'transparent']}
        start={{ x: 0.8, y: -0.1 }}
        end={{ x: 0, y: 0.5 }}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={{ flex: 1 }}>
        {/* Header */}
        <View style={styles.header}>
          <View style={{ width: 44 }} />
          <Text style={styles.headerTitle}>Verification Status</Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {verificationStatus === 'approved' ? (
            <View style={styles.successWrapper}>
              {/* Phone Icon Circle with Glow */}
              <View style={styles.glowContainer}>
                <Animated.View style={[styles.glowCircle, animatedPulseStyle]}>
                  <LinearGradient
                    colors={['rgba(212, 175, 55, 0.4)', 'transparent']}
                    style={StyleSheet.absoluteFill}
                  />
                </Animated.View>
                <View style={styles.phoneCircle}>
                  <View style={styles.phoneInner}>
                    <MaterialCommunityIcons name="cellphone" size={50} color={Colors.gold} />
                    <View style={styles.checkBadge}>
                      <Ionicons name="checkmark" size={14} color={Colors.deepBlue} />
                    </View>
                  </View>
                </View>
              </View>

              <Text style={styles.thankYouTitle}>Thank you, {currentUser?.name?.split(' ')[0] || 'Attorney'}!</Text>
              <Text style={styles.thankYouSub}>You're a verified attorney now! Your profile has been updated with the systems.</Text>

              {/* Details Card with subtle top gradient */}
              <View style={styles.detailsCard}>
                <LinearGradient
                   colors={['rgba(212, 175, 55, 0.05)', 'transparent']}
                   style={StyleSheet.absoluteFill}
                   start={{ x: 0, y: 0 }}
                   end={{ x: 0, y: 0.2 }}
                />
                <Text style={styles.cardTitle}>Verification details</Text>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Verification ID</Text>
                  <Text style={styles.detailValue}>#VRF{currentUser?.id?.slice(-8).toUpperCase()}</Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Verified date</Text>
                  <Text style={styles.detailValue}>{new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>State Registry</Text>
                  <Text style={styles.detailValue}>{currentUser?.lawyerProfile?.state || 'Texas'}</Text>
                </View>

                <View style={styles.divider} />

                <Text style={styles.cardTitle}>Details</Text>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Status</Text>
                  <Text style={[styles.detailValue, { color: '#10B981', fontWeight: 'bold' }]}>ACTIVE</Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Bar ID</Text>
                  <Text style={styles.detailValue}>{currentUser?.lawyerProfile?.barId || 'Verified'}</Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Badge Type</Text>
                  <Text style={styles.detailValue}>Premium Badge</Text>
                </View>
              </View>

              <Text style={styles.footerNote}>
                Note: if you need some help please contact customer services <Text style={styles.phoneLink}>006 502 022</Text>
              </Text>

              <TouchableOpacity style={styles.removeBtn} onPress={handleRemoveVerification}>
                <Text style={styles.removeBtnText}>Remove Verification</Text>
              </TouchableOpacity>
            </View>
          ) : verificationStatus === 'pending' ? (
             <View style={styles.pendingWrapper}>
                <View style={styles.glowContainer}>
                  <Animated.View style={[styles.glowCircle, animatedPulseStyle]}>
                    <LinearGradient
                      colors={['rgba(212, 175, 55, 0.4)', 'transparent']}
                      style={StyleSheet.absoluteFill}
                    />
                  </Animated.View>
                  <View style={styles.phoneCircle}>
                      <View style={styles.phoneInner}>
                          <MaterialCommunityIcons name="clock-outline" size={50} color={Colors.gold} />
                      </View>
                  </View>
                </View>
                <Text style={styles.thankYouTitle}>Review in Progress</Text>
                <Text style={styles.thankYouSub}>We are currently manually verifying your license. This usually takes 24-48 hours.</Text>
                <TouchableOpacity style={styles.doneBtn} onPress={() => router.back()}>
                  <LinearGradient colors={Colors.goldGradient} style={styles.doneGradient}>
                    <Text style={styles.doneBtnText}>Return to Profile</Text>
                  </LinearGradient>
                </TouchableOpacity>
             </View>
          ) : (
            <View style={styles.unverifiedWrapper}>
                <Text style={styles.formTitle}>Submit Credentials</Text>
                <Text style={styles.formSub}>Our administrators will manually verify your license with the state bar registry.</Text>
                
                <View style={styles.formCard}>
                  <View style={styles.row}>
                    <View style={[styles.inputGroup, { flex: 1, marginRight: 12 }]}>
                      <Text style={styles.label}>FIRST NAME</Text>
                      <TextInput style={styles.input} value={firstName} onChangeText={setFirstName} placeholder="John" placeholderTextColor="rgba(255,255,255,0.2)" />
                    </View>
                    <View style={[styles.inputGroup, { flex: 1 }]}>
                      <Text style={styles.label}>LAST NAME</Text>
                      <TextInput style={styles.input} value={lastName} onChangeText={setLastName} placeholder="Doe" placeholderTextColor="rgba(255,255,255,0.2)" />
                    </View>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>LAW FIRM NAME</Text>
                    <TextInput style={styles.input} value={lawFirm} onChangeText={setLawFirm} placeholder="Smith & Associates" placeholderTextColor="rgba(255,255,255,0.2)" />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>STATE BAR NUMBER</Text>
                    <TextInput style={styles.input} value={barId} onChangeText={setBarId} placeholder="240XXXXX" keyboardType="numeric" placeholderTextColor="rgba(255,255,255,0.2)" />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>ISSUING STATE</Text>
                    <View style={styles.stateToggle}>
                      <TouchableOpacity style={[styles.stateBtn, selectedState === 'TX' && styles.stateActive]} onPress={() => setSelectedState('TX')}>
                        <Text style={[styles.stateText, selectedState === 'TX' && styles.stateTextActive]}>Texas</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={[styles.stateBtn, selectedState === 'CA' && styles.stateActive]} onPress={() => setSelectedState('CA')}>
                        <Text style={[styles.stateText, selectedState === 'CA' && styles.stateTextActive]}>California</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <TouchableOpacity style={styles.submitBtn} onPress={handleSubmitRequest} disabled={loading}>
                    <LinearGradient colors={Colors.goldGradient} style={styles.submitGradient}>
                      {loading ? <ActivityIndicator color={Colors.deepBlue} /> : <Text style={styles.submitText}>Submit for Verification</Text>}
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
            </View>
          )}

        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617' },
  center: { justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12 },
  backButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontFamily: 'Outfit_700Bold', fontSize: 18, color: Colors.white },
  scrollContent: { padding: 24, paddingBottom: 60 },
  
  successWrapper: { alignItems: 'center' },
  glowContainer: { width: 200, height: 200, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  glowCircle: { position: 'absolute', width: 200, height: 200, borderRadius: 100, overflow: 'hidden' },
  phoneCircle: { width: 140, height: 140, borderRadius: 70, backgroundColor: 'rgba(212, 175, 55, 0.1)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(212, 175, 55, 0.3)' },
  phoneInner: { width: 110, height: 110, borderRadius: 55, backgroundColor: 'rgba(255,255,255,0.08)', justifyContent: 'center', alignItems: 'center', position: 'relative' },
  checkBadge: { position: 'absolute', top: 35, right: 35, width: 24, height: 24, borderRadius: 12, backgroundColor: Colors.gold, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#020617' },
  
  thankYouTitle: { fontFamily: 'Outfit_700Bold', fontSize: 24, color: Colors.white, marginBottom: 8, textAlign: 'center' },
  thankYouSub: { fontFamily: 'Outfit_400Regular', fontSize: 15, color: 'rgba(255,255,255,0.5)', textAlign: 'center', paddingHorizontal: 20, lineHeight: 22, marginBottom: 30 },
  
  detailsCard: { width: '100%', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 24, padding: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', marginBottom: 30, overflow: 'hidden' },
  cardTitle: { fontFamily: 'Outfit_700Bold', fontSize: 18, color: Colors.white, marginBottom: 20 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 },
  detailLabel: { fontFamily: 'Outfit_400Regular', fontSize: 15, color: 'rgba(255,255,255,0.4)' },
  detailValue: { fontFamily: 'Outfit_600SemiBold', fontSize: 15, color: Colors.white },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.05)', marginVertical: 20, borderStyle: 'dashed', borderRadius: 1 },
  
  footerNote: { fontFamily: 'Outfit_400Regular', fontSize: 14, color: 'rgba(255,255,255,0.4)', textAlign: 'center', lineHeight: 20, paddingHorizontal: 10, marginBottom: 30 },
  phoneLink: { color: Colors.gold, fontWeight: 'bold', textDecorationLine: 'underline' },
  
  removeBtn: { paddingVertical: 10 },
  removeBtnText: { color: '#EF4444', fontFamily: 'Outfit_600SemiBold', fontSize: 14, textDecorationLine: 'underline' },

  pendingWrapper: { alignItems: 'center', marginTop: 40 },
  doneBtn: { width: '100%', height: 56, borderRadius: 28, overflow: 'hidden', marginTop: 30 },
  doneGradient: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  doneBtnText: { color: Colors.deepBlue, fontFamily: 'Outfit_700Bold', fontSize: 16 },

  unverifiedWrapper: { marginTop: 10 },
  formTitle: { fontFamily: 'Outfit_700Bold', fontSize: 28, color: Colors.white, marginBottom: 8 },
  formSub: { fontFamily: 'Outfit_400Regular', fontSize: 16, color: 'rgba(255,255,255,0.4)', lineHeight: 24, marginBottom: 30 },
  formCard: { backgroundColor: 'rgba(255,255,255,0.03)', padding: 24, borderRadius: 28, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  row: { flexDirection: 'row' },
  inputGroup: { marginBottom: 20 },
  label: { fontFamily: 'Outfit_700Bold', fontSize: 11, color: 'rgba(255,255,255,0.3)', letterSpacing: 1, marginBottom: 8 },
  input: { height: 56, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 16, color: Colors.white, fontFamily: 'Outfit_400Regular', fontSize: 16 },
  stateToggle: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 16, padding: 4 },
  stateBtn: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 12 },
  stateActive: { backgroundColor: Colors.gold },
  stateText: { fontFamily: 'Outfit_600SemiBold', fontSize: 14, color: 'rgba(255,255,255,0.4)' },
  stateTextActive: { color: Colors.deepBlue },
  submitBtn: { marginTop: 12, height: 60, borderRadius: 30, overflow: 'hidden' },
  submitGradient: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  submitText: { fontFamily: 'Outfit_700Bold', fontSize: 16, color: Colors.deepBlue },
});
