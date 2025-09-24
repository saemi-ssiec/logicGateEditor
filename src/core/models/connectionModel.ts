import { ConnectionId, PortId, Position } from '../types';

export interface ConnectionModel {
  id: ConnectionId;
  fromPortId: PortId;
  toPortId: PortId;
  selected?: boolean;
  waypoints?: Position[]; // Custom waypoints for manual routing
  path?: string; // SVG path for custom routing
}

export const createConnection = (
  id: ConnectionId,
  fromPortId: PortId,
  toPortId: PortId
): ConnectionModel => ({
  id,
  fromPortId,
  toPortId,
  selected: false
});

export const validateConnection = (
  fromPortId: PortId,
  toPortId: PortId,
  existingConnections: ConnectionModel[],
  ports?: Record<PortId, any>
): boolean | { valid: boolean; message?: string } => {
  // Check if connection already exists
  const connectionExists = existingConnections.some(
    conn =>
      (conn.fromPortId === fromPortId && conn.toPortId === toPortId) ||
      (conn.fromPortId === toPortId && conn.toPortId === fromPortId)
  );

  if (connectionExists) {
    return { valid: false, message: '이미 연결되어 있습니다.' };
  }

  // Check if output port already has a connection (Gate output restriction)
  if (ports) {
    const fromPort = ports[fromPortId];
    const toPort = ports[toPortId];

    // If connecting from an output port, check if it already has a connection
    if (fromPort && fromPort.direction === 'output') {
      const hasExistingConnection = existingConnections.some(
        conn => conn.fromPortId === fromPortId
      );
      if (hasExistingConnection) {
        return {
          valid: false,
          message: 'Gate 출력 포트는 하나의 연결만 가능합니다.'
        };
      }
    }

    // If connecting to an output port (reverse connection), check if it already has a connection
    if (toPort && toPort.direction === 'output') {
      const hasExistingConnection = existingConnections.some(
        conn => conn.fromPortId === toPortId
      );
      if (hasExistingConnection) {
        return {
          valid: false,
          message: 'Gate 출력 포트는 하나의 연결만 가능합니다.'
        };
      }
    }
  }

  return { valid: true };
};