import { useState, useCallback } from 'react';
import { useConnectionStore, usePortStore } from '../core/store';
import { PortModel, ConnectionModel } from '../core/models';
import { Position } from '../core/types';
import { useToastStore } from '../components/Toast';

interface ConnectionDrawingState {
  isDrawing: boolean;
  fromPort: PortModel | null;
  mousePosition: Position;
}

export const useConnectionDrawing = () => {
  const [drawingState, setDrawingState] = useState<ConnectionDrawingState>({
    isDrawing: false,
    fromPort: null,
    mousePosition: { x: 0, y: 0 }
  });

  const { addConnection } = useConnectionStore();
  const { setPortConnected } = usePortStore();
  const { addToast } = useToastStore();

  const handleConnectionStart = useCallback((port: PortModel) => {
    setDrawingState({
      isDrawing: true,
      fromPort: port,
      mousePosition: { x: port.position.x, y: port.position.y }
    });
  }, []);

  const handleConnectionEnd = useCallback((toPort: PortModel) => {
    if (!drawingState.isDrawing || !drawingState.fromPort) return;

    // Check if connection is valid
    const fromPort = drawingState.fromPort;

    // Can't connect to same node or same direction
    if (fromPort.nodeId === toPort.nodeId) {
      addToast('같은 노드에는 연결할 수 없습니다.', 'warning');
      setDrawingState({
        isDrawing: false,
        fromPort: null,
        mousePosition: { x: 0, y: 0 }
      });
      return;
    }

    if (fromPort.direction === toPort.direction) {
      addToast('같은 방향의 포트는 연결할 수 없습니다.', 'warning');
      setDrawingState({
        isDrawing: false,
        fromPort: null,
        mousePosition: { x: 0, y: 0 }
      });
      return;
    }

    // Create connection
    const connection: ConnectionModel = {
      id: `conn-${Date.now()}`,
      fromPortId: fromPort.direction === 'output' ? fromPort.id : toPort.id,
      toPortId: fromPort.direction === 'input' ? fromPort.id : toPort.id,
      selected: false
    };

    const result = addConnection(connection);

    if (result.success) {
      // Mark ports as connected
      setPortConnected(fromPort.id, true);
      setPortConnected(toPort.id, true);
    } else if (result.message) {
      // Show error message
      addToast(result.message, 'warning');
    }

    // Reset drawing state
    setDrawingState({
      isDrawing: false,
      fromPort: null,
      mousePosition: { x: 0, y: 0 }
    });
  }, [drawingState, addConnection, setPortConnected]);

  const handleMouseMove = useCallback((position: Position) => {
    if (drawingState.isDrawing) {
      setDrawingState(prev => ({
        ...prev,
        mousePosition: position
      }));
    }
  }, [drawingState.isDrawing]);

  const cancelConnection = useCallback(() => {
    setDrawingState({
      isDrawing: false,
      fromPort: null,
      mousePosition: { x: 0, y: 0 }
    });
  }, []);

  return {
    isDrawing: drawingState.isDrawing,
    fromPort: drawingState.fromPort,
    mousePosition: drawingState.mousePosition,
    handleConnectionStart,
    handleConnectionEnd,
    handleMouseMove,
    cancelConnection
  };
};