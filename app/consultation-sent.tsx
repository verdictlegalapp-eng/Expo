import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function ConsultationSent() {
  const router = useRouter();
  const { userId } = useLocalSearchParams();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <FontAwesome5 name="check-circle" size={80} color="#273951" />
        </View>
        <Text style={styles.title}>Request Sent</Text>
        <Text style={styles.subtitle}>
          Your consultation request has been forwarded to the attorney. You&apos;ll be notified when they respond.
        </Text>

        <TouchableOpacity 
          style={styles.messageButton} 
          onPress={() => {
            if (userId) {
              router.push(`/chat/${userId}`);
            } else {
              router.push('/messages');
            }
          }}
        >
          <Ionicons name="chatbubbles-outline" size={24} color="#FFFFFF" />
          <Text style={styles.messageButtonText}>Message Attorney</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.browsingButton} 
          onPress={() => router.replace('/discovery')}
        >
          <Text style={styles.browsingButtonText}>Keep Browsing</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  iconContainer: {
    marginBottom: 32,
  },
  title: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 28,
    color: '#0F172A',
    marginBottom: 16,
  },
  subtitle: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 16,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 48,
  },
  messageButton: {
    backgroundColor: '#273951',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 30,
    width: '100%',
    marginBottom: 16,
    gap: 10,
    elevation: 4,
    shadowColor: '#273951',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  messageButtonText: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 18,
    color: '#FFFFFF',
  },
  browsingButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 18,
    borderRadius: 30,
    width: '100%',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  browsingButtonText: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 16,
    color: '#64748B',
  },
});
