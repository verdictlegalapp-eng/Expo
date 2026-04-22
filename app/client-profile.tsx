import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, SafeAreaView, TouchableOpacity, Image, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants/Colors';

export default function ClientProfile() {
  const router = useRouter();

  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: 'John Doe',
    location: 'New York, NY',
    legalNeed: 'Looking for assistance with a tech start-up incorporation and general privacy policies.'
  });

  const handleSave = () => {
    setIsEditing(false);
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
            <View style={styles.avatarContainer}>
              <Image 
                source={{ uri: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?auto=format&fit=crop&q=80&w=200' }} 
                style={styles.avatar} 
              />
              {isEditing && (
                <View style={[styles.editAvatarBadge, { backgroundColor: Colors.navy }]}>
                  <Ionicons name="camera" size={16} color="#FFFFFF" />
                </View>
              )}
            </View>
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
            <TouchableOpacity style={styles.logoutButton} onPress={() => router.replace('/')}>
              <Ionicons name="log-out-outline" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={styles.logoutText}>Log Out</Text>
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
});
