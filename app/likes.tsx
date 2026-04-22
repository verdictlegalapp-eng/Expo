import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  FlatList, 
  TouchableOpacity, 
  Image,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';
import { DUMMY_LAWYERS } from '../constants/Lawyers';

const { width } = Dimensions.get('window');

// For now, let's show all lawyers as 'liked' for demonstration purposes
// In a real app, this would be filtered by user swipes
const LIKED_LAWYERS = DUMMY_LAWYERS; 

export default function Likes() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
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
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.card}
              onPress={() => router.push(`/lawyer/${item.id}`)}
            >
              <Image source={{ uri: item.image }} style={styles.image} />
              <View style={styles.info}>
                <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.practice} numberOfLines={1}>{item.practice}</Text>
                
                <View style={styles.meta}>
                    <Ionicons name="location" size={12} color="#94A3B8" />
                    <Text style={styles.metaText}>{item.location.split(',')[0]}</Text>
                </View>
              </View>
              <View style={styles.badge}>
                <Ionicons name="heart" size={16} color="#3B82F6" />
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="heart-dislike-outline" size={60} color="#CBD5E1" />
              <Text style={styles.emptyStateText}>No likes yet. Start swiping!</Text>
              <TouchableOpacity 
                style={styles.swipeButton}
                onPress={() => router.replace('/discovery')}
              >
                <Text style={styles.swipeButtonText}>Go Discovery</Text>
              </TouchableOpacity>
            </View>
          }
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 28,
    color: '#0F172A',
  },
  subtitle: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 15,
    color: '#64748B',
    marginTop: 4,
  },
  grid: {
    padding: 12,
    paddingBottom: 100,
  },
  row: {
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  card: {
    width: (width - 60) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 160,
    resizeMode: 'cover',
  },
  info: {
    padding: 12,
    gap: 2,
  },
  name: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 15,
    color: '#0F172A',
  },
  practice: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 12,
    color: '#64748B',
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  metaText: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 11,
    color: '#94A3B8',
  },
  badge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 100,
    gap: 16,
  },
  emptyStateText: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 16,
    color: '#94A3B8',
  },
  swipeButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  swipeButtonText: {
    fontFamily: 'Outfit_700Bold',
    color: '#FFFFFF',
  },
  backFab: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    zIndex: 10,
  },
});
