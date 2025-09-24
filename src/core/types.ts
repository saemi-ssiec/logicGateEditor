// Core types for the logic flow editor

export type NodeId = string;
export type PortId = string;
export type ConnectionId = string;

export type NodeType = 'tag' | 'gate';
export type GateType = 'AND' | 'OR' | 'NOT' | 'NAND' | 'NOR' | 'COMPARATOR' | 'RISING' | 'FALLING' | 'PDTIMER' | 'LABEL' | 'SWITCH';
export type PortDirection = 'input' | 'output';

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface Transform {
  scale: number;
  position: Position;
}

export interface SelectionState {
  selectedNodes: NodeId[];
  selectedConnections: ConnectionId[];
  selectedPorts: PortId[];
}

export interface DragState {
  isDragging: boolean;
  startPosition?: Position;
  currentPosition?: Position;
  draggedItem?: {
    type: 'node' | 'port' | 'connection';
    id: string;
  };
}