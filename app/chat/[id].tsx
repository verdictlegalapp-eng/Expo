import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  ensureChatSocket, 
  fetchMessages, 
  sendMessage as sendApiMessage, 
  fetchConversations,
  deleteMessage,
  clearConversation
} from '../../lib/chatApi';
import { fetchCurrentUser, fetchUserById } from '../../lib/authApi';
import { Colors } from '../../constants/Colors';

export default function ChatScreen() {
  const { id, name: initialName, image: initialImage } = useLocalSearchParams<{ id: string; name?: string; image?: string }>();
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [partner, setPartner] = useState({ name: initialName || '', image: initialImage || '' });
  const [loading, setLoading] = useState(true);
  const flatListRef = useRef<FlatList>(null);
  const router = useRouter();

  useEffect(() => {
    initChat();
    
    const refreshInterval = setInterval(async () => {
      try {
        const { messages: updatedMsgs } = await fetchMessages(id);
        setMessages(prev => {
          // Only update if the last message ID has changed
          const lastPrev = prev[prev.length - 1]?.id;
          const lastUpdated = updatedMsgs[updatedMsgs.length - 1]?.id;
          
          // Also update if we have an optimistic 'pending' message that needs to be replaced by the server version
          const hasPending = prev.some(m => m.pending);
          
          if (lastPrev !== lastUpdated || hasPending) {
            return updatedMsgs;
          }
          return prev;
        });
      } catch (e) {}
    }, 4000); // Slightly slower to ensure smoothness

    return () => clearInterval(refreshInterval);
  }, [id]);

  const initChat = async () => {
    try {
      setLoading(true);
      const user = await fetchCurrentUser();
      setCurrentUser(user);

      const { messages: initialMsgs } = await fetchMessages(id);
      setMessages(initialMsgs);

      if (!partner.name || partner.name === 'User') {
        try {
          const userData = await fetchUserById(id);
          if (userData) {
            setPartner({
              name: userData.name || 'User',
              image: userData.image || ''
            });
          }
        } catch (e) {
          const conversations = await fetchConversations();
          const thisConv = conversations.find(c => String(c.id) === String(id));
          if (thisConv) {
            setPartner({
              name: thisConv.name || thisConv.lawyerName || 'User',
              image: thisConv.image || thisConv.lawyerImage || ''
            });
          }
        }
      }

      const socket = await ensureChatSocket();
      socket.emit('join_room', id);
      socket.on('receive_message', (msg: any) => {
        setMessages((prev) => [...prev, msg]);
        setTimeout(() => flatListRef.current?.scrollToEnd(), 100);
      });
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!inputText.trim()) return;
    const text = inputText.trim();
    setInputText('');

    // Optimistic Update: Add message to UI immediately
    const optimisticMsg = {
      id: 'pending-' + Date.now(),
      text,
      senderId: currentUser?.id,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      pending: true,
      status: 'sent'
    };
    setMessages(prev => [...prev, optimisticMsg]);
    setTimeout(() => flatListRef.current?.scrollToEnd(), 50);

    try {
      await sendApiMessage(id, text);
      const socket = await ensureChatSocket();
      socket.emit('send_message', {
        conversationId: id,
        senderId: currentUser?.id,
        text,
      });
    } catch (err) {
    }
  };

  const handleDeleteMessage = (msgId: string) => {
    Alert.alert('Delete Message', 'Are you sure you want to delete this message?', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Delete', 
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteMessage(msgId);
            setMessages(prev => prev.filter(m => m.id !== msgId));
          } catch (e) {
            Alert.alert('Error', 'Could not delete message');
          }
        }
      }
    ]);
  };

  const handleClearChat = () => {
    Alert.alert('Clear Chat', 'Delete all messages in this conversation?', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Clear All', 
        style: 'destructive',
        onPress: async () => {
          try {
            await clearConversation(id);
            setMessages([]);
          } catch (e) {
            Alert.alert('Error', 'Could not clear chat');
          }
        }
      }
    ]);
  };

  const getInitials = (name: string) => {
    if (!name) return '??';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const renderMessage = ({ item }: { item: any }) => {
    const isMe = String(item.senderId || item.sender) === String(currentUser?.id);

    return (
      <TouchableOpacity 
        onLongPress={() => isMe && handleDeleteMessage(item.id)}
        activeOpacity={0.8}
        style={[styles.messageWrapper, isMe ? styles.myMessageWrapper : styles.partnerMessageWrapper]}
      >
        {!isMe && (
          <View>
            {partner.image && partner.image.startsWith('http') ? (
              <Image source={{ uri: partner.image }} style={styles.bubbleAvatar} />
            ) : (
              <View style={[styles.bubbleAvatar, styles.initialsAvatar, { backgroundColor: 'rgba(212, 175, 55, 0.1)' }]}>
                <Text style={[styles.initialsText, { fontSize: 12 }]}>{getInitials(partner.name)}</Text>
              </View>
            )}
          </View>
        )}
        <View style={styles.bubbleContainer}>
          <LinearGradient
            colors={isMe ? Colors.goldGradient : ['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.03)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.bubble, isMe ? styles.myBubble : styles.partnerBubble]}
          >
            <Text style={[styles.messageText, isMe ? styles.myMessageText : styles.partnerMessageText]}>
              {item.text}
            </Text>
            {isMe && (
              <View style={styles.statusContainer}>
                <Text style={styles.myTimestamp}>{item.time}</Text>
                <MaterialCommunityIcons 
                  name={item.pending ? "clock-outline" : "check-all"} 
                  size={14} 
                  color={item.pending ? "rgba(2, 6, 23, 0.4)" : Colors.deepBlue} 
                  style={styles.tick}
                />
              </View>
            )}
          </LinearGradient>
          {!isMe && <Text style={styles.partnerTimestamp}>{item.time}</Text>}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Stack.Screen options={{ headerShown: false }} />

      {/* Background */}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: '#020617' }]} />
      <LinearGradient
        colors={['rgba(212, 175, 55, 0.05)', 'transparent']}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
            <Ionicons name="chevron-back" size={24} color={Colors.white} />
          </TouchableOpacity>
          
          <View style={styles.headerCenter}>
            {partner.image && partner.image.startsWith('http') ? (
              <Image source={{ uri: partner.image }} style={styles.headerAvatar} />
            ) : (
              <View style={[styles.headerAvatar, styles.initialsAvatar]}>
                <Text style={styles.initialsText}>{getInitials(partner.name)}</Text>
              </View>
            )}
            <Text style={styles.headerName} numberOfLines={1}>{partner.name || 'User'}</Text>
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerBtn} onPress={handleClearChat}>
              <Ionicons name="trash-outline" size={20} color="#EF4444" />
            </TouchableOpacity>
          </View>
        </View>

        {loading ? (
          <View style={styles.loader}>
            <ActivityIndicator color={Colors.gold} />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item, index) => item.id || String(index)}
            renderItem={renderMessage}
            contentContainerStyle={styles.messageList}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
          />
        )}

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
          <View style={styles.inputWrapper}>
            <TouchableOpacity style={styles.inputActionBtn}>
              <Ionicons name="add" size={24} color={Colors.gold} />
            </TouchableOpacity>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Message"
                placeholderTextColor="rgba(255,255,255,0.4)"
                value={inputText}
                onChangeText={setInputText}
                multiline
              />
              <TouchableOpacity style={styles.emojiBtn}>
                <MaterialCommunityIcons name="emoticon-outline" size={24} color="rgba(255,255,255,0.3)" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={[styles.sendBtn, inputText.trim() ? styles.goldSendBtn : {}]} 
              onPress={inputText.trim() ? handleSend : () => {}}
            >
              {inputText.trim() ? (
                <LinearGradient colors={Colors.goldGradient} style={styles.sendGradient}>
                  <Ionicons name="send" size={20} color={Colors.deepBlue} />
                </LinearGradient>
              ) : (
                <View style={[styles.sendGradient, { backgroundColor: 'rgba(255,255,255,0.05)' }]}>
                  <Ionicons name="send" size={20} color="rgba(255,255,255,0.2)" />
                </View>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617' },
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  headerBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center' },
  headerCenter: { flex: 1, flexDirection: 'row', alignItems: 'center', marginHorizontal: 12 },
  headerAvatar: { width: 36, height: 36, borderRadius: 18, marginRight: 10 },
  initialsAvatar: { backgroundColor: 'rgba(212, 175, 55, 0.1)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: Colors.gold },
  initialsText: { color: Colors.gold, fontFamily: 'Outfit_700Bold', fontSize: 14 },
  headerName: { fontFamily: 'Outfit_700Bold', fontSize: 18, color: Colors.white },
  headerActions: { flexDirection: 'row', gap: 8 },
  messageList: { paddingHorizontal: 16, paddingVertical: 20, paddingBottom: 40 },
  messageWrapper: { flexDirection: 'row', marginBottom: 15, maxWidth: '85%' },
  myMessageWrapper: { alignSelf: 'flex-end', flexDirection: 'row-reverse' },
  partnerMessageWrapper: { alignSelf: 'flex-start' },
  bubbleAvatar: { width: 32, height: 32, borderRadius: 16, marginRight: 8, alignSelf: 'flex-end' },
  bubbleContainer: { maxWidth: '100%' },
  bubble: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20 },
  myBubble: { borderBottomRightRadius: 4 },
  partnerBubble: { borderBottomLeftRadius: 4 },
  messageText: { fontFamily: 'Outfit_400Regular', fontSize: 15, lineHeight: 22 },
  myMessageText: { color: Colors.deepBlue, fontWeight: '500' },
  partnerMessageText: { color: 'rgba(255,255,255,0.9)' },
  statusContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginTop: 2 },
  myTimestamp: { fontFamily: 'Outfit_400Regular', fontSize: 10, color: 'rgba(2, 6, 23, 0.4)' },
  tick: { marginLeft: 4 },
  partnerTimestamp: { fontFamily: 'Outfit_400Regular', fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 4, textAlign: 'left' },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 10,
  },
  inputActionBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center' },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 25,
    paddingHorizontal: 16,
    minHeight: 48,
    maxHeight: 100,
  },
  input: { flex: 1, color: Colors.white, fontFamily: 'Outfit_400Regular', fontSize: 15, paddingVertical: 8 },
  emojiBtn: { marginLeft: 8 },
  sendBtn: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  goldSendBtn: { overflow: 'hidden' },
  sendGradient: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
