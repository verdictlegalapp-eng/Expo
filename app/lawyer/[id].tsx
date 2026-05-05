import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Platform, Linking, StatusBar, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { fetchLawyerById } from '../../lib/lawyerApi';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';
import { LinearGradient } from 'expo-linear-gradient';

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
      <View style={[styles.center, { backgroundColor: '#020617' }]}>
        <ActivityIndicator color={Colors.gold} size="large" />
        <Text style={styles.loadingText}>Loading attorney profile...</Text>
      </View>
    );
  }

  if (!lawyer) {
    return (
      <View style={[styles.center, { backgroundColor: '#020617' }]}>
        <Text style={{ color: 'white' }}>Attorney not found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.outerContainer}>
      <StatusBar barStyle="light-content" />
      <Stack.Screen options={{ headerShown: false }} />
      
      <ScrollView style={styles.container} bounces={false} showsVerticalScrollIndicator={false}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: lawyer.image }} style={styles.image} />
          
          <LinearGradient
            colors={['rgba(2, 6, 23, 0.7)', 'transparent', 'rgba(2, 6, 23, 0.9)']}
            style={StyleSheet.absoluteFill}
          />

          <SafeAreaView style={styles.backButtonSafeArea}>
            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
                <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
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

          {lawyer.isVerified && (
            <View style={styles.floatingBadge}>
              <LinearGradient colors={Colors.goldGradient} style={styles.badgeGradient}>
                <Ionicons name="shield-checkmark" size={16} color={Colors.deepBlue} />
                <Text style={styles.badgeText}>VERIFIED</Text>
              </LinearGradient>
            </View>
          )}
        </View>

        <View style={styles.content}>
          <View style={styles.mainInfo}>
            <View style={styles.nameRow}>
               <Text style={styles.name}>{lawyer.name}</Text>
               {lawyer.isVerified && (
                 <View style={styles.titleBadge}>
                    <Ionicons name="shield-checkmark" size={14} color={Colors.gold} />
                 </View>
               )}
            </View>
            <Text style={styles.practice}>{lawyer.practice}</Text>
            
            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <Ionicons name="location-sharp" size={14} color={Colors.gold} />
                <Text style={styles.metaText}>{lawyer.location}</Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons name="briefcase-sharp" size={14} color={Colors.gold} />
                <Text style={styles.metaText}>{lawyer.experience || 'Experienced'}</Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About Counsel</Text>
            <Text style={styles.bio}>{lawyer.bio || "No biography provided."}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Specializations</Text>
            <View style={styles.tagCloud}>
              {lawyer.badges?.map((badge: string, i: number) => (
                <View key={i} style={styles.tag}>
                  <Text style={styles.tagText}>{badge}</Text>
                </View>
              ))}
              <View style={styles.tag}><Text style={styles.tagText}>{lawyer.practice}</Text></View>
            </View>
          </View>
          
          {(lawyer.facebook || lawyer.instagram || lawyer.linkedin) && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Professional Links</Text>
              <View style={styles.socialRow}>
                {lawyer.linkedin && (
                  <TouchableOpacity style={styles.socialCircle} onPress={() => Linking.openURL(lawyer.linkedin)}>
                    <Ionicons name="logo-linkedin" size={24} color="#0077B5" />
                  </TouchableOpacity>
                )}
                {lawyer.instagram && (
                  <TouchableOpacity style={styles.socialCircle} onPress={() => Linking.openURL(lawyer.instagram)}>
                    <Ionicons name="logo-instagram" size={24} color="#E4405F" />
                  </TouchableOpacity>
                )}
                {lawyer.facebook && (
                  <TouchableOpacity style={styles.socialCircle} onPress={() => Linking.openURL(lawyer.facebook)}>
                    <Ionicons name="logo-facebook" size={24} color="#1877F2" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}

          <View style={styles.disclaimerSection}>
            <Ionicons name="information-circle-outline" size={16} color="rgba(255,255,255,0.3)" />
            <Text style={styles.disclaimer}>
              Information provided is for discovery purposes. Requesting a consultation does not establish an attorney-client relationship.
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.actionFooter}>
        <TouchableOpacity 
          style={styles.messageButton}
          onPress={() => {
            if (!lawyer.userId) return;
            router.push({
              pathname: '/chat/[id]',
              params: { id: lawyer.userId, name: lawyer.name, image: lawyer.image },
            });
          }}
        >
          <Ionicons name="chatbubble-ellipses-outline" size={24} color={Colors.white} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.ctaButton}
          onPress={() => router.push({ pathname: '/consultation-sent', params: { userId: lawyer.userId } })}
        >
          <LinearGradient colors={Colors.goldGradient} style={styles.ctaGradient}>
            <Text style={styles.ctaButtonText}>Book Consultation</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { fontFamily: 'Outfit_600SemiBold', fontSize: 16, color: 'rgba(255,255,255,0.5)', marginTop: 12 },
  outerContainer: { flex: 1, backgroundColor: '#020617' },
  container: { flex: 1 },
  imageContainer: { width: '100%', height: 480, position: 'relative' },
  image: { width: '100%', height: '100%', resizeMode: 'cover' },
  backButtonSafeArea: { position: 'absolute', top: 0, left: 0, right: 0 },
  headerActions: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 10 },
  headerButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(0,0,0,0.3)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  favoriteActive: { backgroundColor: 'white' },
  
  floatingBadge: { position: 'absolute', bottom: 40, right: 24, borderRadius: 20, overflow: 'hidden', elevation: 5 },
  badgeGradient: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 8, gap: 6 },
  badgeText: { fontFamily: 'Outfit_700Bold', fontSize: 12, color: Colors.deepBlue, letterSpacing: 1 },
  
  content: { backgroundColor: '#020617', borderTopLeftRadius: 32, borderTopRightRadius: 32, marginTop: -32, padding: 24, paddingBottom: 150 },
  mainInfo: { marginBottom: 30 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  name: { fontFamily: 'Outfit_700Bold', fontSize: 32, color: Colors.white },
  titleBadge: { width: 24, height: 24, borderRadius: 12, backgroundColor: 'rgba(212, 175, 55, 0.1)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(212, 175, 55, 0.3)' },
  practice: { fontFamily: 'Outfit_600SemiBold', fontSize: 18, color: Colors.gold, marginTop: 2 },
  metaRow: { flexDirection: 'row', gap: 16, marginTop: 12 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { fontFamily: 'Outfit_400Regular', fontSize: 14, color: 'rgba(255,255,255,0.5)' },
  
  section: { marginBottom: 30 },
  sectionTitle: { fontFamily: 'Outfit_700Bold', fontSize: 20, color: Colors.white, marginBottom: 12 },
  bio: { fontFamily: 'Outfit_400Regular', fontSize: 16, color: 'rgba(255,255,255,0.6)', lineHeight: 24 },
  
  tagCloud: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tag: { backgroundColor: 'rgba(255,255,255,0.05)', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  tagText: { fontFamily: 'Outfit_600SemiBold', fontSize: 13, color: Colors.white },
  
  socialRow: { flexDirection: 'row', gap: 15 },
  socialCircle: { width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  
  disclaimerSection: { flexDirection: 'row', gap: 10, marginTop: 20, opacity: 0.5 },
  disclaimer: { flex: 1, fontFamily: 'Outfit_400Regular', fontSize: 12, color: 'white', lineHeight: 18 },
  
  actionFooter: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', padding: 24, gap: 15, backgroundColor: '#020617', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)', paddingBottom: Platform.OS === 'ios' ? 40 : 24 },
  messageButton: { width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  ctaButton: { flex: 1, height: 60, borderRadius: 30, overflow: 'hidden' },
  ctaGradient: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  ctaButtonText: { fontFamily: 'Outfit_700Bold', fontSize: 16, color: Colors.deepBlue },
});
