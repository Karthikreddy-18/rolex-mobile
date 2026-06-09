import { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, Pressable, FlatList, StyleSheet, SafeAreaView,
  KeyboardAvoidingView, Platform, Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import useSpeak from '../hooks/useSpeak';

const BACKEND_URL = 'http://192.168.43.63:8000';

const WELCOME = [
  { id: 'welcome', text: "Hello! I'm Rolex. Ask me anything — I'm here to help.", sender: 'rolex' },
];

export default function ChatScreen() {
  const [messages, setMessages] = useState(WELCOME);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [speakingId, setSpeakingId] = useState(null);
  const listRef = useRef(null);
  const dotAnim = useRef(new Animated.Value(0)).current;
  const { speak, stop } = useSpeak();

  useEffect(() => {
    if (isTyping) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(dotAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
          Animated.timing(dotAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
        ])
      ).start();
    } else {
      dotAnim.setValue(0);
    }
  }, [isTyping]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = { id: String(Date.now()), text: input.trim(), sender: 'user' };
    setMessages(prev => [userMsg, ...prev]);
    setInput('');
    setIsTyping(true);

    try {
      const res = await fetch(`${BACKEND_URL}/api/search/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: input.trim(),
          history: messages.filter(m => m.id !== 'welcome').slice(0, 10).map(m => ({
            role: m.sender === 'user' ? 'user' : 'assistant',
            content: m.text,
          })),
        }),
      });
      const data = await res.json();
      setIsTyping(false);
      const reply = {
        id: String(Date.now() + 1),
        text: data.response || "Sorry, I couldn't reach the server.",
        sender: 'rolex',
      };
      setMessages(prev => [reply, ...prev]);
    } catch {
      setIsTyping(false);
      const reply = {
        id: String(Date.now() + 1),
        text: "Couldn't connect to the backend. Make sure it's running.",
        sender: 'rolex',
      };
      setMessages(prev => [reply, ...prev]);
    }
  };

  const handleSpeak = (msg) => {
    if (speakingId === msg.id) {
      stop();
      setSpeakingId(null);
    } else {
      stop();
      speak(msg.text, BACKEND_URL);
      setSpeakingId(msg.id);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0c1222', '#0f172a', '#0c1222']} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.avatarSmall}>
              <LinearGradient colors={['#a855f7', '#06b6d4']} style={styles.avatarGrad}>
                <Text style={styles.avatarText}>R</Text>
              </LinearGradient>
            </View>
            <View>
              <Text style={styles.headerName}>Rolex</Text>
              <Text style={styles.headerStatus}>Active now</Text>
            </View>
          </View>
          <Ionicons name="ellipsis-vertical" size={20} color="#64748b" />
        </View>

        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={item => item.id}
            inverted
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <View style={[styles.bubbleWrap, item.sender === 'user' ? styles.userWrap : styles.rolexWrap]}>
                {item.sender === 'rolex' && (
                  <View style={styles.bubbleAvatar}>
                    <LinearGradient colors={['#a855f7', '#06b6d4']} style={styles.bubbleAvatarGrad}>
                      <Text style={styles.bubbleAvatarText}>R</Text>
                    </LinearGradient>
                  </View>
                )}
                <View style={[styles.bubble, item.sender === 'user' ? styles.userBubble : styles.rolexBubble]}>
                  <LinearGradient
                    colors={item.sender === 'user'
                      ? ['#a855f7', '#9333ea']
                      : ['rgba(30,41,59,0.9)', 'rgba(30,41,59,0.7)']
                    }
                    style={styles.bubbleBg}
                  />
                  <View style={styles.bubbleContent}>
                    <Text style={[styles.bubbleText, item.sender === 'user' && styles.userText]}>
                      {item.text}
                    </Text>
                    {item.sender === 'rolex' && (
                      <Pressable onPress={() => handleSpeak(item)} style={styles.msgSpeakBtn}>
                        <Ionicons
                          name={speakingId === item.id ? 'pause-circle' : 'volume-high'}
                          size={18}
                          color={speakingId === item.id ? '#10b981' : '#64748b'}
                        />
                      </Pressable>
                    )}
                  </View>
                </View>
              </View>
            )}
            ListFooterComponent={isTyping ? (
              <View style={styles.typingIndicator}>
                <View style={[styles.typingDot, { opacity: dotAnim }]} />
                <View style={[styles.typingDot, { opacity: Animated.subtract(1, dotAnim) }]} />
                <View style={[styles.typingDot, { opacity: dotAnim }]} />
              </View>
            ) : null}
          />

          <View style={styles.inputWrap}>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Ask me anything with web search..."
                placeholderTextColor="#475569"
                value={input}
                onChangeText={setInput}
                onSubmitEditing={sendMessage}
              />
              <Pressable style={styles.sendBtn} onPress={sendMessage}>
                <LinearGradient colors={['#a855f7', '#06b6d4']} style={styles.sendGrad}>
                  <Ionicons name="send" size={18} color="#fff" />
                </LinearGradient>
              </Pressable>
            </View>
            <Pressable style={styles.voiceBtn}>
              <Ionicons name="mic" size={20} color="#a855f7" />
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: 'rgba(168,85,247,0.1)',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatarSmall: { width: 38, height: 38, borderRadius: 19, overflow: 'hidden' },
  avatarGrad: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  headerName: { color: '#f1f5f9', fontSize: 16, fontWeight: '600' },
  headerStatus: { color: '#10b981', fontSize: 12, fontWeight: '500' },
  flex: { flex: 1 },
  listContent: { padding: 16, paddingTop: 8 },
  bubbleWrap: { flexDirection: 'row', marginVertical: 5, alignItems: 'flex-end', gap: 8 },
  userWrap: { justifyContent: 'flex-end' },
  rolexWrap: { justifyContent: 'flex-start' },
  bubbleAvatar: { width: 28, height: 28, borderRadius: 14, overflow: 'hidden', marginBottom: 4 },
  bubbleAvatarGrad: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  bubbleAvatarText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  bubble: {
    maxWidth: '78%',
    padding: 14,
    borderRadius: 18,
    overflow: 'hidden',
  },
  bubbleBg: { ...StyleSheet.absoluteFillObject },
  userBubble: {
    borderBottomRightRadius: 4,
  },
  rolexBubble: {
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(168,85,247,0.15)',
  },
  bubbleContent: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
  },
  bubbleText: { fontSize: 15, color: '#f1f5f9', lineHeight: 22, flex: 1 },
  userText: { color: '#fff' },
  msgSpeakBtn: {
    width: 28, height: 28, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center',
  },
  typingIndicator: {
    flexDirection: 'row', gap: 4, paddingVertical: 12,
    paddingLeft: 40,
  },
  typingDot: {
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: '#a855f7',
  },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingBottom: 28, paddingTop: 8,
    gap: 8,
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(30,41,59,0.8)',
    borderRadius: 24,
    paddingLeft: 18, paddingRight: 4, paddingVertical: 4,
    borderWidth: 1, borderColor: 'rgba(168,85,247,0.2)',
  },
  input: {
    flex: 1, color: '#f1f5f9', fontSize: 15,
    paddingVertical: 8,
  },
  sendBtn: { width: 36, height: 36, borderRadius: 18, overflow: 'hidden' },
  sendGrad: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  voiceBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(168,85,247,0.12)',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(168,85,247,0.2)',
  },
});
