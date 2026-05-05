import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { LinearGradient } from 'expo-linear-gradient';


export default function RoleSelection() {
  const router = useRouter();

  const handleSelectRole = (role: 'client' | 'attorney') => {
    router.push({ pathname: '/auth/login', params: { role } });
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={Colors.brandGradient}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={{ flex: 1 }}>

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.white} />
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
    </View>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center', borderWhite: 1, borderColor: 'rgba(255,255,255,0.1)' },
  content: {
    padding: 24,
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 32,
    color: Colors.white,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 16,
    color: Colors.subtext,
    marginBottom: 48,
  },
  cardsContainer: {
    gap: 16,
  },
  roleCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 24,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: Colors.gold,
  },
  cardTextContainer: {
    flex: 1,
  },
  cardTitle: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 20,
    color: Colors.white,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 14,
    color: Colors.subtext,
  },
});

