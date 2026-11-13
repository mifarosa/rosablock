import React, { memo } from 'react';
import { StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useApp } from '../app/AppContext';
import {
  BACKGROUND_HEIGHT,
  BACKGROUND_WIDTH,
  backgroundShapes,
} from '../constants/backgrounds';

/** The theme's vector backdrop; sits behind everything and never takes touches. */
function ThemeBackground() {
  const { theme } = useApp();
  const shapes = backgroundShapes(theme.id);
  if (shapes.length === 0) return null;

  return (
    <Svg
      style={StyleSheet.absoluteFill}
      width="100%"
      height="100%"
      viewBox={`0 0 ${BACKGROUND_WIDTH} ${BACKGROUND_HEIGHT}`}
      preserveAspectRatio="xMidYMid slice"
      pointerEvents="none"
    >
      {shapes.map((shape, i) => (
        <Path
          key={i}
          d={shape.d}
          fill={shape.fill ?? 'none'}
          stroke={shape.stroke}
          strokeWidth={shape.strokeWidth}
          strokeLinecap="round"
          opacity={shape.opacity}
        />
      ))}
    </Svg>
  );
}

export default memo(ThemeBackground);
