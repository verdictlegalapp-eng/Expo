import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, TextInput, FlatList, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';

// Mock data for chat
const MOCK_MESSAGES = [
  { id: '1', text: "Hello! I saw your consultation request.", sender: 'lawyer', time: '10:00 AM' },
  { id: '2', text: "Hi, yes! I need help with reviewing a startup incorporation document.", sender: 'client', time: '10:05 AM' },
  { id: '3', text: "I can certainly help with that. Have you already drafted the articles of incorporation?", sender: 'lawyer', time: '10:12 AM' },
  { id: '4', text: "Not yet, I was hoping you could guide me through it.", sender: 'client', time: '10:15 AM' },
];

export default function ChatScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  
  const [messages, setMessages] = useState(MOCK_MESSAGES);
  const [inputText, setInputText] = useState('');

  const sendMessage = () => {
    if (inputText.trim().length === 0) return;
    
    const newMessage = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'client',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages([...messages, newMessage]);
    setInputText('');
  };

  const renderMessage = ({ item }: { item: any }) => {
    const isClient = item.sender === 'client';
    return (
      <View style={[styles.messageWrapper, isClient ? styles.messageWrapperClient : styles.messageWrapperLawyer]}>
        {!isClient && (
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150' }} 
            style={styles.chatAvatar} 
          />
        )}
        <View style={[styles.messageBubble, isClient ? styles.messageBubbleClient : styles.messageBubbleLawyer]}>
          <Text style={[styles.messageText, isClient ? styles.messageTextClient : styles.messageTextLawyer]}>
            {item.text}
          </Text>
          <Text style={[styles.messageTime, isClient ? styles.messageTimeClient : styles.messageTimeLawyer]}>
            {item.time}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardView} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#1A365D" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Attorney Chat</Text>
            <Text style={styles.headerSubtitle}>Active Consultation</Text>
          </View>
          <TouchableOpacity style={styles.infoButton}>
            <Ionicons name="information-circle-outline" size={24} color="#1A365D" />
          </TouchableOpacity>
        </View>

        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.chatContainer}
          showsVerticalScrollIndicator={false}
        />

        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.attachButton}>
            <Ionicons name="add" size={24} color="#64748B" />
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            value={inputText}
            onChangeText={setInputText}
            multiline
          />
          <TouchableOpacity 
            style={[styles.sendButton, inputText.trim().length > 0 ? styles.sendButtonActive : null]} 
            onPress={sendMessage}
            disabled={inputText.trim().length === 0}
          >
            <Ionicons name="send" size={18} color={inputText.trim().length > 0 ? "#FFFFFF" : "#94A3B8"} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1F2937',
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  infoButton: {
    padding: 8,
    marginRight: -8,
  },
  headerTitleContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 18,
    color: '#0F172A',
  },
  headerSubtitle: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 12,
    color: '#1E3A8A',
    marginTop: 2,
  },
  chatContainer: {
    padding: 16,
    paddingBottom: 24,
  },
  messageWrapper: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-end',
  },
  messageWrapperClient: {
    justifyContent: 'flex-end',
  },
  messageWrapperLawyer: {
    justifyContent: 'flex-start',
  },
  chatAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  messageBubble: {
    maxWidth: '75%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  messageBubbleClient: {
    backgroundColor: '#F8FAFC',
    borderBottomRightRadius: 4,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  messageBubbleLawyer: {
    backgroundColor: '#1F2937',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 15,
    lineHeight: 22,
  },
  messageTextClient: {
    color: '#0F172A',
  },
  messageTextLawyer: {
    color: '#E2E8F0',
  },
  messageTime: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 11,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  messageTimeClient: {
    color: '#475569',
  },
  messageTimeLawyer: {
    color: '#64748B',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#1F2937',
    backgroundColor: '#FFFFFF',
  },
  attachButton: {
    padding: 10,
  },
  input: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    minHeight: 40,
    maxHeight: 100,
    marginHorizontal: 8,
    fontFamily: 'Outfit_400Regular',
    fontSize: 15,
    color: '#0F172A',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1F2937',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  sendButtonActive: {
    backgroundColor: '#1E3A8A',
  },
});
