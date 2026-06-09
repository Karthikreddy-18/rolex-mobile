import { useEffect, useRef } from 'react';
import { Pressable, Animated, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function AnimatedMic({ onPress, state }) {
  const pulse = useRef(new Animated.Value(1)).current;
  const ring1 = useRef(new Animated.Value(0)).current;
  const ring2 = useRef(new Animated.Value(0)).current;
  const rotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (state === 'idle') {
      const breathing = Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, { toValue: 1.06, duration: 2000, useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 1, duration: 2000, useNativeDriver: true }),
        ])
      );
      breathing.start();
      return () => breathing.stop();
    }
    pulse.setValue(1);
  }, [state]);

  useEffect(() => {
    if (state === 'listening') {
      const r1 = Animated.loop(
        Animated.sequence([
          Animated.timing(ring1, { toValue: 1, duration: 1800, useNativeDriver: true }),
          Animated.timing(ring1, { toValue: 0, duration: 0, useNativeDriver: true }),
        ])
      );
      const r2 = Animated.loop(
        Animated.sequence([
          Animated.timing(ring2, { toValue: 0, duration: 900, useNativeDriver: true }),
          Animated.timing(ring2, { toValue: 1, duration: 900, useNativeDriver: true }),
          Animated.timing(ring2, { toValue: 0, duration: 0, useNativeDriver: true }),
        ])
      );
      r1.start();
      r2.start();
      return () => { r1.stop(); r2.stop(); ring1.setValue(0); ring2.setValue(0); };
    }
  }, [state]);

  useEffect(() => {
    if (state === 'processing') {
      const spin = Animated.loop(
        Animated.timing(rotate, { toValue: 1, duration: 1200, useNativeDriver: true })
      );
      spin.start();
      return () => { spin.stop(); rotate.setValue(0); };
    }
  }, [state]);

  const ringScale = ring1.interpolate({ inputRange: [0, 1], outputRange: [1, 1.8] });
  const ringOpacity = ring1.interpolate({ inputRange: [0, 1], outputRange: [0.5, 0] });
  const ringScale2 = ring2.interpolate({ inputRange: [0, 1], outputRange: [1, 1.4] });
  const ringOpacity2 = ring2.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0] });
  const rotation = rotate.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  const bgColor = state === 'listening' ? '#06b6d4' : state === 'processing' ? '#a855f7' : 'rgba(168,85,247,0.85)';
  const shadowCol = state === 'listening' ? '#06b6d4' : '#a855f7';
  const iconSize = state === 'processing' ? 36 : 44;

  return (
    <Pressable onPress={onPress} style={styles.wrap}>
      <Animated.View style={[styles.ring, { transform: [{ scale: ringScale }], opacity: ringOpacity, borderColor: '#06b6d4' }]} />
      <Animated.View style={[styles.ring, { transform: [{ scale: ringScale2 }], opacity: ringOpacity2, borderColor: '#a855f7' }]} />
      <Animated.View
        style={[
          styles.button,
          {
            backgroundColor: bgColor,
            shadowColor: shadowCol,
            transform: [
              { scale: state === 'idle' ? pulse : 1 },
              { rotate: rotation },
            ],
          },
        ]}
      >
        <Ionicons
          name={
            state === 'processing' ? 'ellipsis-horizontal-circle' :
            state === 'listening' ? 'mic' : 'mic-outline'
          }
          size={iconSize}
          color="#fff"
        />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ring: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 2,
    borderColor: '#a855f7',
  },
  button: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 30,
    elevation: 12,
  },
});
