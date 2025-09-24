import React, { useMemo, useCallback } from 'react';
import { Line } from 'react-konva';
import { Position } from '../../core/types';
import { calculateOrthogonalPath } from '../../utils/orthogonalRouting';

interface ConnectorLineProps {
  from: Position;
  to: Position;
  selected?: boolean;
  onClick?: () => void;
  onDblClick?: (position: Position) => void;
  fromDirection?: 'left' | 'right';
  toDirection?: 'left' | 'right';
  customWaypoints?: Position[];
}

const ConnectorLine: React.FC<ConnectorLineProps> = ({
  from,
  to,
  selected = false,
  onClick,
  onDblClick,
  fromDirection = 'right',
  toDirection = 'left',
  customWaypoints = []
}) => {
  const points = useMemo(() => {
    return calculateOrthogonalPath(
      from,
      to,
      fromDirection,
      toDirection,
      {
        offsetFromPort: 40,
        customWaypoints
      }
    );
  }, [from, to, fromDirection, toDirection, customWaypoints]);

  const handleDblClick = useCallback((e: any) => {
    if (!onDblClick) return;

    // Get the click position relative to the stage
    const stage = e.target.getStage();
    const pointerPosition = stage.getPointerPosition();

    onDblClick(pointerPosition);
  }, [onDblClick]);

  return (
    <Line
      points={points}
      stroke={selected ? '#6366f1' : '#9ca3af'}
      strokeWidth={selected ? 3 : 2}
      lineCap="round"
      lineJoin="round"
      onClick={onClick}
      onDblClick={handleDblClick}
      hitStrokeWidth={10} // Make it easier to click on the line
      perfectDrawEnabled={false}
      shadowForStrokeEnabled={false}
    />
  );
};

export default ConnectorLine;