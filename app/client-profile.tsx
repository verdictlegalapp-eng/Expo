import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, SafeAreaView, TouchableOpacity, Image, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants/Colors';
import { fetchCurrentUser, updateProfile } from '../lib/authApi';

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
    }
  };

  const handleSave = async () => {
    try {
      setIsEditing(false);
      // Basic parsing of location into city/state if comma exists
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
      
      // Refresh user data
      const updatedUser = await fetchCurrentUser();
      setUserData(updatedUser);
    } catch (e) {
      console.error('Failed to save profile:', e);
      alert('Failed to save profile changes. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={Colors.navy} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Profile</Text>
          <TouchableOpacity onPress={() => isEditing ? handleSave() : setIsEditing(true)} style={styles.editButton}>
            <Text style={styles.editButtonText}>{isEditing ? "Save" : "Edit"}</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 40 }}>
          <View style={styles.profileHeader}>
            <TouchableOpacity 
              onPress={isEditing ? pickImage : undefined} 
              disabled={!isEditing}
              style={styles.avatarContainer}
            >
              <Image 
                source={{ uri: userData?.image || 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?auto=format&fit=crop&q=80&w=200' }} 
                style={styles.avatar} 
              />
              {isEditing && (
                <View style={[styles.editAvatarBadge, { backgroundColor: Colors.navy }]}>
                  <Ionicons name="camera" size={16} color="#FFFFFF" />
                </View>
              )}
            </TouchableOpacity>
            {!isEditing && <Text style={styles.profileNameText}>{profile.name}</Text>}
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.label}>Full Name</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={profile.name}
                onChangeText={(text) => setProfile({ ...profile, name: text })}
                placeholder="Enter your full name"
              />
            ) : (
              <Text style={styles.valueText}>{profile.name}</Text>
            )}

            <Text style={styles.label}>Location</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={profile.location}
                onChangeText={(text) => setProfile({ ...profile, location: text })}
                placeholder="Enter your city and state"
              />
            ) : (
              <Text style={styles.valueText}>{profile.location}</Text>
            )}

            <Text style={styles.label}>Current Legal Need</Text>
            {isEditing ? (
              <TextInput
                style={[styles.input, styles.textArea]}
                value={profile.legalNeed}
                onChangeText={(text) => setProfile({ ...profile, legalNeed: text })}
                placeholder="Describe your legal situation briefly"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            ) : (
              <Text style={styles.valueText}>{profile.legalNeed}</Text>
            )}
          </View>

          {!isEditing && (
            <TouchableOpacity 
              style={styles.logoutButton} 
              onPress={async () => {
                await import('@react-native-async-storage/async-storage').then(async (AsyncStorage) => {
                  await AsyncStorage.default.removeItem('verdict_session_token');
                  router.replace('/');
                });
              }}
            >
              <Ionicons name="log-out-outline" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={styles.logoutText}>Log Out</Text>
            </TouchableOpacity>
          )}

          {!isEditing && (
            <TouchableOpacity 
              style={styles.deleteLink} 
              onPress={() => router.push('/delete-account')}
            >
              <Text style={styles.deleteLinkText}>Permanently Delete My Account</Text>
            </TouchableOpacity>
          )}

        </ScrollView>
      </KeyboardAvoidingView>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 20,
    color: Colors.text,
  },
  editButton: {
    padding: 8,
    marginRight: -8,
  },
  editButtonText: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 16,
    color: Colors.electricBlue,
  },
  content: {
    flex: 1,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: Colors.navy,
  },
  editAvatarBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileNameText: {
    marginTop: 16,
    fontFamily: 'Outfit_700Bold',
    fontSize: 22,
    color: Colors.text,
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
  valueText: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 16,
    color: Colors.text,
    backgroundColor: Colors.slate,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
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
  logoutBtnWrapper: {
    marginHorizontal: 24,
    marginTop: 32,
    borderRadius: 12,
    overflow: 'hidden',
  },
  logoutGradient: {
    padding: 2,
  },
  logoutButton: {
    flexDirection: 'row',
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.navy,
    borderRadius: 10,
  },
  logoutText: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 16,
    color: '#FFFFFF',
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
