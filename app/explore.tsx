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
  Dimensions
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';
import { fetchLawyers } from '../lib/lawyerApi';
import { LinearGradient } from 'expo-linear-gradient';

import { PRACTICE_AREAS } from '../constants/Legal';

const { width } = Dimensions.get('window');

export default function Explore() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [lawyers, setLawyers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safeArea}>
        
        {/* Header with Search */}
        <View style={styles.header}>
          <Text style={styles.title}>Explore Attorneys</Text>
          <View style={styles.searchWrapper}>
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color="#94A3B8" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search by name or practice..."
                placeholderTextColor="#94A3B8"
                value={searchQuery}
                onChangeText={(text) => {
                  setSearchQuery(text);
                  setIsSearching(true);
                }}
                onFocus={() => setIsSearching(true)}
                onBlur={() => setTimeout(() => setIsSearching(false), 200)} // Delay to allow click
              />
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
                    <MaterialCommunityIcons name={item.icon as any} size={20} color="#3B82F6" />
                    <Text style={styles.suggestionText}>{item.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* Suggestion / Categories List */}
        <View style={styles.categoriesSection}>
          <Text style={styles.sectionTitle}>Practice Areas</Text>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={PRACTICE_AREAS}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.categoriesList}
            renderItem={({ item }) => (
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
                    color={activeCategory === item.name ? '#FFFFFF' : '#3B82F6'} 
                />
                <Text style={[
                  styles.categoryText,
                  activeCategory === item.name && styles.categoryTextActive
                ]}>
                  {item.name}
                </Text>
              </TouchableOpacity>
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
              <Text style={styles.emptyStateText}>Loading attorneys...</Text>
            </View>
          ) : (
            <FlatList
              data={filteredLawyers}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.resultsList}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
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
                        <Ionicons name="location" size={14} color="#94A3B8" />
                        <Text style={styles.metaText}>{item.location}</Text>
                      </View>
                      <View style={styles.metaRow}>
                        <Ionicons name="ribbon" size={14} color="#3B82F6" />
                        <Text style={styles.metaTextHighlight}>{item.experience}</Text>
                      </View>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Ionicons name="search-outline" size={48} color="#CBD5E1" />
                  <Text style={styles.emptyStateText}>No attorneys match your search.</Text>
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
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    padding: 20,
    gap: 16,
    zIndex: 100, // Ensure header is above horizontal list
  },
  searchWrapper: {
    zIndex: 100,
  },
  title: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 28,
    color: '#0F172A',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  suggestionsDropdown: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderRadius: 16,
    padding: 8,
    gap: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 8,
    zIndex: 1000,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    gap: 12,
  },
  suggestionText: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 15,
    color: '#1E293B',
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontFamily: 'Outfit_400Regular',
    fontSize: 16,
    color: '#1E293B',
  },
  categoriesSection: {
    marginTop: 10,
  },
  sectionTitle: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 18,
    color: '#1E293B',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  categoriesList: {
    paddingHorizontal: 16,
    gap: 12,
  },
  categoryCard: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    alignItems: 'center',
    gap: 6,
    minWidth: 100,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  categoryCardActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  categoryText: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 13,
    color: '#64748B',
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },
  resultsSection: {
    flex: 1,
    marginTop: 24,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: 20,
  },
  resultsCount: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 13,
    color: '#94A3B8',
  },
  resultsList: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 100,
    gap: 16,
  },
  lawyerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowRadius: 10,
    elevation: 1,
  },
  lawyerImage: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
  },
  lawyerInfo: {
    flex: 1,
    marginLeft: 16,
    gap: 2,
  },
  lawyerName: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 16,
    color: '#0F172A',
  },
  lawyerPractice: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 13,
    color: '#64748B',
  },
  lawyerMeta: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 11,
    color: '#94A3B8',
  },
  metaTextHighlight: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 11,
    color: '#3B82F6',
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 60,
    gap: 12,
  },
  emptyStateText: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 15,
    color: '#94A3B8',
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
