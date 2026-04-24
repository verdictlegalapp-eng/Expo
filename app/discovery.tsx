import React, { useState } from 'react';
import { 
  View, 
  StyleSheet, 
  Text, 
  SafeAreaView, 
  TouchableOpacity, 
  Dimensions, 
  StatusBar 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { fetchLawyers } from '../lib/lawyerApi';
import SwipeCard from '../components/SwipeCard';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

export default function Discovery() {
  const [lawyers, setLawyers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  React.useEffect(() => {
    loadLawyers();
  }, []);

  const loadLawyers = async () => {
    try {
      setLoading(true);
      
      // Get current user location
      let userCity = '';
      let userState = '';
      try {
        const { fetchCurrentUser } = require('../lib/authApi');
        const user = await fetchCurrentUser();
        userCity = user.city || '';
        userState = user.state || '';
      } catch (e) {
        console.warn('Could not fetch user location for sorting');
      }

      const data = await fetchLawyers({ userCity, userState });
      setLawyers(data);
    } catch (e) {
      console.error('Failed to load lawyers:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSwipeLeft = () => {
    setLawyers((prev) => prev.slice(1));
  };

  const handleSwipeRight = (id: string) => {
    setLawyers((prev) => prev.slice(1));
    router.push('/consultation-sent');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Background Instructions (Visible when cards are swiped) */}
      <View style={styles.instructionsContainer}>
        <Ionicons name="hand-right-outline" size={60} color="#E2E8F0" style={styles.instructionIcon} />
        <Text style={styles.instructionTitle}>SLIDE LEFT TO PASS</Text>
        <View style={styles.instructionUnderline} />
        <Text style={styles.instructionText}>
          If you don't Like them, simply pass. No one has to know you said Nope.
        </Text>
      </View>

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.cardsContainer}>
          {loading ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>Loading attorneys...</Text>
            </View>
          ) : lawyers.length > 0 ? (
            lawyers.map((lawyer, index) => (
              <SwipeCard
                key={lawyer.id}
                lawyer={lawyer}
                onSwipeLeft={index === 0 ? handleSwipeLeft : () => {}}
                onSwipeRight={index === 0 ? () => handleSwipeRight(lawyer.id) : () => {}}
              />
            )).reverse()
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No attorneys found in your area.</Text>
            </View>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  safeArea: {
    flex: 1,
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
    color: '#CBD5E1',
    textAlign: 'center',
  },
  instructionUnderline: {
    width: 120,
    height: 3,
    backgroundColor: '#F1F5F9',
    marginTop: 4,
    marginBottom: 24,
  },
  instructionText: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 15,
    color: '#E2E8F0',
    textAlign: 'center',
    lineHeight: 20,
  },
  cardsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 100, // Extra space for floating nav
  },
  emptyState: {
    alignItems: 'center',
  },
  emptyStateText: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 16,
    color: '#64748B',
  },
});
