import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, SafeAreaView, TouchableOpacity, Image, ScrollView, KeyboardAvoidingView, Platform, Alert, StatusBar } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants/Colors';
import { fetchCurrentUser, updateProfile } from '../lib/authApi';
import Animated, { ZoomIn, FadeInUp } from 'react-native-reanimated';

export default function ClientProfile() {
  const router = useRouter();

  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [profile, setProfile] = useState({
    name: 'Loading...',
    location: '',
    legalNeed: ''
  });

  React.useEffect(() => {
    fetchCurrentUser().then(user => {
      setUserData(user);
      setProfile({
        name: user.name || 'New Client',
        location: user.city && user.state ? `${user.city}, ${user.state}` : (user.city || user.state || ''),
        legalNeed: user.legalNeed || 'No specific legal need described yet.'
      });
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
      let city = profile.location;
      let state = '';
      if (profile.location.includes(',')) {
        const parts = profile.location.split(',');
        city = parts[0].trim();
        state = parts[1].trim();
      }
      await updateProfile({
        name: profile.name,
        city,
        state,
        legalNeed: profile.legalNeed,
        image: userData.image,
      });
      const updatedUser = await fetchCurrentUser();
      setUserData(updatedUser);
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
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="chevron-back" size={24} color={Colors.white} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>My Profile</Text>
            <TouchableOpacity onPress={() => isEditing ? handleSave() : setIsEditing(true)}>
              <Text style={styles.editBtnText}>{isEditing ? "Save" : "Edit"}</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
            <Animated.View entering={ZoomIn.springify()} style={styles.profileHeader}>
              <TouchableOpacity onPress={isEditing ? pickImage : undefined}>
                <Image 
                  source={{ uri: userData?.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name || 'C')}&background=D4AF37&color=020617` }} 
                  style={styles.avatar} 
                />
                {isEditing && (
                  <View style={styles.cameraIcon}>
                    <Ionicons name="camera" size={16} color={Colors.white} />
                  </View>
                )}
              </TouchableOpacity>
              {!isEditing && <Text style={styles.nameText}>{profile.name}</Text>}
            </Animated.View>

            <Animated.View entering={FadeInUp.delay(200).springify()} style={styles.form}>
              <Text style={styles.label}>Full Name</Text>
              {isEditing ? (
                <TextInput style={styles.input} value={profile.name} onChangeText={t => setProfile({...profile, name: t})} />
              ) : (
                <View style={styles.valueBox}><Text style={styles.valueText}>{profile.name}</Text></View>
              )}

              <Text style={styles.label}>Location</Text>
              {isEditing ? (
                <TextInput style={styles.input} value={profile.location} onChangeText={t => setProfile({...profile, location: t})} />
              ) : (
                <View style={styles.valueBox}><Text style={styles.valueText}>{profile.location}</Text></View>
              )}

              <Text style={styles.label}>Legal Situation</Text>
              {isEditing ? (
                <TextInput style={[styles.input, { height: 100 }]} multiline value={profile.legalNeed} onChangeText={t => setProfile({...profile, legalNeed: t})} />
              ) : (
                <View style={styles.valueBox}><Text style={styles.valueText}>{profile.legalNeed}</Text></View>
              )}
            </Animated.View>

            {!isEditing && (
              <>
                <TouchableOpacity 
                  style={styles.logoutBtn} 
                  onPress={async () => {
                    const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
                    await AsyncStorage.removeItem('verdict_session_token');
                    router.replace('/');
                  }}
                >
                  <Text style={styles.logoutText}>Log Out</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.deleteLink} onPress={() => router.push('/delete-account')}>
                  <Text style={styles.deleteLinkText}>Delete Account</Text>
                </TouchableOpacity>
              </>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 16 },
  backButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontFamily: 'Outfit_700Bold', fontSize: 24, color: Colors.white },
  editBtnText: { fontFamily: 'Outfit_600SemiBold', fontSize: 16, color: Colors.gold },
  profileHeader: { alignItems: 'center', paddingVertical: 32 },
  avatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 2, borderColor: Colors.gold },
  cameraIcon: { position: 'absolute', bottom: 0, right: 0, width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.gold, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#020617' },
  nameText: { fontFamily: 'Outfit_700Bold', fontSize: 24, color: Colors.white, marginTop: 16 },
  form: { paddingHorizontal: 24 },
  label: { fontFamily: 'Outfit_600SemiBold', fontSize: 14, color: 'rgba(255,255,255,0.4)', marginTop: 16, marginBottom: 8 },
  valueBox: { backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  valueText: { fontFamily: 'Outfit_400Regular', fontSize: 16, color: Colors.white },
  input: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 16, padding: 16, color: Colors.white, fontFamily: 'Outfit_400Regular', fontSize: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  logoutBtn: { marginHorizontal: 24, marginTop: 32, backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: 16, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.2)' },
  logoutText: { fontFamily: 'Outfit_700Bold', color: '#EF4444', fontSize: 16 },
  deleteLink: { marginTop: 24, alignItems: 'center' },
  deleteLinkText: { fontFamily: 'Outfit_600SemiBold', fontSize: 14, color: 'rgba(255,255,255,0.2)', textDecorationLine: 'underline' },
});
