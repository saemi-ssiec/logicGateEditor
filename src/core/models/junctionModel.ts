import { NodeId, Position, BaseNode } from '../types';

export interface JunctionNode extends BaseNode {
  type: 'junction';
  position: Position;
  size: { width: number; height: number };
  selected: boolean;
  rotation?: number;
}

export const createJunctionNode = (
  id: NodeId,
  position: Position
): JunctionNode => ({
  id,
  type: 'junction',
  position,
  size: { width: 8, height: 8 }, // Small dot
  label: '', // Junction nodes don't need labels
  selected: false,
  rotation: 0
});

// Check if a line intersects with another line to create a junction
export const shouldCreateJunction = (
  line1Start: Position,
  line1End: Position,
  line2Start: Position,
  line2End: Position
): { shouldCreate: boolean; intersectionPoint?: Position } => {
  // Calculate intersection point of two lines
  const denominator = (line1Start.x - line1End.x) * (line2Start.y - line2End.y) -
                     (line1Start.y - line1End.y) * (line2Start.x - line2End.x);

  if (Math.abs(denominator) < 1e-10) {
    // Lines are parallel or coincident
    return { shouldCreate: false };
  }

  const t = ((line1Start.x - line2Start.x) * (line2Start.y - line2End.y) -
            (line1Start.y - line2Start.y) * (line2Start.x - line2End.x)) / denominator;

  const u = -((line1Start.x - line1End.x) * (line1Start.y - line2Start.y) -
             (line1Start.y - line1End.y) * (line1Start.x - line2Start.x)) / denominator;

  // Check if intersection is within both line segments
  if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
    const intersectionPoint = {
      x: line1Start.x + t * (line1End.x - line1Start.x),
      y: line1Start.y + t * (line1End.y - line1Start.y)
    };

    return { shouldCreate: true, intersectionPoint };
  }

  return { shouldCreate: false };
};