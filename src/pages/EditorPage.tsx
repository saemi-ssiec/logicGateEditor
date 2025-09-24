import React, { useRef, useCallback, useEffect, useState } from 'react';
import CanvasStage from '../canvas/CanvasStage';
import TagPanel from '../panels/TagPanel';
import GatePanel from '../panels/GatePanel';
import TagNode from '../canvas/elements/TagNode';
import GateNode from '../canvas/elements/GateNode';
import ConnectorLine from '../canvas/elements/ConnectorLine';
import TempConnectorLine from '../canvas/elements/TempConnectorLine';
import WaypointHandle from '../canvas/elements/WaypointHandle';
import EditingManager from '../canvas/EditingManager';
import { useNodeStore, useConnectionStore, usePortStore, useTransformStore } from '../core/store';
import { createTagNode, createGateNode } from '../core/models';
import { GateType } from '../core/types';
import { useConnectionDrawing } from '../hooks/useConnectionDrawing';

const EditorPage: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
  const [nodeIdCounter, setNodeIdCounter] = useState(1);

  const { nodes, renderOrder, addNode } = useNodeStore();
  const {
    connections,
    selectConnection,
    clearConnectionSelection,
    updateConnectionWaypoints,
    removeConnectionWaypoint
  } = useConnectionStore();
  const { ports, addPorts } = usePortStore();
  const { screenToCanvas } = useTransformStore();
  const {
    isDrawing,
    fromPort,
    mousePosition,
    handleConnectionStart,
    handleConnectionEnd,
    handleMouseMove,
    cancelConnection
  } = useConnectionDrawing();

  // Update canvas size on window resize
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setCanvasSize({ width, height });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();

    const nodeType = e.dataTransfer.getData('nodeType');
    const label = e.dataTransfer.getData('label');

    if (!nodeType) return;

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const canvasPos = screenToCanvas({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });

    const nodeId = `node-${nodeIdCounter}`;
    setNodeIdCounter(prev => prev + 1);

    if (nodeType === 'tag') {
      const newNode = createTagNode(
        nodeId,
        canvasPos,
        label || 'New Tag'
      );
      addNode(newNode);

      // Add ports for the tag node
      addPorts([
        {
          id: `${nodeId}-in`,
          nodeId,
          direction: 'input',
          position: { x: 0, y: newNode.size.height / 2 },
          connected: false
        },
        {
          id: `${nodeId}-out`,
          nodeId,
          direction: 'output',
          position: { x: newNode.size.width, y: newNode.size.height / 2 },
          connected: false
        }
      ]);
    } else if (nodeType === 'gate') {
      const gateType = e.dataTransfer.getData('gateType') as GateType;
      const newNode = createGateNode(
        nodeId,
        canvasPos,
        gateType,
        label || gateType
      );
      addNode(newNode);

      // Add ports for the gate node
      const inputCount = gateType === 'NOT' ? 1 : 2;
      const gatePorts = [];

      // Input ports
      for (let i = 0; i < inputCount; i++) {
        const yOffset = newNode.size.height / (inputCount + 1) * (i + 1);
        gatePorts.push({
          id: `${nodeId}-in-${i}`,
          nodeId,
          direction: 'input' as const,
          position: { x: 0, y: yOffset },
          connected: false
        });
      }

      // Output port
      gatePorts.push({
        id: `${nodeId}-out`,
        nodeId,
        direction: 'output' as const,
        position: { x: newNode.size.width, y: newNode.size.height / 2 },
        connected: false
      });

      addPorts(gatePorts);
    }
  }, [nodeIdCounter, screenToCanvas, addNode]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  }, []);

  const handleCanvasMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDrawing && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const canvasPos = screenToCanvas({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
      handleMouseMove(canvasPos);
    }
  }, [isDrawing, screenToCanvas, handleMouseMove]);

  const handleCanvasMouseUp = useCallback((e: React.MouseEvent) => {
    if (isDrawing) {
      cancelConnection();
    } else {
      // Clear selection when clicking on empty canvas
      const target = e.target as HTMLElement;
      if (target.tagName === 'CANVAS') {
        clearConnectionSelection();
      }
    }
  }, [isDrawing, cancelConnection, clearConnectionSelection]);

  return (
    <div className="flex h-screen bg-gray-50">
      <TagPanel />

      <div
        ref={containerRef}
        className="flex-1 relative"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onMouseMove={handleCanvasMouseMove}
        onMouseUp={handleCanvasMouseUp}
      >
        <CanvasStage width={canvasSize.width} height={canvasSize.height}>
          {/* Render connections */}
          {Object.values(connections).map(connection => {
            const fromPort = ports[connection.fromPortId];
            const toPort = ports[connection.toPortId];

            if (!fromPort || !toPort) return null;

            const fromNode = nodes[fromPort.nodeId];
            const toNode = nodes[toPort.nodeId];

            if (!fromNode || !toNode) return null;

            const fromPos = {
              x: fromNode.position.x + fromPort.position.x,
              y: fromNode.position.y + fromPort.position.y
            };

            const toPos = {
              x: toNode.position.x + toPort.position.x,
              y: toNode.position.y + toPort.position.y
            };

            // Determine connection directions based on port directions
            const fromDirection = fromPort.direction === 'output' ? 'right' : 'left';
            const toDirection = toPort.direction === 'input' ? 'left' : 'right';

            return (
              <ConnectorLine
                key={connection.id}
                from={fromPos}
                to={toPos}
                selected={connection.selected}
                fromDirection={fromDirection}
                toDirection={toDirection}
                customWaypoints={connection.waypoints}
                onClick={() => selectConnection(connection.id)}
                onDblClick={(position) => {
                  const canvasPos = screenToCanvas(position);
                  // Add waypoint at the clicked position
                  const waypoints = connection.waypoints || [];
                  // Find the best position to insert the waypoint
                  // For now, just append it
                  updateConnectionWaypoints(connection.id, [...waypoints, canvasPos]);
                }}
              />
            );
          })}

          {/* Render waypoint handles for selected connections */}
          {Object.values(connections)
            .filter(connection => connection.selected && connection.waypoints)
            .map(connection => {
              const waypoints = connection.waypoints || [];
              return waypoints.map((waypoint, index) => (
                <WaypointHandle
                  key={`${connection.id}-wp-${index}`}
                  position={waypoint}
                  index={index}
                  connectionId={connection.id}
                  onMove={(idx, newPos) => {
                    const newWaypoints = [...waypoints];
                    newWaypoints[idx] = newPos;
                    updateConnectionWaypoints(connection.id, newWaypoints);
                  }}
                  onRemove={(idx) => {
                    removeConnectionWaypoint(connection.id, idx);
                  }}
                />
              ));
            })}

          {/* Render temporary connection line when drawing */}
          {isDrawing && fromPort && (
            <TempConnectorLine
              from={{
                x: nodes[fromPort.nodeId].position.x + fromPort.position.x,
                y: nodes[fromPort.nodeId].position.y + fromPort.position.y
              }}
              to={mousePosition}
              fromDirection={fromPort.direction === 'output' ? 'right' : 'left'}
              toDirection='left'  // Default to left for preview
            />
          )}

          {/* Render nodes in order */}
          {renderOrder.map(nodeId => {
            const node = nodes[nodeId];
            if (!node) return null;

            if (node.type === 'tag') {
              return (
                <TagNode
                  key={node.id}
                  node={node}
                  onConnectionStart={handleConnectionStart}
                  onConnectionEnd={handleConnectionEnd}
                  isDrawingConnection={isDrawing}
                />
              );
            } else if (node.type === 'gate') {
              return (
                <GateNode
                  key={node.id}
                  node={node}
                  onConnectionStart={handleConnectionStart}
                  onConnectionEnd={handleConnectionEnd}
                  isDrawingConnection={isDrawing}
                />
              );
            }
            return null;
          })}
        </CanvasStage>
        <EditingManager />
      </div>

      <GatePanel />
    </div>
  );
};

export default EditorPage;