import React, { useCallback, useState } from 'react';
import { Circle } from 'react-konva';
import { KonvaEventObject } from 'konva/lib/Node';
import { PortModel } from '../../core/models';

interface PortAnchorProps {
  port: PortModel;
  onConnectionStart?: (port: PortModel) => void;
  onConnectionEnd?: (port: PortModel) => void;
  isDrawingConnection?: boolean;
}

const PortAnchor: React.FC<PortAnchorProps> = ({ port, onConnectionStart, onConnectionEnd, isDrawingConnection = false }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isConnectionTarget, setIsConnectionTarget] = useState(false);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
    // If we're drawing a connection and enter this port, it's a potential target
    if (isDrawingConnection) {
      setIsConnectionTarget(true);
    }
  }, [isDrawingConnection]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    setIsConnectionTarget(false);
  }, []);

  const handleMouseDown = useCallback((e: KonvaEventObject<MouseEvent>) => {
    e.cancelBubble = true;
    setIsDragging(true);
    onConnectionStart?.(port);
  }, [port, onConnectionStart]);

  const handleMouseUp = useCallback((e: KonvaEventObject<MouseEvent>) => {
    e.cancelBubble = true;
    if (isDragging) {
      setIsDragging(false);
    }
    // If we're releasing over this port while drawing a connection
    if (isDrawingConnection && isHovered) {
      onConnectionEnd?.(port);
    }
  }, [isDragging, isDrawingConnection, isHovered, port, onConnectionEnd]);

  const getPortColor = () => {
    if (isDragging) return '#6366f1';
    if (isConnectionTarget) return '#10b981';
    if (isHovered) return '#8b5cf6';
    if (port.connected) return '#10b981';
    return '#9ca3af';
  };

  return (
    <Circle
      x={port.position.x}
      y={port.position.y}
      radius={isHovered || isDragging ? 7 : 5}
      fill={getPortColor()}
      stroke="#ffffff"
      strokeWidth={2}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      perfectDrawEnabled={false}
      shadowForStrokeEnabled={false}
    />
  );
};

export default PortAnchor;