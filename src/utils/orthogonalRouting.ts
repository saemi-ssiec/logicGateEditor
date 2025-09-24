import { Position } from '../core/types';
import { BoundingBox, adjustPathForObstacles } from './obstacleDetection';

export interface RoutingOptions {
  offsetFromPort?: number;  // Distance to extend from port before turning
  minimumGap?: number;      // Minimum gap between parallel lines
  customWaypoints?: Position[]; // Custom waypoints for manual routing
  obstacles?: BoundingBox[]; // Obstacles to avoid
}

/**
 * Calculate orthogonal (right-angled) path between two points
 * considering port directions and obstacles
 */
export function calculateOrthogonalPath(
  from: Position,
  to: Position,
  fromDirection: 'left' | 'right' = 'right',
  toDirection: 'left' | 'right' = 'left',
  options: RoutingOptions = {}
): number[] {
  const {
    offsetFromPort = 50,
    customWaypoints = [],
    obstacles = []
  } = options;

  // If custom waypoints are provided, use them
  if (customWaypoints.length > 0) {
    return buildPathFromWaypoints(from, to, customWaypoints);
  }

  const points: number[] = [];

  // Start point
  points.push(from.x, from.y);

  // Calculate intermediate points based on port directions
  if (fromDirection === 'right' && toDirection === 'left') {
    // Standard right-to-left connection
    if (to.x > from.x + offsetFromPort * 2) {
      // Enough horizontal space for a direct connection
      const midX = (from.x + to.x) / 2;

      points.push(midX, from.y);         // Extend right to middle
      points.push(midX, to.y);           // Move vertically
    } else {
      // Not enough space - need to route around
      const extendX1 = from.x + offsetFromPort;
      const extendX2 = to.x - offsetFromPort;

      if (Math.abs(from.y - to.y) > 100) {
        // Large vertical distance - use middle routing
        const midY = (from.y + to.y) / 2;

        points.push(extendX1, from.y);   // Extend right from start
        points.push(extendX1, midY);     // Move to middle height
        points.push(extendX2, midY);     // Move horizontally
        points.push(extendX2, to.y);     // Move to target height
      } else {
        // Small vertical distance - route around
        const bypassY = Math.min(from.y, to.y) - offsetFromPort;

        points.push(extendX1, from.y);   // Extend right from start
        points.push(extendX1, bypassY);  // Move up/down to bypass
        points.push(extendX2, bypassY);  // Move horizontally
        points.push(extendX2, to.y);     // Move to target
      }
    }
  } else if (fromDirection === 'left' && toDirection === 'right') {
    // Reverse connection (left output to right input)
    const extendX1 = from.x - offsetFromPort;
    const extendX2 = to.x + offsetFromPort;

    if (from.x > to.x + offsetFromPort * 2) {
      // Nodes are far apart - simple routing
      const midX = (from.x + to.x) / 2;

      points.push(midX, from.y);         // Extend to middle
      points.push(midX, to.y);           // Move vertically
    } else {
      // Need complex routing
      const bypassY = Math.min(from.y, to.y) - offsetFromPort;

      points.push(extendX1, from.y);     // Extend left from start
      points.push(extendX1, bypassY);    // Move to bypass height
      points.push(extendX2, bypassY);    // Move horizontally
      points.push(extendX2, to.y);       // Move to target
    }
  } else if (fromDirection === 'right' && toDirection === 'right') {
    // Both ports on right side - need to route around
    const extendX = Math.max(from.x, to.x) + offsetFromPort;

    points.push(extendX, from.y);        // Extend right from start
    points.push(extendX, to.y);          // Move vertically
  } else {
    // Both ports on left side - route around left
    const extendX = Math.min(from.x, to.x) - offsetFromPort;

    points.push(extendX, from.y);        // Extend left from start
    points.push(extendX, to.y);          // Move vertically
  }

  // End point
  points.push(to.x, to.y);

  // Apply obstacle avoidance if obstacles are provided
  if (obstacles.length > 0) {
    return adjustPathForObstacles(points, obstacles);
  }

  return points;
}

/**
 * Build path from custom waypoints
 */
function buildPathFromWaypoints(
  from: Position,
  to: Position,
  waypoints: Position[]
): number[] {
  const points: number[] = [];

  // Start point
  points.push(from.x, from.y);

  // Add all waypoints
  waypoints.forEach(wp => {
    points.push(wp.x, wp.y);
  });

  // End point
  points.push(to.x, to.y);

  return points;
}

/**
 * Calculate smart orthogonal path avoiding obstacles
 */
export function calculateSmartOrthogonalPath(
  from: Position,
  to: Position,
  fromDirection: 'left' | 'right' = 'right',
  toDirection: 'left' | 'right' = 'left',
  obstacles: BoundingBox[] = []
): number[] {
  // Use the enhanced routing with obstacle avoidance
  return calculateOrthogonalPath(from, to, fromDirection, toDirection, {
    obstacles,
    offsetFromPort: 50
  });
}

/**
 * Simplify path by removing redundant points
 */
export function simplifyOrthogonalPath(points: number[]): number[] {
  if (points.length <= 4) return points; // Already minimal

  const simplified: number[] = [];

  for (let i = 0; i < points.length; i += 2) {
    if (i === 0 || i === points.length - 2) {
      // Always keep start and end points
      simplified.push(points[i], points[i + 1]);
    } else if (i >= 4) {
      // Check if this point forms a straight line with previous and next
      const prevX = points[i - 4];
      const prevY = points[i - 3];
      const currX = points[i];
      const currY = points[i + 1];
      const nextX = points[i + 2];
      const nextY = points[i + 3];

      const isHorizontalLine = prevY === currY && currY === nextY;
      const isVerticalLine = prevX === currX && currX === nextX;

      if (!isHorizontalLine && !isVerticalLine) {
        // This point is a corner, keep it
        simplified.push(currX, currY);
      }
    }
  }

  return simplified;
}

/**
 * Add rounded corners to orthogonal path
 */
export function addRoundedCorners(points: number[], radius: number = 5): string {
  if (points.length < 6) {
    // Not enough points for corners
    return `M ${points[0]} ${points[1]} L ${points.slice(2).join(' ')}`;
  }

  let path = `M ${points[0]} ${points[1]}`;

  for (let i = 2; i < points.length - 2; i += 2) {
    const x = points[i];
    const y = points[i + 1];
    const nextX = points[i + 2];
    const nextY = points[i + 3];

    if (i === 2) {
      // First segment
      path += ` L ${x} ${y}`;
    } else {
      // Add rounded corner
      const prevX = points[i - 2];
      const prevY = points[i - 1];

      const isHorizontalToVertical = prevY === y && x === nextX;
      const isVerticalToHorizontal = prevX === x && y === nextY;

      if (isHorizontalToVertical || isVerticalToHorizontal) {
        // Calculate corner curve
        const cornerX = x;
        const cornerY = y;

        // Determine curve direction
        const dx1 = prevX < x ? -radius : radius;
        const dy1 = prevY < y ? -radius : radius;
        const dx2 = nextX < x ? -radius : radius;
        const dy2 = nextY < y ? -radius : radius;

        path += ` L ${cornerX + dx1} ${cornerY + dy1}`;
        path += ` Q ${cornerX} ${cornerY} ${cornerX + dx2} ${cornerY + dy2}`;
      } else {
        path += ` L ${x} ${y}`;
      }
    }
  }

  // Add final point
  path += ` L ${points[points.length - 2]} ${points[points.length - 1]}`;

  return path;
}