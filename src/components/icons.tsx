import Svg, { Path, Line, Circle } from 'react-native-svg';

export function FlameIcon({ size = 14, color = '#FF7A45' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <Path d="M12 2c1 3-2 4-2 7a4 4 0 0 0 8 0c0-1-1-2-1-2 2 1 3 4 3 6a7 7 0 0 1-14 0c0-5 4-7 6-11z" />
    </Svg>
  );
}

export function StarIcon({ size = 22, color = '#C7FF4D' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M12 2l2.7 6.1L21 9l-5 4.6L17.4 21 12 17.6 6.6 21 8 13.6 3 9l6.3-.9z" />
    </Svg>
  );
}

export function TrophyIcon({ size = 22, color = '#8B8E97' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M8 21h8M12 17v4M7 4h10v4a5 5 0 0 1-10 0V4zM5 4h2v3a3 3 0 0 1-3-3zM19 4h-2v3a3 3 0 0 0 3-3z" />
    </Svg>
  );
}

export function BoardIcon({ size = 22, color = '#6B6E77' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Line x1="4" y1="20" x2="4" y2="14" />
      <Line x1="12" y1="20" x2="12" y2="8" />
      <Line x1="20" y1="20" x2="20" y2="4" />
    </Svg>
  );
}

export function LogIcon({ size = 22, color = '#6B6E77' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Circle cx="12" cy="12" r="9" />
      <Line x1="12" y1="8" x2="12" y2="16" />
      <Line x1="8" y1="12" x2="16" y2="12" />
    </Svg>
  );
}

export function ProfileIcon({ size = 22, color = '#6B6E77' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Circle cx="12" cy="8" r="4" />
      <Path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
    </Svg>
  );
}

export function PlusIcon({ size = 40, color = '#12140C' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
      <Line x1="12" y1="5" x2="12" y2="19" />
      <Line x1="5" y1="12" x2="19" y2="12" />
    </Svg>
  );
}
