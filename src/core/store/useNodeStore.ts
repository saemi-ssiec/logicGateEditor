import { create } from 'zustand';
import { NodeId, NodeModel } from '../models';

interface NodeStore {
  nodes: Record<NodeId, NodeModel>;
  renderOrder: NodeId[];

  // Actions
  addNode: (node: NodeModel) => void;
  updateNode: (id: NodeId, updates: Partial<NodeModel>) => void;
  removeNode: (id: NodeId) => void;
  moveNode: (id: NodeId, x: number, y: number) => void;
  selectNode: (id: NodeId, isMultiSelect?: boolean) => void;
  clearNodeSelection: () => void;
  bringNodeToFront: (id: NodeId) => void;

  // Selectors
  getNode: (id: NodeId) => NodeModel | undefined;
  getSelectedNodes: () => NodeModel[];
  getAllNodes: () => NodeModel[];
}

export const useNodeStore = create<NodeStore>((set, get) => ({
  nodes: {},
  renderOrder: [],

  addNode: (node) => {
    set((state) => ({
      nodes: { ...state.nodes, [node.id]: node },
      renderOrder: [...state.renderOrder, node.id]
    }));
  },

  updateNode: (id, updates) => {
    set((state) => ({
      nodes: {
        ...state.nodes,
        [id]: { ...state.nodes[id], ...updates } as NodeModel
      }
    }));
  },

  removeNode: (id) => {
    set((state) => {
      const { [id]: removed, ...remainingNodes } = state.nodes;
      return {
        nodes: remainingNodes,
        renderOrder: state.renderOrder.filter((nodeId) => nodeId !== id)
      };
    });
  },

  moveNode: (id, x, y) => {
    set((state) => ({
      nodes: {
        ...state.nodes,
        [id]: {
          ...state.nodes[id],
          position: { x, y }
        }
      }
    }));
  },

  selectNode: (id, isMultiSelect = false) => {
    set((state) => {
      const updatedNodes = { ...state.nodes };

      if (!isMultiSelect) {
        // Clear all selections first
        Object.keys(updatedNodes).forEach((nodeId) => {
          updatedNodes[nodeId] = { ...updatedNodes[nodeId], selected: false };
        });
      }

      // Select the target node
      updatedNodes[id] = { ...updatedNodes[id], selected: true };

      return { nodes: updatedNodes };
    });
  },

  clearNodeSelection: () => {
    set((state) => {
      const updatedNodes = { ...state.nodes };
      Object.keys(updatedNodes).forEach((nodeId) => {
        updatedNodes[nodeId] = { ...updatedNodes[nodeId], selected: false };
      });
      return { nodes: updatedNodes };
    });
  },

  bringNodeToFront: (id) => {
    set((state) => {
      const newOrder = state.renderOrder.filter((nodeId) => nodeId !== id);
      newOrder.push(id);
      return { renderOrder: newOrder };
    });
  },

  getNode: (id) => get().nodes[id],

  getSelectedNodes: () => {
    const state = get();
    return Object.values(state.nodes).filter((node) => node.selected);
  },

  getAllNodes: () => Object.values(get().nodes)
}));