// src/canvas/elements/GateNode.tsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Group, Text, Rect } from 'react-konva';
import type { KonvaEventObject } from 'konva/lib/Node';

import type { GateNode as GateNodeModel } from '../../core/models';
import { useNodeStore, usePortStore, useSelectionStore, useTransformStore } from '../../core/store';

import PortAnchor from './PortAnchor';
import { getGateRenderer } from './GateShapes';

type GateNodeProps = {
  node: GateNodeModel;
  onConnectionStart?: (port: any) => void;
  onConnectionEnd?: (port: any) => void;
  isDrawingConnection?: boolean;
};

const GateNode: React.FC<GateNodeProps> = ({
  node,
  onConnectionStart,
  onConnectionEnd,
  isDrawingConnection = false,
}) => {
  const groupRef = useRef<any>(null);
  const [isDragging, setIsDragging] = useState(false);

  const { moveNode, selectNode, bringNodeToFront } = useNodeStore();
  const { selectNode: selectNodeInSelection } = useSelectionStore();
  const { snapToGridPosition } = useTransformStore();

  const updatePortsPositionBatch = usePortStore((s) => s.updatePortsPositionBatch);

  // react-konva 노드 묶음(도형) 렌더러
  const Renderer = getGateRenderer(node.gateType);

  const handleClick = useCallback(
    (e: KonvaEventObject<MouseEvent>) => {
      e.cancelBubble = true;
      const isMulti = e.evt.ctrlKey || e.evt.metaKey;
      selectNode(node.id, isMulti);
      selectNodeInSelection(node.id, isMulti);
      if (!isMulti) bringNodeToFront(node.id);
    },
    [node.id, selectNode, selectNodeInSelection, bringNodeToFront]
  );

  const handleDragStart = useCallback(() => {
    setIsDragging(true);
    bringNodeToFront(node.id);
  }, [node.id, bringNodeToFront]);

  const handleDragMove = useCallback(
    (e: KonvaEventObject<MouseEvent>) => {
      if (!isDragging) return;
      const newPos = snapToGridPosition({ x: e.target.x(), y: e.target.y() });
      e.target.x(newPos.x);
      e.target.y(newPos.y);
    },
    [isDragging, snapToGridPosition]
  );

  const handleDragEnd = useCallback(
    (e: KonvaEventObject<MouseEvent>) => {
      setIsDragging(false);
      const finalPos = snapToGridPosition({ x: e.target.x(), y: e.target.y() });
      moveNode(node.id, finalPos.x, finalPos.y);
    },
    [node.id, moveNode, snapToGridPosition]
  );

  const handleDblClick = useCallback(
    (e: KonvaEventObject<MouseEvent>) => {
      e.cancelBubble = true;

      // 더블클릭 편집 허용: LABEL, TIMER (현 상태 유지)
      if (node.gateType !== 'LABEL' && node.gateType !== 'TIMER') return;

      if (groupRef.current) {
        const stage = groupRef.current.getStage();
        if (!stage) return;
        const container = stage.container();
        const rect = container.getBoundingClientRect();
        const absPos = groupRef.current.getAbsolutePosition();
        const scale = stage.scaleX();
        const stagePos = stage.position();

        const position = {
          x: rect.left + absPos.x * scale + stagePos.x,
          y: rect.top + absPos.y * scale + stagePos.y - 10,
        };

        const event = new CustomEvent('gate-edit-start', {
          detail: {
            nodeId: node.id,
            gateType: node.gateType,
            position,
            width: node.size.width,
          },
        });
        window.dispatchEvent(event);
      }
    },
    [node.id, node.gateType, node.size.width]
  );

  // ===== 포트 위치 보정값 & 포트 ID 계산 (컴포넌트 최상위에서만 훅 사용) =====
  const isTriangleGate = useMemo(
    () =>
      node.gateType === 'NOT' ||
      node.gateType === 'COMPARATOR' ||
      node.gateType === 'RISING' ||
      node.gateType === 'FALLING',
    [node.gateType]
  );

  const leftAnchorOffset = useMemo(
    () => (isTriangleGate ? Math.max(4, node.size.height * 0.1) : 0),
    [isTriangleGate, node.size.height]
  );

  const hasOutputBubble = useMemo(
    () => node.gateType === 'NOT' || node.gateType === 'NAND' || node.gateType === 'NOR',
    [node.gateType]
  );

  const bubbleOffset = useMemo(
    () => (hasOutputBubble ? Math.max(3, node.size.height * 0.08) + 2 : 0),
    [hasOutputBubble, node.size.height]
  );

  const inputCount = node.gateType === 'NOT' ? 1 : 2;

  const { inputIds, outputId } = useMemo(() => {
    return {
      inputIds: Array.from({ length: inputCount }, (_, i) => `${node.id}-in-${i}`),
      outputId: `${node.id}-out`,
    };
  }, [node.id, inputCount]);

  // 스토어 포트 좌표를 GateNode 기준 상대좌표로 동기화
  useEffect(() => {
    if (!updatePortsPositionBatch) return;
    const updates: { id: string; x: number; y: number }[] = [];

    for (let i = 0; i < inputCount; i++) {
      const y = (node.size.height / (inputCount + 1)) * (i + 1);
      updates.push({ id: inputIds[i], x: -leftAnchorOffset, y });
    }

    updates.push({
      id: outputId,
      x: node.size.width + bubbleOffset,
      y: node.size.height / 2,
    });

    updatePortsPositionBatch(updates);
  }, [
    updatePortsPositionBatch,
    inputIds,
    outputId,
    inputCount,
    node.size.height,
    node.size.width,
    leftAnchorOffset,
    bubbleOffset,
  ]);

  // ===== 여기부터는 화면에 그릴 PortAnchor용 로컬 계산 =====
  const getPortPositions = () => {
    const inputPorts: any[] = [];
    const outputPorts: any[] = [];

    // Input ports (left)
    for (let i = 0; i < inputCount; i++) {
      const yOffset = (node.size.height / (inputCount + 1)) * (i + 1);
      inputPorts.push({
        id: `${node.id}-in-${i}`,
        nodeId: node.id,
        direction: 'input' as const,
        position: { x: 0 - leftAnchorOffset, y: yOffset },
        connected: false,
      });
    }

    // Output port (right)
    outputPorts.push({
      id: `${node.id}-out`,
      nodeId: node.id,
      direction: 'output' as const,
      position: { x: node.size.width + bubbleOffset, y: node.size.height / 2 },
      connected: false,
    });

    return { inputPorts, outputPorts };
  };

  const { inputPorts, outputPorts } = getPortPositions();

  return (
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
      shadowColor="#000000"
      shadowBlur={isDragging ? 10 : 5}
      shadowOpacity={isDragging ? 0.2 : 0.1}
      shadowOffset={{ x: 0, y: 2 }}
    >
      {/* 선택 하이라이트 */}
      {node.selected && (
        <Rect
          x={-2}
          y={-2}
          width={node.size.width + 4}
          height={node.size.height + 4}
          stroke="#6366f1"
          strokeWidth={2}
          cornerRadius={4}
          listening={false}
        />
      )}

      {/* 게이트 도형 */}
      {Renderer(node.size.width, node.size.height)}

      {/* 오버레이 라벨: comparator/rising/falling/timer/switch는 숨김 */}
      <Text
        text={
          node.gateType === 'LABEL'
            ? node.customLabel || 'LABEL'
            : (node.gateType === 'COMPARATOR' ||
               node.gateType === 'RISING' ||
               node.gateType === 'FALLING' ||
               node.gateType === 'TIMER' ||  // PDTIMER 프로젝트면 'PDTIMER'로 교체
               node.gateType === 'SWITCH')
            ? ''
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
        listening
        onDblClick={handleDblClick}
      />

      {/* Ports */}
      {inputPorts.map((port) => (
        <PortAnchor
          key={port.id}
          port={port}
          onConnectionStart={onConnectionStart}
          onConnectionEnd={onConnectionEnd}
          isDrawingConnection={isDrawingConnection}
        />
      ))}
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
  );
};

export default GateNode;
