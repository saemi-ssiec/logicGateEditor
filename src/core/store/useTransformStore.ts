import { create } from 'zustand';
import { Position } from '../types';

interface TransformStore {
  scale: number;
  position: Position;
  minScale: number;
  maxScale: number;
  gridSize: number;
  snapToGrid: boolean;

  // Actions
  setScale: (scale: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  zoomToFit: () => void;
  resetZoom: () => void;
  pan: (deltaX: number, deltaY: number) => void;
  setPosition: (position: Position) => void;
  centerView: () => void;
  toggleSnapToGrid: () => void;
  setGridSize: (size: number) => void;

  // Utilities
  screenToCanvas: (screenPos: Position) => Position;
  canvasToScreen: (canvasPos: Position) => Position;
  snapToGridPosition: (position: Position) => Position;
}

export const useTransformStore = create<TransformStore>((set, get) => ({
  scale: 1,
  position: { x: 0, y: 0 },
  minScale: 0.1,
  maxScale: 5,
  gridSize: 10,
  snapToGrid: true,

  setScale: (scale) => {
    const { minScale, maxScale } = get();
    const clampedScale = Math.min(Math.max(scale, minScale), maxScale);
    set({ scale: clampedScale });
  },

  zoomIn: () => {
    const { scale, setScale } = get();
    setScale(scale * 1.2);
  },

  zoomOut: () => {
    const { scale, setScale } = get();
    setScale(scale / 1.2);
  },

  zoomToFit: () => {
    // This would need to calculate bounds of all nodes
    // and adjust scale and position accordingly
    // For now, just reset
    set({ scale: 1, position: { x: 0, y: 0 } });
  },

  resetZoom: () => {
    set({ scale: 1, position: { x: 0, y: 0 } });
  },

  pan: (deltaX, deltaY) => {
    set((state) => ({
      position: {
        x: state.position.x + deltaX,
        y: state.position.y + deltaY
      }
    }));
  },

  setPosition: (position) => {
    set({ position });
  },

  centerView: () => {
    set({ position: { x: 0, y: 0 } });
  },

  toggleSnapToGrid: () => {
    set((state) => ({ snapToGrid: !state.snapToGrid }));
  },

  setGridSize: (size) => {
    set({ gridSize: Math.max(1, size) });
  },

  screenToCanvas: (screenPos) => {
    const { scale, position } = get();
    return {
      x: (screenPos.x - position.x) / scale,
      y: (screenPos.y - position.y) / scale
    };
  },

  canvasToScreen: (canvasPos) => {
    const { scale, position } = get();
    return {
      x: canvasPos.x * scale + position.x,
      y: canvasPos.y * scale + position.y
    };
  },

  snapToGridPosition: (position) => {
    const { snapToGrid, gridSize } = get();
    if (!snapToGrid) return position;

    return {
      x: Math.round(position.x / gridSize) * gridSize,
      y: Math.round(position.y / gridSize) * gridSize
    };
  }
}));