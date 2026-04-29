import React from 'react';
import { View, Text, TextInput, StyleSheet, SafeAreaView, TouchableOpacity, Image, ScrollView, Alert } from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Colors } from '../constants/Colors';
import { fetchCurrentUser, updateProfile } from '../lib/authApi';
import { fetchBadgeMap } from '../lib/servicesApi';

export default function AttorneyProfile() {
  const router = useRouter();
  const [userData, setUserData] = React.useState<any>(null);
  const [isEditing, setIsEditing] = React.useState(false);
  const [profile, setProfile] = React.useState({
    name: '',
    practice: '',
    experience: '',
    bio: '',
    location: ''
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
        location: user.lawyerProfile?.location || `${user.city || ''}, ${user.state || ''}`
      });
      
      // Check badges and isVerified from lawyerProfile
      const badges = user.lawyerProfile?.badges;
      const isVerified = user.lawyerProfile?.isVerified || (Array.isArray(badges) && badges.some((b: string) => b.toLowerCase() === 'verified'));
      setLicenseVerified(isVerified);
    }).catch(console.error);
  }, []);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Sorry, we need camera roll permissions to make this work!',
        [{ text: 'OK' }]
      );
      return;
    }

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
      // We don't save yet, just update local state until handleSave is called
    }
  };

  const handleSave = async () => {
    try {
      setIsEditing(false);
      
      // Basic parsing of location into city/state
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
      });
      
      const updated = await fetchCurrentUser();
      setUserData(updated);
    } catch (e) {
      console.error(e);
      alert('Failed to save profile');
    }
  };

  const renderEditForm = () => (
    <ScrollView style={styles.content}>
      <View style={styles.profileHeader}>
        <TouchableOpacity onPress={pickImage} style={styles.avatarContainer}>
          <Image 
            source={{ uri: userData?.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData?.name || 'A')}&background=0D8ABC&color=fff` }} 
            style={styles.avatar} 
          />
          <View style={styles.editAvatarBadge}>
            <Ionicons name="camera" size={16} color="#FFFFFF" />
          </View>
        </TouchableOpacity>
        <Text style={styles.name}>{profile.name || 'Your Name'}</Text>
        <Text style={styles.practice}>{profile.practice || 'Attorney at Law'}</Text>
      </View>

      <View style={styles.formContainer}>
        <Text style={styles.label}>Full Name</Text>
        <TextInput 
          style={styles.input}
          value={profile.name}
          onChangeText={t => setProfile({...profile, name: t})}
          placeholder="Enter your full name"
        />
        
        <Text style={styles.label}>Practice Area</Text>
        <TextInput 
          style={styles.input}
          value={profile.practice}
          onChangeText={t => setProfile({...profile, practice: t})}
          placeholder="e.g. Personal Injury"
        />
        
        <Text style={styles.label}>Years of Experience</Text>
        <TextInput 
          style={styles.input}
          value={profile.experience}
          onChangeText={t => setProfile({...profile, experience: t})}
          placeholder="e.g. 12 Years Experience"
        />

        <Text style={styles.label}>Location</Text>
        <TextInput 
          style={styles.input}
          value={profile.location}
          onChangeText={t => setProfile({...profile, location: t})}
          placeholder="City, State"
        />

        <Text style={styles.label}>Bio</Text>
        <TextInput 
          style={[styles.input, styles.textArea]}
          value={profile.bio}
          onChangeText={t => setProfile({...profile, bio: t})}
          multiline
          placeholder="Tell clients about your experience..."
        />
        
        <TouchableOpacity 
          style={[styles.logoutButton, { marginTop: 24, backgroundColor: Colors.electricBlue }]} 
          onPress={handleSave}
        >
          <Text style={styles.logoutText}>Save Changes</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.logoutButton, { marginTop: 12, backgroundColor: 'transparent', borderWidth: 1, borderColor: Colors.border }]} 
          onPress={() => setIsEditing(false)}
        >
          <Text style={[styles.logoutText, { color: Colors.subtext }]}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Profile</Text>
        <TouchableOpacity 
          onPress={() => isEditing ? handleSave() : setIsEditing(true)} 
          style={styles.settingsButton}
        >
          <Text style={styles.editButtonText}>{isEditing ? "Save" : "Edit"}</Text>
        </TouchableOpacity>
      </View>

      {isEditing ? renderEditForm() : (
        <ScrollView style={styles.content}>
          <View style={styles.profileHeader}>
            <Image 
              source={{ uri: userData?.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData?.name || 'A')}&background=0D8ABC&color=fff` }} 
              style={styles.avatar} 
            />
            <View style={styles.nameRow}>
              <Text style={styles.name}>{userData?.name || 'Loading...'}</Text>
              {licenseVerified ? (
                <View style={styles.verifiedPill}>
                  <Ionicons name="shield-checkmark" size={14} color="#FFFFFF" />
                  <Text style={styles.verifiedPillText}>Verified</Text>
                </View>
              ) : null}
            </View>
            <Text style={styles.practice}>{userData?.lawyerProfile?.practice || 'Attorney at Law'}</Text>
            <View style={styles.statusBadge}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>Accepting Clients</Text>
            </View>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>14</Text>
              <Text style={styles.statLabel}>Active Leads</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>4.9</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>28</Text>
              <Text style={styles.statLabel}>Consultations</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Dashboard</Text>

            <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/license-verification')}>
              <View style={styles.menuItemLeft}>
                <View style={[styles.iconCircle, { backgroundColor: '#F0F9FF' }]}>
                  <Ionicons name="ribbon" size={20} color={Colors.electricBlue} />
                </View>
                <Text style={styles.menuItemText}>License Verification</Text>
              </View>
              <View style={styles.badge}>
                <Ionicons name="checkmark-sharp" size={12} color="#FFFFFF" />
              </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.border} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/messages')}>
              <View style={styles.menuItemLeft}>
                <View style={[styles.iconCircle, { backgroundColor: '#F8FAFC' }]}>
                  <Ionicons name="chatbubbles" size={20} color={Colors.navy} />
                </View>
                <Text style={styles.menuItemText}>Messages & Intake</Text>
              </View>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>3</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.border} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.menuItemLeft}>
                <View style={[styles.iconCircle, { backgroundColor: '#F0FDF4' }]}>
                  <FontAwesome5 name="chart-line" size={16} color={Colors.success} />
                </View>
                <Text style={styles.menuItemText}>Consultation History</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.border} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={() => setIsEditing(true)}>
              <View style={styles.menuItemLeft}>
                <View style={[styles.iconCircle, { backgroundColor: '#FFF5F5' }]}>
                  <Ionicons name="document-text" size={20} color={Colors.error} />
                </View>
                <Text style={styles.menuItemText}>Edit Public Profile</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.border} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.logoutButton} onPress={() => router.replace('/')}>
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.deleteLink} 
            onPress={() => router.push('/delete-account')}
          >
            <Text style={styles.deleteLinkText}>Permanently Delete My Account</Text>
          </TouchableOpacity>

          <View style={{ height: 100 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 24,
    color: Colors.text,
  },
  settingsButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
    borderWidth: 3,
    borderColor: Colors.navy,
  },
  editAvatarBadge: {
    position: 'absolute',
    bottom: 16,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.navy,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 4,
  },
  name: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 24,
    color: Colors.text,
  },
  verifiedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#059669',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  verifiedPillText: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 12,
    color: '#FFFFFF',
  },
  practice: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 16,
    color: Colors.subtext,
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.success,
    marginRight: 6,
  },
  statusText: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 12,
    color: Colors.success,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.slate,
    marginHorizontal: 24,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 32,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 20,
    color: Colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 12,
    color: Colors.subtext,
  },
  section: {
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 18,
    color: Colors.text,
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.slate,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuItemText: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 16,
    color: Colors.text,
  },
  badge: {
    backgroundColor: Colors.electricBlue,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginRight: 8,
  },
  badgeText: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 12,
    color: '#FFFFFF',
  },
  logoutBtnWrapper: {
    marginHorizontal: 24,
    marginTop: 24,
    marginBottom: 48,
    borderRadius: 16,
    overflow: 'hidden',
  },
  logoutGradient: {
    padding: 2,
  },
  logoutButton: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.navy,
    borderRadius: 14,
  },
  logoutText: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 16,
    color: '#FFFFFF',
  },
  editButtonText: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 16,
    color: Colors.electricBlue,
  },
  formContainer: {
    padding: 24,
  },
  label: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 14,
    color: Colors.subtext,
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 16,
    color: Colors.text,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.electricBlue,
  },
  textArea: {
    height: 120,
    paddingTop: 16,
  },
  deleteLink: {
    marginTop: 24,
    alignItems: 'center',
    padding: 10,
  },
  deleteLinkText: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 14,
    color: '#EF4444',
    textDecorationLine: 'underline',
  },
});
