import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  FlatList, 
  TouchableOpacity, 
  Image,
  Dimensions,
  StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';
import { DUMMY_LAWYERS } from '../constants/Lawyers';
import { Colors } from '../constants/Colors';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { ZoomIn } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

const LIKED_LAWYERS = DUMMY_LAWYERS; 

export default function Likes() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Background Glow */}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: '#020617' }]} />
      <LinearGradient
        colors={['rgba(212, 175, 55, 0.2)', 'rgba(212, 175, 55, 0.05)', 'transparent']}
        start={{ x: 1, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.safeArea}>
        
        <View style={styles.header}>
          <Text style={styles.title}>Liked Profiles</Text>
          <Text style={styles.subtitle}>Attorneys you've expressed interest in.</Text>
        </View>

        <FlatList
          data={LIKED_LAWYERS}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.grid}
          columnWrapperStyle={styles.row}
          showsVerticalScrollIndicator={false}
          renderItem={({ item, index }) => (
            <Animated.View entering={ZoomIn.delay(index * 100).springify()} style={{ width: (width - 48) / 2, marginBottom: 16 }}>
              <TouchableOpacity 
                style={[styles.card, { width: '100%', marginBottom: 0 }]}
                onPress={() => router.push(`/lawyer/${item.id}`)}
              >
                <Image source={{ uri: item.image }} style={styles.image} />
                <LinearGradient
                  colors={['transparent', 'rgba(2, 6, 23, 0.9)']}
                  style={styles.imageOverlay}
                />
                <View style={styles.info}>
                  <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
                  <Text style={styles.practice} numberOfLines={1}>{item.practice}</Text>
                  
                  <View style={styles.meta}>
                      <Ionicons name="location" size={12} color="rgba(255,255,255,0.4)" />
                      <Text style={styles.metaText}>{item.location.split(',')[0]}</Text>
                  </View>
                </View>
                <View style={styles.badge}>
                  <Ionicons name="heart" size={16} color={Colors.gold} />
                </View>
              </TouchableOpacity>
            </Animated.View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="heart-dislike-outline" size={64} color="rgba(255,255,255,0.1)" />
              <Text style={styles.emptyStateText}>No likes yet. Start swiping!</Text>
              <TouchableOpacity 
                style={styles.swipeButton}
                onPress={() => router.replace('/discovery')}
              >
                <LinearGradient
                  colors={Colors.goldGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.gradientBtn}
                >
                  <Text style={styles.swipeButtonText}>Go Discovery</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          }
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617' },
  safeArea: { flex: 1 },
  header: { paddingHorizontal: 24, paddingVertical: 20, gap: 4 },
  title: { fontFamily: 'Outfit_700Bold', fontSize: 28, color: Colors.white },
  subtitle: { fontFamily: 'Outfit_400Regular', fontSize: 15, color: 'rgba(255,255,255,0.4)' },
  grid: { padding: 16, paddingBottom: 100 },
  row: { justifyContent: 'space-between' },
  card: {
    width: (width - 48) / 2,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 24,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  image: { width: '100%', height: 180, resizeMode: 'cover' },
  imageOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  info: { padding: 12, position: 'absolute', bottom: 0, left: 0, right: 0 },
  name: { fontFamily: 'Outfit_700Bold', fontSize: 15, color: Colors.white },
  practice: { fontFamily: 'Outfit_400Regular', fontSize: 12, color: Colors.gold },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  metaText: { fontFamily: 'Outfit_600SemiBold', fontSize: 11, color: 'rgba(255,255,255,0.4)' },
  badge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(2, 6, 23, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  emptyState: { alignItems: 'center', marginTop: 100, gap: 16 },
  emptyStateText: { fontFamily: 'Outfit_600SemiBold', fontSize: 16, color: 'rgba(255,255,255,0.4)' },
  swipeButton: { width: 180, height: 48, borderRadius: 24, overflow: 'hidden', marginTop: 10 },
  gradientBtn: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  swipeButtonText: { fontFamily: 'Outfit_700Bold', color: Colors.deepBlue, fontSize: 14 },
});
