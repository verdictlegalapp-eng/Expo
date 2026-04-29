import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { fetchLawyerById } from '../../lib/lawyerApi';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LawyerDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [lawyer, setLawyer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);

  React.useEffect(() => {
    if (id) {
      loadLawyer();
    }
  }, [id]);

  const loadLawyer = async () => {
    try {
      setLoading(true);
      const data = await fetchLawyerById(id as string);
      setLawyer(data);
    } catch (e) {
      console.error('Failed to load lawyer:', e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <Text style={styles.loadingText}>Loading attorney details...</Text>
      </View>
    );
  }

  if (!lawyer) {
    return (
      <View style={styles.center}>
        <Text>Lawyer not found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.outerContainer}>
      <ScrollView style={styles.container} bounces={false}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: lawyer.image }} style={styles.image} />
          <SafeAreaView style={styles.backButtonSafeArea}>
            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.headerButton, isFavorite && styles.favoriteActive]} 
                onPress={() => setIsFavorite(!isFavorite)}
              >
                <Ionicons 
                  name={isFavorite ? "heart" : "heart-outline"} 
                  size={24} 
                  color={isFavorite ? "#EF4444" : "#FFFFFF"} 
                />
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </View>

        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.name}>{lawyer.name}</Text>
            <Text style={styles.experience}>{lawyer.experience}</Text>
          </View>

          <Text style={styles.practice}>{lawyer.practice}</Text>
          <Text style={styles.location}>{lawyer.location}</Text>

          <View style={styles.badges}>
            {(lawyer.badges || []).map((badge: string, idx: number) => {
              const isVerified = badge.toLowerCase() === 'verified';
              return (
                <View key={idx} style={[styles.badge, isVerified && styles.verifiedBadge]}>
                  {isVerified && <Ionicons name="shield-checkmark" size={12} color="#FFFFFF" style={{ marginRight: 4 }} />}
                  <Text style={[styles.badgeText, isVerified && styles.verifiedBadgeText]}>
                    {isVerified ? 'Verified' : badge}
                  </Text>
                </View>
              );
            })}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.bio}>{lawyer.bio}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.disclaimer}>
              The information provided does not constitute legal advice. Requesting a consultation does not establish an attorney-client relationship.
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.actionFooter}>
        <TouchableOpacity 
          style={[styles.messageButton, !lawyer.userId && { opacity: 0.45 }]}
          disabled={!lawyer.userId}
          onPress={() => {
            if (!lawyer.userId) return;
            router.push({
              pathname: '/chat/[id]',
              params: { id: lawyer.userId, name: lawyer.name },
            });
          }}
        >
          <Ionicons name="chatbubble-ellipses-outline" size={20} color="#273951" />
          <Text style={styles.messageButtonText}>Message</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.ctaButton}
          onPress={() => router.push({ pathname: '/consultation-sent', params: { userId: lawyer.userId } })}
        >
          <Text style={styles.ctaButtonText}>Request Consultation</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 16,
    color: '#64748B',
  },
  outerContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
  },
  imageContainer: {
    width: '100%',
    height: 450,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  backButtonSafeArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  favoriteActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderColor: '#FFFFFF',
  },
  content: {
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -32,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  name: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 28,
    color: '#0F172A',
  },
  experience: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 14,
    color: '#64748B',
  },
  practice: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 18,
    color: '#273951',
    marginBottom: 4,
  },
  location: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 16,
    color: '#64748B',
    marginBottom: 20,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  badge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  badgeText: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 12,
    color: '#273951',
  },
  verifiedBadge: {
    backgroundColor: '#10B981',
    borderColor: '#059669',
    flexDirection: 'row',
    alignItems: 'center',
  },
  verifiedBadgeText: {
    color: '#FFFFFF',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 20,
    color: '#0F172A',
    marginBottom: 10,
  },
  bio: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 16,
    color: '#475569',
    lineHeight: 26,
  },
  disclaimer: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 12,
    color: '#94A3B8',
    fontStyle: 'italic',
    lineHeight: 18,
  },
  actionFooter: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    gap: 12,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
  },
  messageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 20,
    borderRadius: 30,
    gap: 8,
  },
  messageButtonText: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 16,
    color: '#273951',
  },
  ctaButton: {
    flex: 1,
    backgroundColor: '#273951',
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: 'center',
  },
  ctaButtonText: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 16,
    color: '#FFFFFF',
  },
});

