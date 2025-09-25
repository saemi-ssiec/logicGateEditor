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
    <>
      {/* Shadow line for selected connections */}
      {selected && (
        <Line
          points={points}
          stroke="#6366f1"
          strokeWidth={7}
          lineCap="round"
          lineJoin="round"
          opacity={0.3}
          perfectDrawEnabled={false}
          shadowForStrokeEnabled={false}
        />
      )}

      {/* Main line */}
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
        dash={selected ? [5, 3] : undefined}
      />
    </>
  );
};

export default ConnectorLine;