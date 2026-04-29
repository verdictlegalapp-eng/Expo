import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';

interface PrivacyConsentProps {
  visible: boolean;
  onAgree: () => void;
  onDecline: () => void;
}

export default function PrivacyConsent({ visible, onAgree, onDecline }: PrivacyConsentProps) {
  const openPrivacyLink = () => {
    Linking.openURL('https://verdict.sbs/privacy');
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <Ionicons name="shield-checkmark" size={32} color={Colors.electricBlue} />
            </View>
            <Text style={styles.title}>Privacy Policy</Text>
          </View>

          <ScrollView style={styles.content}>
            <Text style={styles.paragraph}>
              Before you start, please review our Privacy Policy. We are committed to protecting your data and ensuring a secure experience.
            </Text>
            
            <Text style={styles.bulletTitle}>What we collect:</Text>
            <Text style={styles.bullet}>• Your email & phone for secure login</Text>
            <Text style={styles.bullet}>• Professional ID for attorney verification</Text>
            <Text style={styles.bullet}>• Profile images for identity</Text>

            <TouchableOpacity onPress={openPrivacyLink} style={styles.linkButton}>
              <Text style={styles.linkText}>Read Full Privacy Policy on Web</Text>
              <Ionicons name="open-outline" size={16} color={Colors.electricBlue} />
            </TouchableOpacity>

            <Text style={styles.note}>
              By clicking "I Agree", you consent to our terms of service and data processing as described in the policy.
            </Text>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.agreeButton} onPress={onAgree}>
              <Text style={styles.agreeText}>I Agree & Continue</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.declineButton} onPress={onDecline}>
              <Text style={styles.declineText}>Not Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 30,
    maxHeight: '80%',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F0F9FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 24,
    color: Colors.navy,
  },
  content: {
    marginBottom: 24,
  },
  paragraph: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: '#475569',
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 20,
  },
  bulletTitle: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 16,
    color: Colors.navy,
    marginBottom: 8,
  },
  bullet: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: '#64748B',
    marginBottom: 6,
    paddingLeft: 10,
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
    padding: 12,
    borderRadius: 12,
    marginVertical: 20,
    gap: 8,
  },
  linkText: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 14,
    color: Colors.electricBlue,
  },
  note: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  footer: {
    gap: 12,
  },
  agreeButton: {
    backgroundColor: Colors.navy,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  agreeText: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 16,
    color: '#FFFFFF',
  },
  declineButton: {
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  declineText: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 14,
    color: '#64748B',
  },
});
