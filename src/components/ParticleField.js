import { useEffect, useRef } from 'react';
import { Animated, View, StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');
const COUNT = 14;

export default function ParticleField() {
  const particles = useRef(
    Array.from({ length: COUNT }, () => {
      const sx = Math.random() * width;
      const sy = Math.random() * height;
      return {
        x: new Animated.Value(sx),
        y: new Animated.Value(sy),
        size: 2 + Math.random() * 4,
        opacity: new Animated.Value(0.1 + Math.random() * 0.4),
        speed: 0.2 + Math.random() * 0.5,
        dir: Math.random() * Math.PI * 2,
        startX: sx,
        startY: sy,
      };
    })
  ).current;

  useEffect(() => {
    const anims = particles.map(p => {
      const dx = Math.cos(p.dir) * 50;
      const dy = Math.sin(p.dir) * 50;
      return Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(p.x, { toValue: p.startX + dx, duration: 3000 / p.speed, useNativeDriver: true }),
            Animated.timing(p.y, { toValue: p.startY + dy, duration: 3000 / p.speed, useNativeDriver: true }),
            Animated.timing(p.opacity, { toValue: 0.6, duration: 1500 / p.speed, useNativeDriver: true }),
          ]),
          Animated.parallel([
            Animated.timing(p.x, { toValue: p.startX, duration: 3000 / p.speed, useNativeDriver: true }),
            Animated.timing(p.y, { toValue: p.startY, duration: 3000 / p.speed, useNativeDriver: true }),
            Animated.timing(p.opacity, { toValue: 0.1, duration: 1500 / p.speed, useNativeDriver: true }),
          ]),
        ])
      );
    });
    anims.forEach(a => a.start());
    return () => anims.forEach(a => a.stop());
  }, []);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {particles.map((p, i) => (
        <Animated.View
          key={i}
          style={[
            styles.particle,
            {
              width: p.size,
              height: p.size,
              borderRadius: p.size / 2,
              opacity: p.opacity,
              transform: [
                { translateX: p.x },
                { translateY: p.y },
              ],
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  particle: {
    position: 'absolute',
    backgroundColor: '#a855f7',
  },
});
