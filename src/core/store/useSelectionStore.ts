import { create } from 'zustand';
import { NodeId, PortId, ConnectionId } from '../types';

interface SelectionStore {
  selectedNodes: Set<NodeId>;
  selectedPorts: Set<PortId>;
  selectedConnections: Set<ConnectionId>;
  selectionBox: {
    start: { x: number; y: number };
    end: { x: number; y: number };
  } | null;
  isMultiSelecting: boolean;

  // Actions
  selectNode: (id: NodeId, isMulti?: boolean) => void;
  selectPort: (id: PortId, isMulti?: boolean) => void;
  selectConnection: (id: ConnectionId, isMulti?: boolean) => void;
  selectMultipleNodes: (ids: NodeId[]) => void;
  deselectNode: (id: NodeId) => void;
  deselectAll: () => void;
  startSelectionBox: (x: number, y: number) => void;
  updateSelectionBox: (x: number, y: number) => void;
  endSelectionBox: () => void;

  // Selectors
  isNodeSelected: (id: NodeId) => boolean;
  isPortSelected: (id: PortId) => boolean;
  isConnectionSelected: (id: ConnectionId) => boolean;
  getSelectedNodeIds: () => NodeId[];
  getSelectedPortIds: () => PortId[];
  getSelectedConnectionIds: () => ConnectionId[];
}

export const useSelectionStore = create<SelectionStore>((set, get) => ({
  selectedNodes: new Set(),
  selectedPorts: new Set(),
  selectedConnections: new Set(),
  selectionBox: null,
  isMultiSelecting: false,

  selectNode: (id, isMulti = false) => {
    set((state) => {
      const newSelection = new Set(isMulti ? state.selectedNodes : []);
      newSelection.add(id);
      return {
        selectedNodes: newSelection,
        selectedPorts: isMulti ? state.selectedPorts : new Set(),
        selectedConnections: isMulti ? state.selectedConnections : new Set()
      };
    });
  },

  selectPort: (id, isMulti = false) => {
    set((state) => {
      const newSelection = new Set(isMulti ? state.selectedPorts : []);
      newSelection.add(id);
      return {
        selectedPorts: newSelection,
        selectedNodes: isMulti ? state.selectedNodes : new Set(),
        selectedConnections: isMulti ? state.selectedConnections : new Set()
      };
    });
  },

  selectConnection: (id, isMulti = false) => {
    set((state) => {
      const newSelection = new Set(isMulti ? state.selectedConnections : []);
      newSelection.add(id);
      return {
        selectedConnections: newSelection,
        selectedNodes: isMulti ? state.selectedNodes : new Set(),
        selectedPorts: isMulti ? state.selectedPorts : new Set()
      };
    });
  },

  selectMultipleNodes: (ids) => {
    set(() => ({
      selectedNodes: new Set(ids),
      selectedPorts: new Set(),
      selectedConnections: new Set()
    }));
  },

  deselectNode: (id) => {
    set((state) => {
      const newSelection = new Set(state.selectedNodes);
      newSelection.delete(id);
      return { selectedNodes: newSelection };
    });
  },

  deselectAll: () => {
    set(() => ({
      selectedNodes: new Set(),
      selectedPorts: new Set(),
      selectedConnections: new Set()
    }));
  },

  startSelectionBox: (x, y) => {
    set(() => ({
      selectionBox: { start: { x, y }, end: { x, y } },
      isMultiSelecting: true
    }));
  },

  updateSelectionBox: (x, y) => {
    set((state) => ({
      selectionBox: state.selectionBox
        ? { ...state.selectionBox, end: { x, y } }
        : null
    }));
  },

  endSelectionBox: () => {
    set(() => ({
      selectionBox: null,
      isMultiSelecting: false
    }));
  },

  isNodeSelected: (id) => get().selectedNodes.has(id),
  isPortSelected: (id) => get().selectedPorts.has(id),
  isConnectionSelected: (id) => get().selectedConnections.has(id),
  getSelectedNodeIds: () => Array.from(get().selectedNodes),
  getSelectedPortIds: () => Array.from(get().selectedPorts),
  getSelectedConnectionIds: () => Array.from(get().selectedConnections)
}));