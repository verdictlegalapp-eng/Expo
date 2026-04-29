import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  TextInput, 
  FlatList, 
  Image, 
  KeyboardAvoidingView, 
  Platform,
  Keyboard,
  Alert,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { fetchMessages, sendMessage as sendChatMsg, ensureChatSocket } from '../../lib/chatApi';
import { fetchCurrentUser } from '../../lib/authApi';
import { Colors } from '../../constants/Colors';

/** Expo Router can pass `string | string[]` for dynamic segments. */
function oneSearchParam(p: string | string[] | undefined): string {
  if (p == null) return '';
  return Array.isArray(p) ? (p[0] ?? '') : String(p);
}

export default function ChatScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const peerUserId = oneSearchParam(params.id as string | string[] | undefined);
  const partnerName = oneSearchParam(params.name as string | string[] | undefined);
  const flatListRef = useRef<FlatList>(null);
  
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [socketAvailable, setSocketAvailable] = useState(true);

  useEffect(() => {
    loadChat();
  }, [peerUserId]);

  useEffect(() => {
    let cancelled = false;
    let attached: Awaited<ReturnType<typeof ensureChatSocket>> | undefined;

    const handler = (msg: any) => {
      const incomingSender = msg.sender ?? msg.senderId;
      setMessages((prev) => {
        if (prev.some((m) => String(m.id) === String(msg.id))) return prev;
        const optimistic = prev.find(
          (m) =>
            m.isOptimistic &&
            m.text === msg.text &&
            String(m.sender) === String(incomingSender),
        );
        if (optimistic) {
          return prev.map((m) =>
            m.id === optimistic.id
              ? {
                  ...msg,
                  id: msg.id ?? m.id,
                  sender: incomingSender,
                  time: msg.time || m.time,
                  createdAt: msg.createdAt ? new Date(msg.createdAt) : m.createdAt,
                  isOptimistic: false,
                }
              : m,
          );
        }
        return [
          ...prev,
          {
            ...msg,
            sender: incomingSender,
            createdAt: msg.createdAt ? new Date(msg.createdAt) : undefined,
          },
        ];
      });
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    };

    ensureChatSocket()
      .then((socket) => {
        if (cancelled) return;
        attached = socket;
        setSocketAvailable(true);
        // #region agent log
        if (__DEV__) console.warn('[debug-890d74] socket attached', { peerUserId });
        // #endregion
        socket.on('receive_message', handler);
      })
      .catch((e) => {
        setSocketAvailable(false);
        console.warn('Chat socket:', e);
      });

    return () => {
      cancelled = true;
      attached?.off('receive_message', handler);
    };
  }, [peerUserId]);

  useEffect(() => {
    if (!conversationId) return;
    let cancelled = false;
    (async () => {
      try {
        const socket = await ensureChatSocket();
        if (cancelled) return;
        socket.emit('join_room', conversationId);
        // #region agent log
        if (__DEV__) console.warn('[debug-890d74] join_room emitted', { conversationId });
        // #endregion
      } catch (e) {
        console.warn('join_room:', e);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [conversationId]);

  useEffect(() => {
    if (!peerUserId) return;
    const id = setInterval(async () => {
      try {
        const synced = await fetchMessages(peerUserId);
        setMessages((prev) => {
          const prevLast = prev[prev.length - 1]?.id;
          const nextLast = synced.messages[synced.messages.length - 1]?.id;
          if (synced.messages.length !== prev.length) return synced.messages;
          if (String(prevLast ?? '') !== String(nextLast ?? '')) return synced.messages;
          return prev;
        });
        if (synced.conversationId) setConversationId(synced.conversationId);
      } catch {
        // Silent: background refresh should not interrupt typing.
      }
    }, 3500);
    return () => clearInterval(id);
  }, [peerUserId]);

  const loadChat = async () => {
    try {
      const user = await fetchCurrentUser();
      setCurrentUser(user);
      if (!peerUserId) {
        Alert.alert(
          'Cannot open chat',
          'No contact was selected. Go back and open the conversation again from Messages or the attorney profile.',
        );
        return;
      }
      const { messages: msgs, conversationId: convId } = await fetchMessages(peerUserId);
      setMessages(msgs);
      setConversationId(convId || null);
      // #region agent log
      if (__DEV__) console.warn('[debug-890d74] loadChat result', { peerUserId, count: msgs.length, convId: convId || null });
      // #endregion
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: false }), 200);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to load messages';
      Alert.alert('Chat', msg);
      console.log('Chat load error:', e);
    }
  };

  const handleSend = async () => {
    if (!inputText.trim() || !peerUserId) return;
    if (String(peerUserId) === String(currentUser?.id)) {
      Alert.alert('Chat', 'Cannot send a message to your own account.');
      return;
    }
    const text = inputText;
    const tempId = Date.now().toString();
    try {
      setInputText('');

      const newMsg = {
        id: tempId,
        text,
        sender: currentUser?.id,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        createdAt: new Date(),
        isOptimistic: true
      };
      setMessages(prev => [...prev, newMsg]);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);

      const result = await sendChatMsg(peerUserId, text);
      const serverId = result?.id ?? result?._id ?? result?.message?.id ?? result?.messageId;
      const cid =
        result?.conversationId ??
        result?.conversation?.id ??
        result?.chatId;
      // #region agent log
      if (__DEV__) console.warn('[debug-890d74] handleSend response', { hasServerId: !!serverId, cid: cid ?? null });
      // #endregion
      if (cid != null && String(cid).length > 0) {
        setConversationId(String(cid));
      }
      if (serverId != null) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === tempId
              ? { ...m, id: String(serverId), isOptimistic: false }
              : m,
          ),
        );
      } else {
        setMessages((prev) =>
          prev.map((m) => (m.id === tempId ? { ...m, isOptimistic: false } : m)),
        );
      }

      // Live API may not provide socket delivery/conversationId; re-sync via REST.
      const synced = await fetchMessages(peerUserId);
      setMessages(synced.messages);
      if (synced.conversationId) {
        setConversationId(synced.conversationId);
      }
    } catch (e) {
      setInputText(text);
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      const msg = e instanceof Error ? e.message : 'Failed to send message';
      Alert.alert('Send failed', msg);
    }
  };

  const renderMessage = ({ item, index }: { item: any, index: number }) => {
    const isMe = String(item.sender) === String(currentUser?.id);
    const showDate = index === 0 || isNewDay(messages[index - 1].createdAt || messages[index-1].time, item.createdAt || item.time);

    return (
      <View>
        {showDate && (
          <View style={styles.dateHeader}>
            <Text style={styles.dateText}>{formatDateHeader(item.createdAt || new Date())}</Text>
          </View>
        )}
        <View style={[styles.msgRow, isMe ? styles.msgRight : styles.msgLeft]}>
          {isMe ? (
            <LinearGradient
              colors={['#2395DB', '#518CA6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.bubble, styles.bubbleMe]}
            >
              <Text style={styles.msgTextMe}>{item.text}</Text>
              <View style={styles.messageFooter}>
                <Text style={styles.timeTextMe}>{item.time}</Text>
                <Ionicons 
                  name="checkmark-done" 
                  size={14} 
                  color={item.isOptimistic ? "rgba(255,255,255,0.5)" : "#FFF"} 
                  style={{ marginLeft: 4 }} 
                />
              </View>
            </LinearGradient>
          ) : (
            <View style={[styles.bubble, styles.bubbleThem]}>
              {!isMe && index > 0 && String(messages[index - 1].sender) === String(item.sender) ? null : (
                 <Text style={styles.senderName}>Partner</Text>
              )}
              <Text style={styles.msgTextThem}>{item.text}</Text>
              <View style={styles.messageFooter}>
                <Text style={styles.timeTextThem}>{item.time}</Text>
              </View>
            </View>
          )}
        </View>
      </View>
    );
  };

  const isNewDay = (prevDate: any, currDate: any) => {
    const d1 = new Date(prevDate);
    const d2 = new Date(currDate);
    return d1.toDateString() !== d2.toDateString();
  };

  const formatDateHeader = (date: any) => {
    const d = new Date(date);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (d.toDateString() === today.toDateString()) return 'Today';
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return d.toLocaleDateString([], { day: 'numeric', month: 'short' });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
            <Ionicons name="chevron-back" size={28} color="#0F172A" />
          </TouchableOpacity>
          <View style={styles.headerUser}>
            <Image 
              source={{ uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(partnerName || 'U')}&background=0D8ABC&color=fff` }} 
              style={styles.avatar} 
            />
            <View style={styles.headerInfo}>
              <Text style={styles.headerTitle} numberOfLines={1}>
                {partnerName || 'Legal Counsel'}
              </Text>
              <View style={styles.onlineStatus}>
                <View style={styles.statusDot} />
                <Text style={styles.headerStatus}>Active Now</Text>
              </View>
            </View>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerBtn}>
              <Ionicons name="call-outline" size={22} color="#0F172A" />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.headerBtn, { marginLeft: 15 }]}>
              <Ionicons name="videocam-outline" size={24} color="#0F172A" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item, index) => item.id || index.toString()}
          renderItem={renderMessage}
          contentContainerStyle={styles.list}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          showsVerticalScrollIndicator={false}
        />

        <View style={styles.inputWrapper}>
          <View style={styles.inputBar}>
            <TouchableOpacity style={styles.attachBtn}>
              <Ionicons name="add" size={28} color={Colors.mutedBlue} />
            </TouchableOpacity>
            <TextInput
              style={styles.input}
              placeholder="Message..."
              placeholderTextColor="#94A3B8"
              value={inputText}
              onChangeText={setInputText}
              multiline
            />
            {inputText.trim() ? (
              <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
                <LinearGradient colors={['#2395DB', '#1D2433']} style={styles.sendIconCircle}>
                  <Ionicons name="arrow-up" size={20} color="#FFF" />
                </LinearGradient>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.actionBtn}>
                <Ionicons name="mic-outline" size={24} color={Colors.mutedBlue} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { 
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'android' ? 40 : 10,
    paddingBottom: 15,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerBtn: {
    padding: 5,
  },
  headerUser: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  headerInfo: {
    marginLeft: 12,
  },
  headerTitle: {
    color: '#0F172A',
    fontSize: 18,
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Outfit_700Bold',
  },
  onlineStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
    marginRight: 6,
  },
  headerStatus: {
    color: '#10B981',
    fontSize: 12,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  list: { 
    paddingHorizontal: 20, 
    paddingTop: 20, 
    paddingBottom: 100 
  },
  dateHeader: { 
    alignItems: 'center', 
    marginVertical: 20 
  },
  dateText: { 
    fontSize: 12, 
    color: '#94A3B8', 
    fontWeight: '600',
    letterSpacing: 1,
  },
  msgRow: { 
    flexDirection: 'row', 
    marginBottom: 10, 
    width: '100%' 
  },
  msgLeft: { justifyContent: 'flex-start' },
  msgRight: { justifyContent: 'flex-end' },
  bubble: { 
    maxWidth: '85%', 
    paddingHorizontal: 16, 
    paddingVertical: 10, 
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  bubbleMe: { 
    borderBottomRightRadius: 4,
  },
  bubbleThem: { 
    backgroundColor: '#FFF', 
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  senderName: {
    fontSize: 10,
    color: '#518CA6',
    fontWeight: '700',
    marginBottom: 4,
  },
  msgTextMe: { fontSize: 16, color: '#FFF', lineHeight: 22 },
  msgTextThem: { fontSize: 16, color: '#1D2433', lineHeight: 22 },
  messageFooter: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'flex-end', 
    marginTop: 4 
  },
  timeTextMe: { fontSize: 10, color: 'rgba(255,255,255,0.7)' },
  timeTextThem: { fontSize: 10, color: '#94A3B8' },
  inputWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 15,
    paddingBottom: Platform.OS === 'ios' ? 30 : 15,
    backgroundColor: 'transparent',
  },
  inputBar: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 30,
    paddingHorizontal: 10,
    paddingVertical: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  input: {
    flex: 1,
    fontSize: 16,
    maxHeight: 100,
    paddingHorizontal: 12,
    color: '#1D2433',
  },
  attachBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtn: {
    marginLeft: 5,
  },
  sendIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  }
});
