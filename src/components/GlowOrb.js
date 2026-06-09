import { useEffect, useRef } from 'react';
import { Animated, View, StyleSheet } from 'react-native';

export default function GlowOrb({ size = 160, color1 = '#a855f7', color2 = '#06b6d4', pulse = true }) {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    if (!pulse) {
      scale.setValue(1);
      opacity.setValue(0.6);
      return;
    }
    const anim = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(scale, { toValue: 1.15, duration: 2500, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0.3, duration: 2500, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(scale, { toValue: 1, duration: 2500, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0.6, duration: 2500, useNativeDriver: true }),
        ]),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [pulse]);

  return (
    <View style={[styles.wrap, { width: size * 2.5, height: size * 2.5 }]}>
      <Animated.View
        style={[
          styles.orb,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: color1,
            transform: [{ scale }],
            opacity,
            shadowColor: color1,
            shadowOpacity: 0.6,
            shadowRadius: size / 2,
          },
        ]}
      />
      <Animated.View
        style={[
          styles.orb2,
          {
            width: size * 0.6,
            height: size * 0.6,
            borderRadius: size * 0.3,
            backgroundColor: color2,
            opacity,
            transform: [{ scale: scale }],
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  orb: {
    position: 'absolute',
    elevation: 10,
  },
  orb2: {
    position: 'absolute',
    top: '20%',
    right: '15%',
  },
});
