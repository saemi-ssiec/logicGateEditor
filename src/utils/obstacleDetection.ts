import { Position } from '../core/types';

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Check if a line segment intersects with a bounding box
 */
export function lineIntersectsBox(
  lineStart: Position,
  lineEnd: Position,
  box: BoundingBox
): boolean {
  // Get box boundaries
  const boxLeft = box.x;
  const boxRight = box.x + box.width;
  const boxTop = box.y;
  const boxBottom = box.y + box.height;

  // Check if line is completely outside the box
  if (
    (lineStart.x < boxLeft && lineEnd.x < boxLeft) ||
    (lineStart.x > boxRight && lineEnd.x > boxRight) ||
    (lineStart.y < boxTop && lineEnd.y < boxTop) ||
    (lineStart.y > boxBottom && lineEnd.y > boxBottom)
  ) {
    return false;
  }

  // Check if either point is inside the box
  if (pointInBox(lineStart, box) || pointInBox(lineEnd, box)) {
    return true;
  }

  // Check if line intersects any of the four box edges
  return (
    lineIntersectsLine(lineStart, lineEnd, { x: boxLeft, y: boxTop }, { x: boxRight, y: boxTop }) ||
    lineIntersectsLine(lineStart, lineEnd, { x: boxRight, y: boxTop }, { x: boxRight, y: boxBottom }) ||
    lineIntersectsLine(lineStart, lineEnd, { x: boxRight, y: boxBottom }, { x: boxLeft, y: boxBottom }) ||
    lineIntersectsLine(lineStart, lineEnd, { x: boxLeft, y: boxBottom }, { x: boxLeft, y: boxTop })
  );
}

/**
 * Check if a point is inside a bounding box
 */
export function pointInBox(point: Position, box: BoundingBox): boolean {
  return (
    point.x >= box.x &&
    point.x <= box.x + box.width &&
    point.y >= box.y &&
    point.y <= box.y + box.height
  );
}

/**
 * Check if two line segments intersect
 */
function lineIntersectsLine(
  p1: Position,
  p2: Position,
  p3: Position,
  p4: Position
): boolean {
  const d1 = direction(p3, p4, p1);
  const d2 = direction(p3, p4, p2);
  const d3 = direction(p1, p2, p3);
  const d4 = direction(p1, p2, p4);

  if (((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) &&
      ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0))) {
    return true;
  }

  if (d1 === 0 && onSegment(p3, p1, p4)) return true;
  if (d2 === 0 && onSegment(p3, p2, p4)) return true;
  if (d3 === 0 && onSegment(p1, p3, p2)) return true;
  if (d4 === 0 && onSegment(p1, p4, p2)) return true;

  return false;
}

/**
 * Calculate direction of turn for three points
 */
function direction(p1: Position, p2: Position, p3: Position): number {
  return (p2.x - p1.x) * (p3.y - p1.y) - (p3.x - p1.x) * (p2.y - p1.y);
}

/**
 * Check if point q is on segment pr
 */
function onSegment(p: Position, q: Position, r: Position): boolean {
  return (
    q.x <= Math.max(p.x, r.x) &&
    q.x >= Math.min(p.x, r.x) &&
    q.y <= Math.max(p.y, r.y) &&
    q.y >= Math.min(p.y, r.y)
  );
}

/**
 * Find obstacles (nodes) that a path would intersect with
 */
export function findPathObstacles(
  path: number[],
  obstacles: BoundingBox[]
): BoundingBox[] {
  const intersectingObstacles: BoundingBox[] = [];

  for (let i = 0; i < path.length - 2; i += 2) {
    const start = { x: path[i], y: path[i + 1] };
    const end = { x: path[i + 2], y: path[i + 3] };

    for (const obstacle of obstacles) {
      if (lineIntersectsBox(start, end, obstacle)) {
        if (!intersectingObstacles.includes(obstacle)) {
          intersectingObstacles.push(obstacle);
        }
      }
    }
  }

  return intersectingObstacles;
}

/**
 * Adjust path to avoid obstacles
 */
export function adjustPathForObstacles(
  path: number[],
  obstacles: BoundingBox[],
  _padding: number = 10
): number[] {
  const intersectingObstacles = findPathObstacles(path, obstacles);

  if (intersectingObstacles.length === 0) {
    return path;
  }

  // For now, return the original path
  // TODO: Implement proper obstacle avoidance algorithm
  return path;
}