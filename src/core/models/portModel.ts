import { PortId, NodeId, PortDirection, Position } from '../types';

export interface PortModel {
  id: PortId;
  nodeId: NodeId;
  direction: PortDirection;
  position: Position; // Relative to node
  label?: string;
  connected?: boolean;
  maxConnections?: number;
}

export const createPort = (
  id: PortId,
  nodeId: NodeId,
  direction: PortDirection,
  position: Position,
  label?: string
): PortModel => ({
  id,
  nodeId,
  direction,
  position,
  label,
  connected: false,
  maxConnections: direction === 'input' ? 1 : undefined
});

export const getPortAbsolutePosition = (
  port: PortModel,
  nodePosition: Position
): Position => ({
  x: nodePosition.x + port.position.x,
  y: nodePosition.y + port.position.y
});