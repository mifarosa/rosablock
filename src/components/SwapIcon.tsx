import React, { memo } from 'react';
import Svg, { Path } from 'react-native-svg';

/** Two arrows going opposite ways: "move the buttons to the other side". */
function SwapIcon({ size = 20, color }: { size?: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M3.5 8H20.5 M16 3.5L20.5 8L16 12.5 M20.5 16H3.5 M8 11.5L3.5 16L8 20.5"
        fill="none"
        stroke={color}
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export default memo(SwapIcon);
