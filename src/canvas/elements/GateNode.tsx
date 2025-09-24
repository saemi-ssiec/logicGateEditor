import React, { useCallback, useRef, useState } from 'react';
import { Group, Shape, Text } from 'react-konva';
import { KonvaEventObject } from 'konva/lib/Node';
import { GateNode as GateNodeModel } from '../../core/models';
import { useNodeStore, useSelectionStore, useTransformStore } from '../../core/store';
import PortAnchor from './PortAnchor';
import { getGateShape } from './gateShapes';

interface GateNodeProps {
  node: GateNodeModel;
  onConnectionStart?: (port: any) => void;
  onConnectionEnd?: (port: any) => void;
  isDrawingConnection?: boolean;
}

const GateNode: React.FC<GateNodeProps> = ({ node, onConnectionStart, onConnectionEnd, isDrawingConnection = false }) => {
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

  const handleDblClick = useCallback((e: KonvaEventObject<MouseEvent>) => {
    e.cancelBubble = true;
    console.log('Double click detected on gate:', node.gateType);

    // Only enable editing for LABEL and PDTIMER gates
    if (node.gateType === 'LABEL' || node.gateType === 'PDTIMER') {
      console.log('Dispatching edit event for:', node.gateType);

      // Get position for the input
      if (groupRef.current) {
        const stage = groupRef.current.getStage();
        const container = stage.container();
        const rect = container.getBoundingClientRect();
        const absPos = groupRef.current.getAbsolutePosition();
        const scale = stage.scaleX();
        const stagePos = stage.position();

        const position = {
          x: rect.left + absPos.x * scale + stagePos.x,
          y: rect.top + absPos.y * scale + stagePos.y - 10
        };

        // Dispatch custom event to EditingManager
        const event = new CustomEvent('gate-edit-start', {
          detail: {
            nodeId: node.id,
            gateType: node.gateType,
            position,
            width: node.size.width
          }
        });
        window.dispatchEvent(event);
      }
    }
  }, [node.id, node.gateType, node.size.width]);


  // Get port positions based on gate type
  const getPortPositions = () => {
    const inputCount = node.gateType === 'NOT' ? 1 : 2;
    const inputPorts = [];
    const outputPorts = [];

    // Input ports on the left
    for (let i = 0; i < inputCount; i++) {
      const yOffset = node.size.height / (inputCount + 1) * (i + 1);
      inputPorts.push({
        id: `${node.id}-in-${i}`,
        nodeId: node.id,
        direction: 'input' as const,
        position: { x: 0, y: yOffset },
        connected: false
      });
    }

    // Output port on the right
    outputPorts.push({
      id: `${node.id}-out`,
      nodeId: node.id,
      direction: 'output' as const,
      position: { x: node.size.width, y: node.size.height / 2 },
      connected: false
    });

    return { inputPorts, outputPorts };
  };

  const { inputPorts, outputPorts } = getPortPositions();

  return (
    <>
      <Group
        ref={groupRef}
        x={node.position.x}
        y={node.position.y}
        rotation={node.rotation}
        draggable
        onClick={handleClick}
        onDblClick={handleDblClick}
        onDragStart={handleDragStart}
        onDragMove={handleDragMove}
        onDragEnd={handleDragEnd}
      >
      {/* Gate Shape */}
      <Shape
        sceneFunc={(context, shape) => {
          const shapePath = getGateShape(node.gateType, node.size.width, node.size.height);
          context.beginPath();
          shapePath(context);
          context.closePath();
          context.fillStrokeShape(shape);
        }}
        fill={node.selected ? '#e0e7ff' : '#ffffff'}
        stroke={node.selected ? '#6366f1' : '#d1d5db'}
        strokeWidth={node.selected ? 2 : 1}
        shadowColor="#000000"
        shadowBlur={isDragging ? 10 : 5}
        shadowOpacity={isDragging ? 0.2 : 0.1}
        shadowOffsetX={0}
        shadowOffsetY={2}
        onDblClick={handleDblClick}
      />

      {/* Gate Type Label */}
      <Text
        text={
          node.gateType === 'LABEL'
            ? (node.customLabel || 'LABEL')
            : node.gateType === 'PDTIMER'
            ? `${node.timerValue || 5}s`
            : node.gateType
        }
        x={0}
        y={0}
        width={node.size.width}
        height={node.size.height}
        align="center"
        verticalAlign="middle"
        fontSize={12}
        fontFamily="monospace"
        fontStyle="bold"
        fill="#1f2937"
        onDblClick={handleDblClick}
      />

      {/* Input Ports */}
      {inputPorts.map((port) => (
        <PortAnchor
          key={port.id}
          port={port}
          onConnectionStart={onConnectionStart}
          onConnectionEnd={onConnectionEnd}
          isDrawingConnection={isDrawingConnection}
        />
      ))}

      {/* Output Ports */}
      {outputPorts.map((port) => (
        <PortAnchor
          key={port.id}
          port={port}
          onConnectionStart={onConnectionStart}
          onConnectionEnd={onConnectionEnd}
          isDrawingConnection={isDrawingConnection}
        />
      ))}
      </Group>
    </>
  );
};

export default GateNode;