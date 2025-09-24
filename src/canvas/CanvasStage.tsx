import React, { useRef, useCallback, useState } from 'react';
import { Stage } from 'react-konva';
import { KonvaEventObject } from 'konva/lib/Node';
import { useTransformStore } from '../core/store';
import CanvasLayer from './CanvasLayer';

interface CanvasStageProps {
  width: number;
  height: number;
  children?: React.ReactNode;
}

const CanvasStage: React.FC<CanvasStageProps> = ({ width, height, children }) => {
  const stageRef = useRef<any>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [lastPointerPosition, setLastPointerPosition] = useState({ x: 0, y: 0 });

  const { scale, position, setScale, pan } = useTransformStore();

  const handleWheel = useCallback((e: KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();

    const stage = stageRef.current;
    if (!stage) return;

    const oldScale = scale;
    const pointer = stage.getPointerPosition();
    const mousePointTo = {
      x: (pointer.x - position.x) / oldScale,
      y: (pointer.y - position.y) / oldScale,
    };

    const direction = e.evt.deltaY > 0 ? 1 : -1;
    const newScale = direction > 0 ? oldScale * 1.1 : oldScale / 1.1;

    setScale(newScale);

    const newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    };

    pan(newPos.x - position.x, newPos.y - position.y);
  }, [scale, position, setScale, pan]);

  const handleMouseDown = useCallback((e: KonvaEventObject<MouseEvent>) => {
    // Middle mouse button or space + left click for panning
    if (e.evt.button === 1 || (e.evt.button === 0 && e.evt.shiftKey)) {
      setIsPanning(true);
      const stage = stageRef.current;
      const pos = stage.getPointerPosition();
      setLastPointerPosition(pos);
      e.evt.preventDefault();
    }
  }, []);

  const handleMouseMove = useCallback(() => {
    if (!isPanning) return;

    const stage = stageRef.current;
    const pos = stage.getPointerPosition();
    const deltaX = pos.x - lastPointerPosition.x;
    const deltaY = pos.y - lastPointerPosition.y;

    pan(deltaX, deltaY);
    setLastPointerPosition(pos);
  }, [isPanning, lastPointerPosition, pan]);

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  return (
    <Stage
      ref={stageRef}
      width={width}
      height={height}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      scaleX={scale}
      scaleY={scale}
      x={position.x}
      y={position.y}
      draggable={false}
    >
      <CanvasLayer>
        {children}
      </CanvasLayer>
    </Stage>
  );
};

export default CanvasStage;