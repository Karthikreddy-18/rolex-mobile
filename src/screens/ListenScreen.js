import { useState, useRef, useEffect } from 'react';
import {
  View, Text, Pressable, StyleSheet, SafeAreaView, Animated, FlatList, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import GlowOrb from '../components/GlowOrb';
import AnimatedMic from '../components/AnimatedMic';
import SurrealWaveform from '../components/SurrealWaveform';
import ParticleField from '../components/ParticleField';
import useSpeak from '../hooks/useSpeak';

const { width } = Dimensions.get('window');
const STATES = { IDLE: 'idle', LISTENING: 'listening', PROCESSING: 'processing', SPEAKING: 'speaking' };
const BACKEND_URL = 'http://192.168.43.63:8000';

const COMMANDS = [
  { icon: 'musical-notes', label: 'Play music' },
  { icon: 'partly-sunny', label: 'Weather' },
  { icon: 'alarm', label: 'Set reminder' },
  { icon: 'time', label: 'What time?' },
  { icon: 'happy', label: 'Tell a joke' },
];

export default function ListenScreen() {
  const [state, setState] = useState(STATES.IDLE);
  const [statusText, setStatusText] = useState("Tap to speak");
  const [response, setResponse] = useState(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const subtitleOpacity = useRef(new Animated.Value(0.6)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const { speak, stop, isPlaying, isLoading } = useSpeak();

  const animateTransition = (cb) => {
    Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }).start(() => {
      cb();
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
    });
  };

  const fetchAI = async (query) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/search/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, history: [] }),
      });
      const data = await res.json();
      return data.response || "Sorry, I couldn't process that.";
    } catch {
      return "Couldn't reach the server. Make sure the backend is running.";
    }
  };

  const handlePress = () => {
    if (state === STATES.IDLE) {
      animateTransition(() => {
        setState(STATES.LISTENING);
        setStatusText('Listening...');
        setResponse(null);
      });
      setTimeout(async () => {
        animateTransition(() => {
          setState(STATES.PROCESSING);
          setStatusText('Thinking...');
        });
        const reply = await fetchAI("Give me a helpful response. What can you do?");
        animateTransition(() => {
          setState(STATES.SPEAKING);
          setStatusText("Rolex says:");
          setResponse(reply);
        });
        speak(reply, BACKEND_URL);
      }, 2000);
    } else {
      stop();
      animateTransition(() => {
        setState(STATES.IDLE);
        setStatusText("Tap to speak");
        setResponse(null);
      });
    }
  };

  useEffect(() => {
    if (state === STATES.IDLE) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(subtitleOpacity, { toValue: 0.3, duration: 2000, useNativeDriver: true }),
          Animated.timing(subtitleOpacity, { toValue: 0.6, duration: 2000, useNativeDriver: true }),
        ])
      ).start();
      return () => subtitleOpacity.stopAnimation?.();
    }
    subtitleOpacity.setValue(1);
  }, [state]);

  useEffect(() => {
    if (response) {
      slideAnim.setValue(30);
      Animated.timing(slideAnim, { toValue: 0, duration: 400, useNativeDriver: true }).start();
    }
  }, [response]);

  const handleSpeakToggle = () => {
    if (isPlaying) stop();
    else if (response) speak(response, BACKEND_URL);
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0c1222', '#0f172a', '#0c1222']} style={StyleSheet.absoluteFill} />
      <ParticleField />

      <View style={styles.orbContainer}>
        <GlowOrb
          size={state === STATES.LISTENING ? 180 : 120}
          color1={state === STATES.LISTENING ? '#06b6d4' : state === STATES.PROCESSING ? '#a855f7' : '#a855f7'}
          color2={state === STATES.LISTENING ? '#a855f7' : '#06b6d4'}
          pulse={state === STATES.IDLE || state === STATES.LISTENING}
        />
      </View>

      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <View style={styles.logoWrap}>
            <View style={styles.logoDot} />
            <Text style={styles.logo}>ROLEX</Text>
          </View>
          <View style={styles.statusDotWrap}>
            <View style={[styles.statusDot, { backgroundColor: state === STATES.LISTENING ? '#10b981' : '#64748b' }]} />
          </View>
        </View>

        <View style={styles.center}>
          <View style={styles.micSection}>
            <SurrealWaveform active={state === STATES.LISTENING} color="#06b6d4" />
            <View style={styles.micSpacer} />
            <AnimatedMic onPress={handlePress} state={state} />
          </View>

          <Animated.View style={[styles.statusSection, { opacity: fadeAnim }]}>
            <Text style={styles.statusPrimary}>{statusText}</Text>
            {state === STATES.IDLE && (
              <Animated.Text style={[styles.statusSub, { opacity: subtitleOpacity }]}>
                or say 'Hey Rolex'
              </Animated.Text>
            )}
          </Animated.View>

          {response && (
            <Animated.View style={[styles.responseCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
              <LinearGradient
                colors={['rgba(168,85,247,0.12)', 'rgba(6,182,212,0.08)']}
                style={styles.responseGradient}
              />
              <View style={styles.responseContent}>
                <Ionicons name="flash" size={16} color="#06b6d4" />
                <Text style={styles.responseText}>{response}</Text>
              </View>
              <View style={styles.responseActions}>
                <Pressable onPress={handleSpeakToggle} style={styles.speakBtn}>
                  <Ionicons
                    name={isPlaying ? 'pause-circle' : isLoading ? 'hourglass' : 'volume-high'}
                    size={24}
                    color={isPlaying ? '#10b981' : '#a855f7'}
                  />
                </Pressable>
              </View>
            </Animated.View>
          )}
        </View>

        <View style={styles.bottom}>
          <Text style={styles.bottomLabel}>RECENT</Text>
          <FlatList
            horizontal
            data={COMMANDS}
            keyExtractor={(_, i) => String(i)}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsWrap}
            renderItem={({ item }) => (
              <Pressable style={styles.chip}>
                <Ionicons name={item.icon} size={14} color="#a855f7" />
                <Text style={styles.chipLabel}>{item.label}</Text>
              </Pressable>
            )}
          />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1 },
  orbContainer: {
    position: 'absolute',
    top: '30%',
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  logoWrap: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoDot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: '#a855f7',
    shadowColor: '#a855f7',
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },
  logo: {
    fontSize: 18, fontWeight: '700', color: '#f1f5f9',
    letterSpacing: 3,
  },
  statusDotWrap: {
    width: 8, height: 8, borderRadius: 4,
  },
  statusDot: {
    width: 8, height: 8, borderRadius: 4,
    shadowColor: '#10b981',
    shadowOpacity: 0.6,
    shadowRadius: 4,
  },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 40 },
  micSection: { alignItems: 'center', justifyContent: 'center', height: 280 },
  micSpacer: { height: 20 },
  statusSection: { alignItems: 'center', marginTop: 8 },
  statusPrimary: {
    fontSize: 20, fontWeight: '600', color: '#f1f5f9',
    letterSpacing: 0.5,
  },
  statusSub: {
    fontSize: 14, color: '#64748b', marginTop: 6,
    letterSpacing: 0.3,
  },
  responseCard: {
    marginTop: 20, marginHorizontal: 24,
    borderRadius: 20, overflow: 'hidden',
    borderWidth: 1, borderColor: 'rgba(168,85,247,0.2)',
    maxWidth: width * 0.85,
  },
  responseGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  responseContent: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    padding: 18,
  },
  responseText: {
    fontSize: 15, color: '#e2e8f0', lineHeight: 22, flex: 1,
  },
  responseActions: {
    flexDirection: 'row', justifyContent: 'flex-end',
    paddingHorizontal: 14, paddingBottom: 10,
  },
  speakBtn: {
    width: 36, height: 36, borderRadius: 18,
    justifyContent: 'center', alignItems: 'center',
  },
  bottom: { paddingBottom: 12 },
  bottomLabel: {
    fontSize: 11, color: '#475569', letterSpacing: 2,
    paddingHorizontal: 24, marginBottom: 10, fontWeight: '600',
  },
  chipsWrap: { paddingHorizontal: 20, gap: 6 },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 16, paddingVertical: 10,
    backgroundColor: 'rgba(30,41,59,0.7)',
    borderRadius: 100,
    borderWidth: 1, borderColor: 'rgba(168,85,247,0.2)',
    marginRight: 6,
  },
  chipLabel: { color: '#cbd5e1', fontSize: 13, fontWeight: '500' },
});
