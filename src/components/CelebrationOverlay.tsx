import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';
import { FlameIcon } from './icons';

const PARTICLE_COLORS = [colors.accent, colors.streak, '#FFFFFF'];
const PARTICLE_COUNT = 26;

type Particle = {
  angle: number;
  distance: number;
  size: number;
  color: string;
  rotateTo: number;
};

function makeParticles(): Particle[] {
  return Array.from({ length: PARTICLE_COUNT }, (_, i) => {
    const angle = (Math.PI * 2 * i) / PARTICLE_COUNT + (Math.random() - 0.5) * 0.6;
    return {
      angle,
      distance: 90 + Math.random() * 110,
      size: 6 + Math.random() * 7,
      color: PARTICLE_COLORS[i % PARTICLE_COLORS.length],
      rotateTo: (Math.random() - 0.5) * 720,
    };
  });
}

export default function CelebrationOverlay({ visible, onDone }: { visible: boolean; onDone: () => void }) {
  const particles = useRef(makeParticles());
  const progress = useRef(new Animated.Value(0)).current;
  const textScale = useRef(new Animated.Value(0.4)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) return;
    particles.current = makeParticles();
    progress.setValue(0);
    textScale.setValue(0.4);
    textOpacity.setValue(0);

    Animated.parallel([
      Animated.timing(progress, {
        toValue: 1,
        duration: 900,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(textOpacity, { toValue: 1, duration: 180, useNativeDriver: true }),
      Animated.spring(textScale, { toValue: 1, friction: 5, tension: 140, useNativeDriver: true }),
      Animated.sequence([
        Animated.delay(650),
        Animated.timing(textOpacity, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]),
    ]).start(() => onDone());
  }, [visible]);

  if (!visible) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {particles.current.map((p, i) => {
        const translateX = progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0, Math.cos(p.angle) * p.distance],
        });
        const translateY = progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0, Math.sin(p.angle) * p.distance + 36],
        });
        const opacity = progress.interpolate({ inputRange: [0, 0.7, 1], outputRange: [1, 1, 0] });
        const rotate = progress.interpolate({ inputRange: [0, 1], outputRange: ['0deg', `${p.rotateTo}deg`] });

        return (
          <Animated.View
            key={i}
            style={[
              styles.particle,
              {
                width: p.size,
                height: p.size,
                marginLeft: -p.size / 2,
                marginTop: -p.size / 2,
                backgroundColor: p.color,
                opacity,
                transform: [{ translateX }, { translateY }, { rotate }],
              },
            ]}
          />
        );
      })}

      <Animated.View style={[styles.textWrap, { opacity: textOpacity, transform: [{ scale: textScale }] }]}>
        <FlameIcon size={20} />
        <Text style={styles.text}>Nice work!</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  particle: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    borderRadius: 2,
  },
  textWrap: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    marginTop: -150,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  text: {
    fontFamily: fonts.num,
    fontSize: 20,
    color: colors.textPrimary,
  },
});
