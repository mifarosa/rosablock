import React, { memo } from 'react';
import Svg, { Path } from 'react-native-svg';
import { gearPath } from '../utils/gearPath';

const PATH = gearPath();

/** The settings gear, drawn as a vector so it stays sharp and takes the theme's colors. */
function GearIcon({ size = 26, color }: { size?: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d={PATH}
        fill={color}
        fillRule="evenodd"
        stroke={color}
        strokeWidth={0.8}
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export default memo(GearIcon);
