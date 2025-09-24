import React, { useCallback, useRef, useState } from 'react';
import { Group, Rect, Text } from 'react-konva';
import { KonvaEventObject } from 'konva/lib/Node';
import { TagNode as TagNodeModel } from '../../core/models';
import { useNodeStore, useSelectionStore, useTransformStore } from '../../core/store';
import PortAnchor from './PortAnchor';

interface TagNodeProps {
  node: TagNodeModel;
  onConnectionStart?: (port: any) => void;
  onConnectionEnd?: (port: any) => void;
  isDrawingConnection?: boolean;
}

const TagNode: React.FC<TagNodeProps> = ({ node, onConnectionStart, onConnectionEnd, isDrawingConnection = false }) => {
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
      {/* Background Rectangle */}
      <Rect
        width={node.size.width}
        height={node.size.height}
        fill={node.selected ? '#e0e7ff' : '#ffffff'}
        stroke={node.selected ? '#6366f1' : '#d1d5db'}
        strokeWidth={node.selected ? 2 : 1}
        cornerRadius={4}
        shadowColor="#000000"
        shadowBlur={isDragging ? 10 : 5}
        shadowOpacity={isDragging ? 0.2 : 0.1}
        shadowOffsetX={0}
        shadowOffsetY={2}
      />

      {/* Label Text */}
      <Text
        text={node.label}
        x={0}
        y={0}
        width={node.size.width}
        height={node.size.height}
        align="center"
        verticalAlign="middle"
        fontSize={14}
        fontFamily="system-ui"
        fill="#1f2937"
        padding={10}
      />

      {/* Input Port (left side) */}
      <PortAnchor
        port={{
          id: `${node.id}-in`,
          nodeId: node.id,
          direction: 'input',
          position: { x: 0, y: node.size.height / 2 },
          connected: false
        }}
        onConnectionStart={onConnectionStart}
        onConnectionEnd={onConnectionEnd}
        isDrawingConnection={isDrawingConnection}
      />

      {/* Output Port (right side) */}
      <PortAnchor
        port={{
          id: `${node.id}-out`,
          nodeId: node.id,
          direction: 'output',
          position: { x: node.size.width, y: node.size.height / 2 },
          connected: false
        }}
        onConnectionStart={onConnectionStart}
        onConnectionEnd={onConnectionEnd}
        isDrawingConnection={isDrawingConnection}
      />
    </Group>
  );
};

export default TagNode;