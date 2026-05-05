import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TextInput, 
  FlatList, 
  TouchableOpacity, 
  Image,
  Dimensions,
  StatusBar,
  ActivityIndicator
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';
import { fetchLawyers } from '../lib/lawyerApi';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming, Easing, FadeInRight, FadeInUp } from 'react-native-reanimated';

import { PRACTICE_AREAS } from '../constants/Legal';
import { Colors } from '../constants/Colors';

const { width } = Dimensions.get('window');

export default function Explore() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [lawyers, setLawyers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const translateX = useSharedValue(-width);

  React.useEffect(() => {
    loadLawyers();
    translateX.value = withRepeat(
      withTiming(width, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
      -1,
      false
    );
  }, []);

  const animatedBorderStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }]
    };
  });

  const loadLawyers = async () => {
    try {
      setLoading(true);
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

  const filteredLawyers = lawyers.filter(lawyer => {
    const matchesSearch = lawyer.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          lawyer.practice.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !activeCategory || lawyer.practice.toLowerCase().includes(activeCategory.toLowerCase());
    return matchesSearch && matchesCategory;
  });

  const suggestions = PRACTICE_AREAS.filter(area => 
    area.name.toLowerCase().includes(searchQuery.toLowerCase()) && searchQuery.length > 0
  );

  const handleSelectSuggestion = (name: string) => {
    setSearchQuery(name);
    setActiveCategory(name);
    setIsSearching(false);
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

      <SafeAreaView style={styles.safeArea}>
        
        {/* Header with Search */}
        <View style={styles.header}>
          <Text style={styles.title}>Explore Attorneys</Text>
          <View style={styles.searchWrapper}>
            <View style={styles.animatedBorderWrapper}>
              <Animated.View style={[styles.gradientBorder, animatedBorderStyle]}>
                <LinearGradient
                  colors={['transparent', '#FFDF00', '#D4AF37', 'transparent']}
                  style={StyleSheet.absoluteFill}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0.5 }}
                />
              </Animated.View>
              <View style={styles.searchContainerInner}>
                <Ionicons name="search" size={20} color="rgba(255,255,255,0.4)" />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search by name or practice..."
                  placeholderTextColor="rgba(255,255,255,0.2)"
                  value={searchQuery}
                  onChangeText={(text) => {
                    setSearchQuery(text);
                    setIsSearching(true);
                  }}
                  onFocus={() => setIsSearching(true)}
                  onBlur={() => setTimeout(() => setIsSearching(false), 200)}
                />
              </View>
            </View>

            {/* Glass Autocomplete Suggestions */}
            {isSearching && suggestions.length > 0 && (
              <View style={styles.suggestionsDropdown}>
                {suggestions.map((item) => (
                  <TouchableOpacity 
                    key={item.id} 
                    style={styles.suggestionItem}
                    onPress={() => handleSelectSuggestion(item.name)}
                  >
                    <MaterialCommunityIcons name={item.icon as any} size={20} color={Colors.gold} />
                    <Text style={styles.suggestionText}>{item.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* Categories List */}
        <View style={styles.categoriesSection}>
          <Text style={styles.sectionTitle}>Practice Areas</Text>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={PRACTICE_AREAS}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.categoriesList}
            renderItem={({ item, index }) => (
              <Animated.View entering={FadeInRight.delay(index * 100).springify()}>
                <TouchableOpacity 
                  style={[
                    styles.categoryCard,
                    activeCategory === item.name && styles.categoryCardActive
                  ]}
                  onPress={() => setActiveCategory(activeCategory === item.name ? null : item.name)}
                >
                   <MaterialCommunityIcons 
                      name={item.icon as any} 
                      size={24} 
                      color={activeCategory === item.name ? Colors.deepBlue : Colors.gold} 
                  />
                  <Text style={[
                    styles.categoryText,
                    activeCategory === item.name && styles.categoryTextActive
                  ]}>
                    {item.name}
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            )}
          />
        </View>

        {/* Results List */}
        <View style={styles.resultsSection}>
          <View style={styles.resultsHeader}>
            <Text style={styles.sectionTitle}>Top Recommendations</Text>
            <Text style={styles.resultsCount}>{filteredLawyers.length} found</Text>
          </View>
          {loading ? (
            <View style={styles.emptyState}>
              <ActivityIndicator color={Colors.gold} size="large" />
              <Text style={styles.emptyStateText}>Loading Attorneys...</Text>
            </View>
          ) : (
            <FlatList
              data={filteredLawyers}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.resultsList}
              showsVerticalScrollIndicator={false}
              renderItem={({ item, index }) => (
                <Animated.View entering={FadeInUp.delay(index * 100).springify()}>
                  <TouchableOpacity 
                    style={styles.lawyerCard}
                    onPress={() => router.push(`/lawyer/${item.id}`)}
                  >
                    <Image source={{ uri: item.image }} style={styles.lawyerImage} />
                    <View style={styles.lawyerInfo}>
                      <Text style={styles.lawyerName}>{item.name}</Text>
                      <Text style={styles.lawyerPractice}>{item.practice}</Text>
                      <View style={styles.lawyerMeta}>
                        <View style={styles.metaRow}>
                          <Ionicons name="location" size={12} color="rgba(255,255,255,0.4)" />
                          <Text style={styles.metaText}>{item.location}</Text>
                        </View>
                        <View style={styles.metaRow}>
                          <Ionicons name="ribbon" size={12} color={Colors.gold} />
                          <Text style={styles.metaTextHighlight}>{item.experience}</Text>
                        </View>
                      </View>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.2)" />
                  </TouchableOpacity>
                </Animated.View>
              )}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Ionicons name="search-outline" size={64} color="rgba(255,255,255,0.1)" />
                  <Text style={styles.emptyStateText}>No attorneys found.</Text>
                </View>
              }
            />
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617' },
  safeArea: { flex: 1 },
  header: { paddingHorizontal: 24, paddingVertical: 16, gap: 16, zIndex: 100 },
  searchWrapper: { zIndex: 100 },
  title: { fontFamily: 'Outfit_700Bold', fontSize: 28, color: Colors.white },
  animatedBorderWrapper: {
    height: 56,
    borderRadius: 16,
    overflow: 'hidden',
    padding: 1.5,
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    justifyContent: 'center',
  },
  gradientBorder: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 200,
  },
  searchContainerInner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    borderRadius: 15,
    paddingHorizontal: 16,
  },
  searchInput: { flex: 1, marginLeft: 12, fontFamily: 'Outfit_400Regular', fontSize: 16, color: Colors.white },
  suggestionsDropdown: {
    position: 'absolute',
    top: 64,
    left: 0,
    right: 0,
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 8,
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
    zIndex: 1000,
  },
  suggestionItem: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 10, gap: 12 },
  suggestionText: { fontFamily: 'Outfit_600SemiBold', fontSize: 15, color: Colors.white },
  categoriesSection: { marginTop: 10 },
  sectionTitle: { fontFamily: 'Outfit_700Bold', fontSize: 18, color: Colors.white, paddingHorizontal: 24, marginBottom: 12 },
  categoriesList: { paddingHorizontal: 20, gap: 12 },
  categoryCard: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    gap: 6,
    minWidth: 100,
  },
  categoryCardActive: {
    backgroundColor: Colors.gold,
    borderColor: Colors.gold,
  },
  categoryText: { fontFamily: 'Outfit_600SemiBold', fontSize: 13, color: 'rgba(255,255,255,0.4)' },
  categoryTextActive: { color: Colors.deepBlue },
  resultsSection: { flex: 1, marginTop: 24 },
  resultsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, marginBottom: 12 },
  resultsCount: { fontFamily: 'Outfit_400Regular', fontSize: 13, color: 'rgba(255,255,255,0.4)' },
  resultsList: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 100, gap: 16 },
  lawyerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    padding: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  lawyerImage: { width: 64, height: 64, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.05)' },
  lawyerInfo: { flex: 1, marginLeft: 16, gap: 2 },
  lawyerName: { fontFamily: 'Outfit_700Bold', fontSize: 16, color: Colors.white },
  lawyerPractice: { fontFamily: 'Outfit_400Regular', fontSize: 13, color: Colors.gold },
  lawyerMeta: { flexDirection: 'row', gap: 12, marginTop: 4 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontFamily: 'Outfit_600SemiBold', fontSize: 11, color: 'rgba(255,255,255,0.4)' },
  metaTextHighlight: { fontFamily: 'Outfit_700Bold', fontSize: 11, color: Colors.gold },
  emptyState: { alignItems: 'center', marginTop: 60, gap: 12 },
  emptyStateText: { fontFamily: 'Outfit_600SemiBold', fontSize: 16, color: 'rgba(255,255,255,0.4)', textAlign: 'center' },
});
