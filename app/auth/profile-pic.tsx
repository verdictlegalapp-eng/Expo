import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  Image,
  ScrollView,
  Dimensions,
  Platform
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { updateProfile } from '../../lib/authApi';

const { width } = Dimensions.get('window');

import { Colors } from '../../constants/Colors';

export default function ProfilePic() {
  const router = useRouter();
  const { role } = useLocalSearchParams();
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [isUploaded, setIsUploaded] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [base64Image, setBase64Image] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const isAttorney = role === 'attorney';

  const pickImage = async () => {
    // Request permission first
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
      aspect: isAttorney ? [4, 5] : [1, 1],
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      setImageUri(result.assets[0].uri);
      setBase64Image(result.assets[0].base64);
      setIsUploaded(true);
      setSelectedAvatar(null);
    }
  };

  const handleFinish = async () => {
    if (isAttorney && !base64Image) {
      Alert.alert('Photo Required', 'Attorneys must upload a professional profile picture to be discovered by clients.');
      return;
    }
    
    try {
      setIsSaving(true);
      if (base64Image) {
        await updateProfile({ image: `data:image/jpeg;base64,${base64Image}` });
      }
      
      if (isAttorney) {
        router.replace('/attorney-profile');
      } else {
        router.replace('/discovery');
      }
    } catch (e) {
      console.error('Failed to save profile pic', e);
      // Still let them proceed to the app even if picture upload fails
      router.replace(isAttorney ? '/attorney-profile' : '/discovery');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* ProgressBar indicating Step 3 of 3 (100%) */}
      <View style={styles.progressBarContainer}>
        <LinearGradient
          colors={Colors.goldGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.progressBar, { width: '100%' }]}
        />
      </View>

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}>
          <Ionicons name="arrow-back" size={28} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.stepIndicator}>Step 3 of 3</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.title}>
            {isAttorney ? "Professional Identity" : "Choose your identity"}
          </Text>
          <Text style={styles.subtitle}>
            {isAttorney 
              ? "Upload a professional headshot to build trust with clients." 
              : "Select a premium icon avatar or upload your own photo."}
          </Text>

          {isUploaded && imageUri ? (
            <View style={styles.uploadSection}>
              <View style={[styles.mainUploadCircle, isAttorney && styles.attorneyCardPreview]}>
                <Image source={{ uri: imageUri }} style={[styles.profileImage, isAttorney && styles.attorneyImagePreview]} />
                <TouchableOpacity style={styles.editBadge} onPress={pickImage}>
                  <Ionicons name="pencil" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.actionContainer}>
              <TouchableOpacity style={styles.primaryButton} onPress={pickImage}>
                <Text style={styles.primaryButtonText}>Add a Picture</Text>
              </TouchableOpacity>
              {!isAttorney && (
                <TouchableOpacity style={styles.secondaryButton} onPress={handleFinish}>
                  <Text style={styles.secondaryButtonText}>Skip</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {isUploaded && (
            <View style={styles.footer}>
              <TouchableOpacity 
                style={[styles.button, isSaving && { opacity: 0.7 }]} 
                onPress={handleFinish}
                disabled={isSaving}
              >
                <Text style={styles.buttonText}>{isSaving ? "Saving..." : "Finish & Enter Verdict"}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: '#F1F5F9',
    width: '100%',
  },
  progressBar: {
    height: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  stepIndicator: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 12,
    color: '#94A3B8',
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    padding: 24,
  },
  title: { fontFamily: 'Outfit_700Bold', fontSize: 32, color: Colors.deepBlue, marginBottom: 8 },
  subtitle: { fontFamily: 'Outfit_400Regular', fontSize: 16, color: '#64748B', marginBottom: 40 },
  actionContainer: { gap: 16, marginTop: 20 },
  primaryButton: {
    backgroundColor: Colors.navy,
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 18,
    color: '#FFFFFF',
  },
  secondaryButton: {
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  secondaryButtonText: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 18,
    color: Colors.deepBlue,
  },
  uploadSection: { alignItems: 'center', marginTop: 20 },
  mainUploadCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#F8FAFC',
    borderWidth: 2,
    borderColor: Colors.gold,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  profileImage: { width: 156, height: 156, borderRadius: 78 },
  attorneyCardPreview: {
    width: 200,
    height: 250,
    borderRadius: 24,
  },
  attorneyImagePreview: {
    width: 196,
    height: 246,
    borderRadius: 22,
  },
  editBadge: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: Colors.navy,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  footer: { paddingVertical: 24, paddingHorizontal: 0, marginTop: 'auto' },
  button: {
    backgroundColor: Colors.gold,
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: 'center',
  },
  buttonText: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 18,
    color: Colors.deepBlue,
  },
});
