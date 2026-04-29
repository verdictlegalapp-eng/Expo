import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/Colors';
import { deleteAccount } from '../lib/authApi';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function DeleteAccountScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    Alert.alert(
      "Final Confirmation",
      "Are you absolutely sure? This will permanently delete your profile, messages, and all legal data. This action CANNOT be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "DELETE EVERYTHING", 
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              const success = await deleteAccount();
              if (success) {
                await AsyncStorage.clear();
                Alert.alert("Account Deleted", "Your data has been completely removed from our systems.");
                router.replace('/');
              } else {
                Alert.alert("Error", "Failed to delete account. Please try again later.");
              }
            } catch (error) {
              Alert.alert("Error", "A connection error occurred.");
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.navy} />
        </TouchableOpacity>
        <Text style={styles.title}>Account Deletion</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.warningCard}>
          <Ionicons name="warning" size={48} color="#EF4444" style={styles.warningIcon} />
          <Text style={styles.warningTitle}>This is permanent</Text>
          <Text style={styles.warningText}>
            By deleting your account, you will lose access to:
          </Text>
          <View style={styles.bulletPoints}>
            <Text style={styles.bullet}>• Your professional profile and verification status</Text>
            <Text style={styles.bullet}>• All chat history and legal consultations</Text>
            <Text style={styles.bullet}>• Your saved favorites and connections</Text>
            <Text style={styles.bullet}>• Your phone number and email records</Text>
          </View>
        </View>

        <Text style={styles.infoText}>
          In accordance with our privacy policy and App Store guidelines, once you confirm deletion, all your personal data is wiped from our active databases.
        </Text>

        <TouchableOpacity 
          style={[styles.deleteButton, loading && { opacity: 0.7 }]} 
          onPress={handleDelete}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.deleteButtonText}>Delete My Account</Text>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.cancelButton} 
          onPress={() => router.back()}
          disabled={loading}
        >
          <Text style={styles.cancelButtonText}>I changed my mind</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 20,
    color: Colors.navy,
  },
  content: {
    padding: 24,
    alignItems: 'center',
  },
  warningCard: {
    width: '100%',
    backgroundColor: '#FEF2F2',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    marginBottom: 24,
  },
  warningIcon: {
    alignSelf: 'center',
    marginBottom: 16,
  },
  warningTitle: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 22,
    color: '#991B1B',
    textAlign: 'center',
    marginBottom: 12,
  },
  warningText: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 16,
    color: '#B91C1C',
    marginBottom: 16,
  },
  bulletPoints: {
    gap: 8,
  },
  bullet: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 14,
    color: '#7F1D1D',
  },
  infoText: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 40,
  },
  deleteButton: {
    width: '100%',
    backgroundColor: '#EF4444',
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  deleteButtonText: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 16,
    color: '#FFFFFF',
  },
  cancelButton: {
    padding: 12,
  },
  cancelButtonText: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 16,
    color: '#64748B',
  },
});
