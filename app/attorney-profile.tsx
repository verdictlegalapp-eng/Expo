import React from 'react';
import { View, Text, TextInput, StyleSheet, SafeAreaView, TouchableOpacity, Image, ScrollView, Alert, StatusBar } from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Colors } from '../constants/Colors';
import { fetchCurrentUser, updateProfile } from '../lib/authApi';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { ZoomIn, FadeInUp } from 'react-native-reanimated';

export default function AttorneyProfile() {
  const router = useRouter();
  const [userData, setUserData] = React.useState<any>(null);
  const [isEditing, setIsEditing] = React.useState(false);
  const [profile, setProfile] = React.useState({
    name: '',
    practice: '',
    experience: '',
    bio: '',
    location: '',
    facebook: '',
    instagram: '',
    linkedin: ''
  });
  const [licenseVerified, setLicenseVerified] = React.useState(false);

  React.useEffect(() => {
    fetchCurrentUser().then(user => {
      setUserData(user);
      setProfile({
        name: user.name || '',
        practice: user.lawyerProfile?.practice || '',
        experience: user.lawyerProfile?.experience || '',
        bio: user.lawyerProfile?.bio || '',
        location: user.lawyerProfile?.location || `${user.city || ''}, ${user.state || ''}`,
        facebook: user.lawyerProfile?.facebook || '',
        instagram: user.lawyerProfile?.instagram || '',
        linkedin: user.lawyerProfile?.linkedin || ''
      });
      const badges = user.lawyerProfile?.badges;
      const isVerified = user.lawyerProfile?.isVerified || (Array.isArray(badges) && badges.some((b: string) => b.toLowerCase() === 'verified'));
      setLicenseVerified(isVerified);
    }).catch(console.error);
  }, []);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
      base64: true,
    });
    if (!result.canceled && result.assets[0].base64) {
      const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;
      setUserData({ ...userData, image: base64Image });
    }
  };

  const handleSave = async () => {
    try {
      setIsEditing(false);
      let city = userData.city;
      let state = userData.state;
      if (profile.location.includes(',')) {
        const parts = profile.location.split(',');
        city = parts[0].trim();
        state = parts[1].trim();
      }
      await updateProfile({
        name: profile.name,
        city,
        state,
        image: userData.image,
        bio: profile.bio,
        practice: profile.practice,
        experience: profile.experience,
        facebook: profile.facebook,
        instagram: profile.instagram,
        linkedin: profile.linkedin,
      });
      const updated = await fetchCurrentUser();
      setUserData(updated);
    } catch (e) {
      Alert.alert('Error', 'Failed to save profile');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Background Glow */}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: '#020617' }]} />
      <LinearGradient
        colors={['rgba(212, 175, 55, 0.15)', 'rgba(212, 175, 55, 0.05)', 'transparent']}
        start={{ x: 1, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Profile</Text>
          <TouchableOpacity onPress={() => isEditing ? handleSave() : setIsEditing(true)}>
            <Text style={styles.editBtnText}>{isEditing ? "Save" : "Edit"}</Text>
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
          <Animated.View entering={ZoomIn.springify()} style={styles.profileHeader}>
            <TouchableOpacity onPress={isEditing ? pickImage : undefined}>
              <Image 
                source={{ uri: userData?.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData?.name || 'A')}&background=D4AF37&color=020617` }} 
                style={styles.avatar} 
              />
              {isEditing && (
                <View style={styles.cameraIcon}>
                  <Ionicons name="camera" size={16} color={Colors.white} />
                </View>
              )}
            </TouchableOpacity>
            
            <View style={styles.nameRow}>
              <Text style={styles.nameText}>{profile.name || 'Attorney Name'}</Text>
              {licenseVerified && (
                <View style={styles.verifiedBadge}>
                  <Ionicons name="shield-checkmark" size={14} color={Colors.white} />
                </View>
              )}
            </View>
            <Text style={styles.practiceText}>{profile.practice || 'Specializing in Law'}</Text>
          </Animated.View>

          {isEditing ? (
            <Animated.View entering={FadeInUp.delay(200).springify()} style={styles.form}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput style={styles.input} value={profile.name} onChangeText={t => setProfile({...profile, name: t})} />
              
              <Text style={styles.label}>Practice Area</Text>
              <TextInput style={styles.input} value={profile.practice} onChangeText={t => setProfile({...profile, practice: t})} />
              
              <Text style={styles.label}>Years of Experience</Text>
              <TextInput style={styles.input} value={profile.experience} onChangeText={t => setProfile({...profile, experience: t})} />

              <Text style={styles.label}>Bio</Text>
              <TextInput style={[styles.input, { height: 100 }]} multiline value={profile.bio} onChangeText={t => setProfile({...profile, bio: t})} />
              
              <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                <LinearGradient colors={Colors.goldGradient} style={styles.saveGradient}>
                  <Text style={styles.saveBtnText}>Save Changes</Text>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          ) : (
            <View style={styles.dashboard}>
              <Animated.View entering={FadeInUp.delay(100).springify()} style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statVal}>14</Text>
                  <Text style={styles.statLab}>Active Leads</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statVal}>4.9</Text>
                  <Text style={styles.statLab}>Rating</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statVal}>28</Text>
                  <Text style={styles.statLab}>Consults</Text>
                </View>
              </Animated.View>

              {!licenseVerified && (
                <Animated.View entering={FadeInUp.delay(200).springify()}>
                  <TouchableOpacity style={styles.warningBanner} onPress={() => router.push('/license-verification')}>
                    <LinearGradient colors={['rgba(239, 68, 68, 0.15)', 'rgba(239, 68, 68, 0.05)']} style={styles.warningGradient}>
                      <View style={styles.warningLeft}>
                        <Ionicons name="alert-circle" size={24} color="#EF4444" />
                        <View style={{ marginLeft: 12 }}>
                          <Text style={styles.warningTitle}>Verification Required</Text>
                          <Text style={styles.warningSub}>Complete verification to get your badge</Text>
                        </View>
                      </View>
                      <Ionicons name="chevron-forward" size={20} color="#EF4444" />
                    </LinearGradient>
                  </TouchableOpacity>
                </Animated.View>
              )}

              <Animated.View entering={FadeInUp.delay(300).springify()}>
                <TouchableOpacity style={styles.boostBanner} onPress={() => router.push('/boost')}>
                  <LinearGradient colors={['rgba(212, 175, 55, 0.1)', 'rgba(212, 175, 55, 0.05)']} style={styles.boostGradient}>
                    <View style={styles.boostLeft}>
                      <Ionicons name="rocket" size={24} color={Colors.gold} />
                      <View style={{ marginLeft: 12 }}>
                        <Text style={styles.boostTitle}>Boost Visibility</Text>
                        <Text style={styles.boostSub}>Get 5x more clients today</Text>
                      </View>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={Colors.gold} />
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>

              <Animated.View entering={FadeInUp.delay(400).springify()} style={styles.menuSection}>
                <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/license-verification')}>
                  <Ionicons name="ribbon-outline" size={24} color={Colors.gold} />
                  <Text style={styles.menuText}>License Verification</Text>
                  <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.2)" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/messages')}>
                  <Ionicons name="chatbubbles-outline" size={24} color={Colors.gold} />
                  <Text style={styles.menuText}>Messages & Intake</Text>
                  <View style={styles.countBadge}><Text style={styles.countText}>3</Text></View>
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem} onPress={() => setIsEditing(true)}>
                  <Ionicons name="create-outline" size={24} color={Colors.gold} />
                  <Text style={styles.menuText}>Edit Public Profile</Text>
                  <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.2)" />
                </TouchableOpacity>
              </Animated.View>

              <Animated.View entering={FadeInUp.delay(500).springify()}>
                <TouchableOpacity style={styles.logoutBtn} onPress={() => router.replace('/')}>
                  <Text style={styles.logoutText}>Log Out</Text>
                </TouchableOpacity>
              </Animated.View>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 16 },
  headerTitle: { fontFamily: 'Outfit_700Bold', fontSize: 24, color: Colors.white },
  editBtnText: { fontFamily: 'Outfit_600SemiBold', fontSize: 16, color: Colors.gold },
  profileHeader: { alignItems: 'center', paddingVertical: 30 },
  avatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 2, borderColor: Colors.gold },
  cameraIcon: { position: 'absolute', bottom: 0, right: 0, width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.gold, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#020617' },
  nameRow: { flexDirection: 'row', alignItems: 'center', marginTop: 16 },
  nameText: { fontFamily: 'Outfit_700Bold', fontSize: 22, color: Colors.white },
  verifiedBadge: { marginLeft: 8, width: 22, height: 22, borderRadius: 11, backgroundColor: '#10B981', justifyContent: 'center', alignItems: 'center' },
  practiceText: { fontFamily: 'Outfit_400Regular', fontSize: 15, color: Colors.gold, marginTop: 4 },
  dashboard: { paddingHorizontal: 24 },
  statsRow: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 24, padding: 20, marginBottom: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  statItem: { flex: 1, alignItems: 'center' },
  statVal: { fontFamily: 'Outfit_700Bold', fontSize: 20, color: Colors.white },
  statLab: { fontFamily: 'Outfit_400Regular', fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 2 },
  warningBanner: { borderRadius: 24, overflow: 'hidden', marginBottom: 12, borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.2)' },
  warningGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20 },
  warningLeft: { flexDirection: 'row', alignItems: 'center' },
  warningTitle: { fontFamily: 'Outfit_700Bold', fontSize: 17, color: 'white' },
  warningSub: { fontFamily: 'Outfit_400Regular', fontSize: 13, color: 'rgba(255,255,255,0.5)' },
  boostBanner: { borderRadius: 24, overflow: 'hidden', marginBottom: 24, borderWidth: 1, borderColor: 'rgba(212, 175, 55, 0.2)' },
  boostGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20 },
  boostLeft: { flexDirection: 'row', alignItems: 'center' },
  boostTitle: { fontFamily: 'Outfit_700Bold', fontSize: 17, color: Colors.white },
  boostSub: { fontFamily: 'Outfit_400Regular', fontSize: 13, color: 'rgba(255,255,255,0.5)' },
  menuSection: { gap: 12 },
  menuItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.03)', padding: 16, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  menuText: { flex: 1, marginLeft: 16, fontFamily: 'Outfit_600SemiBold', fontSize: 16, color: Colors.white },
  countBadge: { backgroundColor: Colors.gold, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  countText: { fontFamily: 'Outfit_700Bold', fontSize: 12, color: Colors.deepBlue },
  logoutBtn: { marginTop: 32, alignItems: 'center', padding: 16 },
  logoutText: { fontFamily: 'Outfit_600SemiBold', fontSize: 16, color: '#EF4444' },
  form: { paddingHorizontal: 24 },
  label: { fontFamily: 'Outfit_600SemiBold', fontSize: 14, color: 'rgba(255,255,255,0.4)', marginTop: 16, marginBottom: 8 },
  input: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 16, padding: 16, color: Colors.white, fontFamily: 'Outfit_400Regular', fontSize: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  saveBtn: { marginTop: 32, height: 56, borderRadius: 28, overflow: 'hidden' },
  saveGradient: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  saveBtnText: { fontFamily: 'Outfit_700Bold', fontSize: 16, color: Colors.deepBlue },
});
