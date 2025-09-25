import React, { useRef, useCallback, useState } from 'react';
import { Group, Circle } from 'react-konva';
import { KonvaEventObject } from 'konva/lib/Node';
import { JunctionNode as JunctionNodeModel } from '../../core/models/junctionModel';
import { useNodeStore, useSelectionStore, useTransformStore } from '../../core/store';
import PortAnchor from './PortAnchor';

interface JunctionNodeProps {
  node: JunctionNodeModel;
  onConnectionStart?: (port: any) => void;
  onConnectionEnd?: (port: any) => void;
  isDrawingConnection?: boolean;
}

const JunctionNode: React.FC<JunctionNodeProps> = ({
  node,
  onConnectionStart,
  onConnectionEnd,
  isDrawingConnection = false
}) => {
  const groupRef = useRef<any>(null);
  const [isDragging, setIsDragging] = useState(false);

  const { moveNode, selectNode, bringNodeToFront } = useNodeStore();
  const { selectNode: selectNodeInSelection } = useSelectionStore();
  const { snapToGridPosition } = useTransformStore();

  const handleClick = useCallback((e: KonvaEventObject<MouseEvent>) => {
    e.cancelBubble = true;
    const isMultiSelect = e.evt.ctrlKey || e.evt.metaKey;
    selectNode(node.id, isMultiSelect);
    selectNodeInSelection(node.id, isMultiSelect);

    if (!isMultiSelect) {
      bringNodeToFront(node.id);
    }
  }, [node.id, selectNode, selectNodeInSelection, bringNodeToFront]);

  const handleDragStart = useCallback(() => {
    setIsDragging(true);
    bringNodeToFront(node.id);
  }, [node.id, bringNodeToFront]);

  const handleDragMove = useCallback((e: KonvaEventObject<MouseEvent>) => {
    if (!isDragging) return;

    const newPos = snapToGridPosition({
      x: e.target.x(),
      y: e.target.y()
    });

    e.target.x(newPos.x);
    e.target.y(newPos.y);
  }, [isDragging, snapToGridPosition]);

  const handleDragEnd = useCallback((e: KonvaEventObject<MouseEvent>) => {
    setIsDragging(false);

    const finalPos = snapToGridPosition({
      x: e.target.x(),
      y: e.target.y()
    });

    moveNode(node.id, finalPos.x, finalPos.y);
  }, [node.id, moveNode, snapToGridPosition]);

  // Create ports for junction (4 directional ports)
  const getJunctionPorts = () => {
    const center = { x: node.size.width / 2, y: node.size.height / 2 };

    return [
      // Top
      {
        id: `${node.id}-top`,
        nodeId: node.id,
        direction: 'input' as const,
        position: { x: center.x, y: 0 },
        connected: false
      },
      // Right
      {
        id: `${node.id}-right`,
        nodeId: node.id,
        direction: 'output' as const,
        position: { x: node.size.width, y: center.y },
        connected: false
      },
      // Bottom
      {
        id: `${node.id}-bottom`,
        nodeId: node.id,
        direction: 'input' as const,
        position: { x: center.x, y: node.size.height },
        connected: false
      },
      // Left
      {
        id: `${node.id}-left`,
        nodeId: node.id,
        direction: 'input' as const,
        position: { x: 0, y: center.y },
        connected: false
      }
    ];
  };

  const junctionPorts = getJunctionPorts();

  return (
    <Group
      ref={groupRef}
      x={node.position.x}
      y={node.position.y}
      draggable
      onClick={handleClick}
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragEnd={handleDragEnd}
    >
      {/* Junction Circle */}
      <Circle
        x={node.size.width / 2}
        y={node.size.height / 2}
        radius={node.selected ? 5 : 4}
        fill={node.selected ? '#6366f1' : '#374151'}
        stroke={node.selected ? '#4f46e5' : '#6b7280'}
        strokeWidth={node.selected ? 2 : 1}
        shadowColor="#000000"
        shadowBlur={isDragging ? 8 : 4}
        shadowOpacity={isDragging ? 0.3 : 0.2}
        shadowOffsetX={0}
        shadowOffsetY={1}
      />

      {/* Junction Ports - only visible when drawing connections */}
      {(isDrawingConnection || node.selected) && junctionPorts.map((port) => (
        <PortAnchor
          key={port.id}
          port={port}
          onConnectionStart={onConnectionStart}
          onConnectionEnd={onConnectionEnd}
          isDrawingConnection={isDrawingConnection}
        />
      ))}
    </Group>
  );
};

export default JunctionNode;