import { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const BAR_COUNT = 11;
const BAR_WIDTH = 3;

export default function SurrealWaveform({ active, color = '#06b6d4' }) {
  const values = useRef(
    Array.from({ length: BAR_COUNT }, (_, i) => ({
      height: new Animated.Value(6 + ((i % 3) * 8)),
      opacity: new Animated.Value(0.3 + (i / BAR_COUNT) * 0.7),
    }))
  ).current;

  useEffect(() => {
    if (!active) {
      values.forEach(v => {
        v.height.setValue(6);
        v.opacity.setValue(0.2);
      });
      return;
    }
    const anims = values.map((v, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(v.height, { toValue: 20 + Math.random() * 50, duration: 600 + i * 80, useNativeDriver: true }),
            Animated.timing(v.opacity, { toValue: 0.7 + Math.random() * 0.3, duration: 600 + i * 80, useNativeDriver: true }),
          ]),
          Animated.parallel([
            Animated.timing(v.height, { toValue: 6 + Math.random() * 10, duration: 600 + i * 80, useNativeDriver: true }),
            Animated.timing(v.opacity, { toValue: 0.2 + Math.random() * 0.3, duration: 600 + i * 80, useNativeDriver: true }),
          ]),
        ])
      )
    );
    anims.forEach(a => a.start());
    return () => anims.forEach(a => a.stop());
  }, [active]);

  return (
    <View style={styles.container}>
      {values.map((v, i) => (
        <Animated.View
          key={i}
          style={[
            styles.bar,
            {
              backgroundColor: color,
              height: v.height,
              opacity: v.opacity,
              borderRadius: BAR_WIDTH / 2,
              shadowColor: color,
              shadowOpacity: 0.4,
              shadowRadius: 4,
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    height: 70,
    width: width * 0.6,
  },
  bar: {
    width: BAR_WIDTH,
    elevation: 4,
  },
});
