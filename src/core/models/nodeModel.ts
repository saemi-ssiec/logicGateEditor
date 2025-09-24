import { GateType, NodeId, NodeType, Position, Size } from "../types";

export interface BaseNode {
  id: NodeId;
  type: NodeType;
  position: Position;
  size: Size;
  label: string;
  selected?: boolean;
  zIndex?: number;
}

export interface TagNode extends BaseNode {
  type: 'tag';
  value?: any;
}

export interface GateNode extends BaseNode {
  type: 'gate';
  gateType: GateType;
  rotation?: number;
  customLabel?: string;  // For LABEL gate custom text
  timerValue?: number;   // For PDTIMER gate time in seconds (default: 5)
}

export type NodeModel = TagNode | GateNode;

export const createTagNode = (
  id: NodeId,
  position: Position,
  label: string,
  size?: Size
): TagNode => ({
  id,
  type: 'tag',
  position,
  size: size || { width: 100, height: 50 },
  label,
  selected: false,
  zIndex: 0
});

export const createGateNode = (
  id: NodeId,
  position: Position,
  gateType: GateType,
  label: string,
  size?: Size
): GateNode => ({
  id,
  type: 'gate',
  position,
  size: size || { width: 80, height: 60 },
  label,
  gateType,
  rotation: 0,
  selected: false,
  zIndex: 0
});