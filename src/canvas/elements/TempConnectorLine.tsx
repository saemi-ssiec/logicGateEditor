import React, { useMemo } from 'react';
import { Line } from 'react-konva';
import { Position } from '../../core/types';
import { calculateOrthogonalPath } from '../../utils/orthogonalRouting';

interface TempConnectorLineProps {
  from: Position;
  to: Position;
  fromDirection?: 'left' | 'right';
  toDirection?: 'left' | 'right';
}

const TempConnectorLine: React.FC<TempConnectorLineProps> = ({
  from,
  to,
  fromDirection = 'right',
  toDirection = 'left'
}) => {
  const points = useMemo(() => {
    return calculateOrthogonalPath(
      from,
      to,
      fromDirection,
      toDirection,
      {
        offsetFromPort: 40
      }
    );
  }, [from, to, fromDirection, toDirection]);

  return (
    <Line
      points={points}
      stroke="#8b5cf6"
      strokeWidth={2}
      dash={[5, 5]}
      opacity={0.7}
      lineCap="round"
      lineJoin="round"
    />
  );
};

export default TempConnectorLine;