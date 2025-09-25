import React, { useCallback, useState } from 'react';
import { Circle } from 'react-konva';
import { KonvaEventObject } from 'konva/lib/Node';
import { Position } from '../../core/types';

interface WaypointHandleProps {
  position: Position;
  index: number;
  connectionId: string;
  onMove?: (index: number, position: Position) => void;
  onRemove?: (index: number) => void;
}

const WaypointHandle: React.FC<WaypointHandleProps> = ({
  position,
  index,
  onMove,
  onRemove
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleDragStart = useCallback((e: KonvaEventObject<DragEvent>) => {
    e.cancelBubble = true;
    setIsDragging(true);
  }, []);

  const handleDragEnd = useCallback((e: KonvaEventObject<DragEvent>) => {
    e.cancelBubble = true;
    setIsDragging(false);

    const node = e.target;
    const newPosition = {
      x: node.x(),
      y: node.y()
    };

    onMove?.(index, newPosition);
  }, [index, onMove]);

  const handleDblClick = useCallback((e: KonvaEventObject<MouseEvent>) => {
    e.cancelBubble = true;
    onRemove?.(index);
  }, [index, onRemove]);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  return (
    <Circle
      x={position.x}
      y={position.y}
      radius={isHovered || isDragging ? 6 : 4}
      fill={isDragging ? '#6366f1' : isHovered ? '#8b5cf6' : '#9ca3af'}
      stroke="#ffffff"
      strokeWidth={2}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDblClick={handleDblClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      perfectDrawEnabled={false}
      shadowForStrokeEnabled={false}
    />
  );
};

export default WaypointHandle;