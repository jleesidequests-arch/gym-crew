import { useEffect, useRef } from 'react';
import { Animated, Dimensions, Easing, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';
import { FlameIcon } from './icons';

export default function StreakCelebration({
  visible,
  streak,
  onDone,
}: {
  visible: boolean;
  streak: number;
  onDone: () => void;
}) {
  const circleScale = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const contentScale = useRef(new Animated.Value(0.5)).current;
  const flamePulse = useRef(new Animated.Value(1)).current;
  const overlayOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!visible) return;

    circleScale.setValue(0);
    contentOpacity.setValue(0);
    contentScale.setValue(0.5);
    flamePulse.setValue(1);
    overlayOpacity.setValue(1);

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(flamePulse, {
          toValue: 1.2,
          duration: 260,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(flamePulse, {
          toValue: 0.94,
          duration: 220,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(flamePulse, {
          toValue: 1,
          duration: 180,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
      { iterations: 4 }
    );
    pulse.start();

    Animated.sequence([
      Animated.timing(circleScale, {
        toValue: 1,
        duration: 480,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(contentOpacity, { toValue: 1, duration: 260, useNativeDriver: true }),
        Animated.spring(contentScale, { toValue: 1, friction: 5, tension: 120, useNativeDriver: true }),
      ]),
      Animated.delay(750),
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 320,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start(() => {
      pulse.stop();
      onDone();
    });

    return () => pulse.stop();
  }, [visible]);

  if (!visible) return null;

  const { width, height } = Dimensions.get('window');
  const circleSize = Math.sqrt(width ** 2 + height ** 2) * 1.1;

  return (
    <Animated.View style={[StyleSheet.absoluteFill, { opacity: overlayOpacity }]} pointerEvents="none">
      <View style={styles.centerFill}>
        <Animated.View
          style={[
            styles.circle,
            {
              width: circleSize,
              height: circleSize,
              borderRadius: circleSize / 2,
              transform: [{ scale: circleScale }],
            },
          ]}
        />
      </View>

      <View style={styles.centerFill}>
        <Animated.View style={{ opacity: contentOpacity, transform: [{ scale: contentScale }], alignItems: 'center' }}>
          <Animated.View style={{ transform: [{ scale: flamePulse }] }}>
            <FlameIcon size={72} color={colors.streak} />
          </Animated.View>
          <Text style={styles.number}>{streak}</Text>
          <Text style={styles.label}>day streak</Text>
        </Animated.View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  centerFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    backgroundColor: colors.accent,
  },
  number: {
    fontFamily: fonts.num,
    fontSize: 76,
    lineHeight: 82,
    color: colors.accentText,
    marginTop: 4,
  },
  label: {
    fontFamily: fonts.bodySemibold,
    fontSize: 17,
    color: colors.accentText,
    letterSpacing: 0.5,
    marginTop: 2,
  },
});
