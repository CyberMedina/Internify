import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Feather } from '@expo/vector-icons';

interface LevelAvatarProps {
  /** Horas totales acumuladas o nivel numérico si se usa el modo simple */
  level?: number;
  /** Progreso de 0 a 1. Si no se pasa, se calcula basado en la configuración interna si aplica */
  progress?: number;
  size?: number;
  imageUri?: string;
  icon?: keyof typeof Feather.glyphMap;
  /** Color forzado del anillo y badge. Si se omite, se calcula. */
  color?: string;
  /** Texto o contenido del badge pequeño. Si se omite, usa el nivel. */
  badgeContent?: string | React.ReactNode;
}

const LevelAvatar: React.FC<LevelAvatarProps> = ({
  level = 1,
  progress = 0,
  size = 50,
  imageUri,
  icon = 'user',
  color,
  badgeContent,
}) => {
  const strokeWidth = 3;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - progress * circumference;

  // Default color logic (fallback)
  const getLevelColor = (lvl: number) => {
    if (lvl < 10) return '#CD7F32';
    if (lvl < 20) return '#C0C0C0';
    if (lvl < 30) return '#FFD700';
    return '#E5E4E2';
  };

  const activeColor = color || getLevelColor(level);
  const activeBadge = badgeContent !== undefined ? badgeContent : level;

  return (
    <View style={{ width: size, height: size, position: 'relative' }}>
      {/* Progress Ring */}
      <Svg width={size} height={size} style={{ position: 'absolute', top: 0, left: 0, transform: [{ rotate: '-90deg' }] }}>
        {/* Background Circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255,255,255,0.2)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress Circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={activeColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </Svg>

      {/* Avatar Content */}
      <View
        style={{
          width: size - strokeWidth * 2 - 4,
          height: size - strokeWidth * 2 - 4,
          borderRadius: (size - strokeWidth * 2 - 4) / 2,
          backgroundColor: 'rgba(255,255,255,0.1)',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'absolute',
          top: strokeWidth + 2,
          left: strokeWidth + 2,
          overflow: 'hidden',
        }}
      >
        {imageUri ? (
          <Image
            source={{ uri: imageUri }}
            style={{
              width: '100%',
              height: '100%',
            }}
          />
        ) : (
          <Feather name={icon} size={size * 0.4} color="#fff" />
        )}
      </View>

      {/* Level Badge */}
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          right: 0,
          backgroundColor: activeColor,
          borderRadius: 10,
          minWidth: 18,
          height: 18,
          paddingHorizontal: 4,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 1.5,
          borderColor: '#fff',
        }}
      >
        <Text style={{ fontSize: 9, fontWeight: 'bold', color: '#000' }}>
          {activeBadge}
        </Text>
      </View>
    </View>
  );
};

export default LevelAvatar;
