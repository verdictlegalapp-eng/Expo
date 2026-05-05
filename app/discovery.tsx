import React, { useState } from 'react';
import { 
  View, 
  StyleSheet, 
  Text, 
  SafeAreaView, 
  TouchableOpacity, 
  Dimensions, 
  StatusBar,
  ActivityIndicator,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { fetchLawyers } from '../lib/lawyerApi';
import SwipeCard from '../components/SwipeCard';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants/Colors';

const { width, height } = Dimensions.get('window');

export default function Discovery() {
  const [lawyers, setLawyers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  React.useEffect(() => {
    loadLawyers(true);
  }, []);

  const prefetchImages = (list: any[]) => {
    // Prefetch the next 5 images for smooth swiping
    list.slice(0, 5).forEach(lawyer => {
      if (lawyer.image) {
        Image.prefetch(lawyer.image).catch(() => {});
      }
    });
  };

  const loadLawyers = async (reset = false) => {
    if (isFetchingMore) return;
    try {
      if (reset) {
        setLoading(true);
        setPage(1);
      } else {
        setIsFetchingMore(true);
      }
      
      let userCity = '';
      let userState = '';
      try {
        const { fetchCurrentUser } = require('../lib/authApi');
        const user = await fetchCurrentUser();
        userCity = user.city || '';
        userState = user.state || '';
      } catch (e) {}

      const newPage = reset ? 1 : page + 1;
      const data = await fetchLawyers({ userCity, userState, page: newPage });
      
      setLawyers(prev => reset ? data : [...prev, ...data]);
      setPage(newPage);
      prefetchImages(data);
    } catch (e) {
      console.error('Failed to load lawyers:', e);
    } finally {
      setLoading(false);
      setIsFetchingMore(false);
    }
  };

  const handleSwipeLeft = () => {
    setLawyers((prev) => {
      const next = prev.slice(1);
      prefetchImages(next);
      if (next.length <= 5 && !isFetchingMore) {
        loadLawyers(false);
      }
      return next;
    });
  };

  const handleSwipeRight = (lawyer: any) => {
    setLawyers((prev) => {
      const next = prev.slice(1);
      prefetchImages(next);
      if (next.length <= 5 && !isFetchingMore) {
        loadLawyers(false);
      }
      return next;
    });
    if (lawyer.userId) {
      router.push({
        pathname: `/chat/${lawyer.userId}`,
        params: { name: lawyer.name, image: lawyer.image }
      });
    }
  };

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

      {/* Background Instructions */}
      <View style={styles.instructionsContainer}>
        <Ionicons name="search-outline" size={60} color="rgba(255,255,255,0.05)" style={styles.instructionIcon} />
        <Text style={styles.instructionTitle}>EVALUATE COUNSEL</Text>
        <View style={styles.instructionUnderline} />
        <Text style={styles.instructionText}>
          Review attorney profiles and connect with the ones that match your legal needs.
        </Text>
      </View>

      <View style={styles.cardsContainer}>
        {loading ? (
          <View style={styles.emptyState}>
            <ActivityIndicator color={Colors.gold} size="large" />
            <Text style={styles.emptyStateText}>Finding Attorneys...</Text>
          </View>
        ) : lawyers.length > 0 ? (
          lawyers.slice(0, 3).map((lawyer) => (
            <SwipeCard
              key={lawyer.id}
              lawyer={lawyer}
              onSwipeLeft={handleSwipeLeft}
              onSwipeRight={() => handleSwipeRight(lawyer)}
            />
          )).reverse()
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="location-outline" size={64} color="rgba(255,255,255,0.1)" />
            <Text style={styles.emptyStateText}>No attorneys found nearby.</Text>
            <TouchableOpacity onPress={loadLawyers} style={styles.retryBtn}>
              <Text style={styles.retryText}>Retry Search</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 10,
  },
  headerTitle: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 28,
    color: Colors.white,
  },
  refreshBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  instructionsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    zIndex: -1,
  },
  instructionIcon: {
    marginBottom: 16,
    transform: [{ rotate: '-5deg' }],
  },
  instructionTitle: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 22,
    color: 'rgba(255,255,255,0.1)',
    textAlign: 'center',
  },
  instructionUnderline: {
    width: 120,
    height: 3,
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    marginTop: 4,
    marginBottom: 24,
  },
  instructionText: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 15,
    color: 'rgba(255,255,255,0.2)',
    textAlign: 'center',
    lineHeight: 20,
  },
  cardsContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginTop: 0, 
    marginBottom: 0,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyStateText: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 18,
    color: 'rgba(255,255,255,0.4)',
    marginTop: 20,
    textAlign: 'center',
  },
  retryBtn: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  retryText: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 14,
    color: Colors.gold,
  }
});
