import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';

export default function RoleSelection() {
  const router = useRouter();

  const handleSelectRole = (role: 'client' | 'attorney') => {
    router.push({ pathname: '/auth/login', params: { role } });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}>
          <Ionicons name="arrow-back" size={28} color="#0F172A" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.title}>Welcome to Verdict</Text>
        <Text style={styles.subtitle}>Please select how you want to use the platform.</Text>

        <View style={styles.cardsContainer}>
          <TouchableOpacity 
            style={styles.roleCard}
            onPress={() => handleSelectRole('client')}
            activeOpacity={0.8}
          >
            <View style={styles.iconCircle}>
              <Ionicons name="search" size={32} color="#273951" />
            </View>
            <View style={styles.cardTextContainer}>
              <Text style={styles.cardTitle}>Find an Attorney</Text>
              <Text style={styles.cardSubtitle}>I need legal representation or advice.</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#CBD5E1" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.roleCard}
            onPress={() => handleSelectRole('attorney')}
            activeOpacity={0.8}
          >
            <View style={styles.iconCircle}>
              <FontAwesome5 name="balance-scale" size={24} color="#273951" />
            </View>
            <View style={styles.cardTextContainer}>
              <Text style={styles.cardTitle}>I'm an Attorney</Text>
              <Text style={styles.cardSubtitle}>I want to provide legal services.</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#CBD5E1" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  content: {
    padding: 24,
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 32,
    color: '#0F172A',
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 16,
    color: '#475569',
    marginBottom: 48,
  },
  cardsContainer: {
    gap: 16,
  },
  roleCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: '#273951',
  },
  cardTextContainer: {
    flex: 1,
  },
  cardTitle: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 18,
    color: '#0F172A',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 14,
    color: '#475569',
  },
});
