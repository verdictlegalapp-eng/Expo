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

const AVATAR_ICONS: (keyof typeof Ionicons.glyphMap)[] = [
  'person',
  'happy',
  'briefcase',
  'medal',
  'school',
  'shield-checkmark',
];

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
      aspect: [1, 1],
      quality: 0.5,
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
    try {
      setIsSaving(true);
      if (base64Image) {
        await updateProfile({ image: `data:image/jpeg;base64,${base64Image}` });
      } else if (selectedAvatar) {
        await updateProfile({ image: selectedAvatar });
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
          colors={['#3B82F6', '#273951']}
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

          {isAttorney ? (
            <View style={styles.uploadSection}>
              <TouchableOpacity 
                style={styles.mainUploadCircle} 
                onPress={pickImage}
              >
                {isUploaded && imageUri ? (
                  <Image 
                    source={{ uri: imageUri }} 
                    style={styles.profileImage} 
                  />
                ) : (
                  <View style={styles.placeholderIcon}>
                    <Ionicons name="camera" size={40} color="#94A3B8" />
                    <Text style={styles.uploadLabel}>Upload Photo</Text>
                  </View>
                )}
                <View style={styles.editBadge}>
                  <Ionicons name={isUploaded ? "checkmark" : "add"} size={20} color="#FFFFFF" />
                </View>
              </TouchableOpacity>
              <Text style={styles.hintText}>High resolution headshots perform 4x better.</Text>
            </View>
          ) : (
            <View style={styles.clientSection}>
              <View style={styles.avatarGrid}>
                {AVATAR_ICONS.map((iconName, index) => (
                  <TouchableOpacity 
                    key={index} 
                    style={[
                      styles.avatarWrapper,
                      selectedAvatar === iconName && styles.selectedAvatar
                    ]}
                    onPress={() => {
                      setSelectedAvatar(iconName);
                      setIsUploaded(false);
                    }}
                  >
                    <View style={[
                      styles.iconBackground,
                      selectedAvatar === iconName && styles.selectedIconBackground
                    ]}>
                      <Ionicons 
                        name={iconName} 
                        size={44} 
                        color={selectedAvatar === iconName ? "#3B82F6" : "#CBD5E1"} 
                      />
                    </View>
                    {selectedAvatar === iconName && (
                      <View style={styles.checkOverlay}>
                        <Ionicons name="checkmark-circle" size={24} color="#3B82F6" />
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.divider}>
                <View style={styles.line} />
                <Text style={styles.dividerText}>OR</Text>
                <View style={styles.line} />
              </View>

              <TouchableOpacity 
                style={[styles.customUploadButton, isUploaded && styles.uploadedButton]} 
                onPress={pickImage}
              >
                <Ionicons name="image-outline" size={24} color={isUploaded ? "#3B82F6" : "#64748B"} />
                <Text style={[styles.uploadButtonText, isUploaded && styles.uploadedText]}>
                  {isUploaded ? "Photo Selected" : "Upload your own photo"}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.button, (!selectedAvatar && !isUploaded) && styles.buttonDisabled, isSaving && { opacity: 0.7 }]} 
          onPress={handleFinish}
          disabled={(!selectedAvatar && !isUploaded) || isSaving}
        >
          <Text style={styles.buttonText}>{isSaving ? "Saving..." : "Finish & Enter Verdict"}</Text>
        </TouchableOpacity>
      </View>
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
  title: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 28,
    color: '#0F172A',
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 16,
    color: '#475569',
    marginBottom: 40,
  },
  uploadSection: {
    alignItems: 'center',
    marginTop: 20,
  },
  mainUploadCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#F8FAFC',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  profileImage: {
    width: 156,
    height: 156,
    borderRadius: 78,
  },
  placeholderIcon: {
    alignItems: 'center',
  },
  uploadLabel: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 8,
  },
  editBadge: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: '#3B82F6',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  hintText: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 14,
    color: '#64748B',
    marginTop: 24,
    textAlign: 'center',
  },
  clientSection: {
    gap: 32,
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  avatarWrapper: {
    width: (width - 48 - 32) / 3,
    aspectRatio: 1,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  iconBackground: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderRadius: 20,
  },
  selectedIconBackground: {
    backgroundColor: '#EFF6FF',
    borderColor: '#3B82F6',
  },
  selectedAvatar: {
    // Wrapper styles for selected state if needed
  },
  checkOverlay: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  dividerText: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 12,
    color: '#94A3B8',
  },
  customUploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    gap: 12,
  },
  uploadedButton: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },
  uploadButtonText: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 16,
    color: '#64748B',
  },
  uploadedText: {
    color: '#3B82F6',
  },
  footer: {
    padding: 24,
  },
  button: {
    backgroundColor: '#273951',
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#CBD5E1',
  },
  buttonText: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 18,
    color: '#FFFFFF',
  },
});
