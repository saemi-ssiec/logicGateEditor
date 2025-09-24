import { create } from 'zustand';
import { PortId, NodeId, PortModel } from '../models';

interface PortStore {
  ports: Record<PortId, PortModel>;

  // Actions
  addPort: (port: PortModel) => void;
  addPorts: (ports: PortModel[]) => void;
  updatePort: (id: PortId, updates: Partial<PortModel>) => void;
  removePort: (id: PortId) => void;
  removePortsByNode: (nodeId: NodeId) => void;
  setPortConnected: (id: PortId, connected: boolean) => void;

  // Selectors
  getPort: (id: PortId) => PortModel | undefined;
  getNodePorts: (nodeId: NodeId) => PortModel[];
  getNodeInputPorts: (nodeId: NodeId) => PortModel[];
  getNodeOutputPorts: (nodeId: NodeId) => PortModel[];
}

export const usePortStore = create<PortStore>((set, get) => ({
  ports: {},

  addPort: (port) => {
    set((state) => ({
      ports: { ...state.ports, [port.id]: port }
    }));
  },

  addPorts: (ports) => {
    set((state) => {
      const newPorts = { ...state.ports };
      ports.forEach((port) => {
        newPorts[port.id] = port;
      });
      return { ports: newPorts };
    });
  },

  updatePort: (id, updates) => {
    set((state) => ({
      ports: {
        ...state.ports,
        [id]: { ...state.ports[id], ...updates }
      }
    }));
  },

  removePort: (id) => {
    set((state) => {
      const { [id]: removed, ...remainingPorts } = state.ports;
      return { ports: remainingPorts };
    });
  },

  removePortsByNode: (nodeId) => {
    set((state) => {
      const newPorts = { ...state.ports };
      Object.keys(newPorts).forEach((portId) => {
        if (newPorts[portId].nodeId === nodeId) {
          delete newPorts[portId];
        }
      });
      return { ports: newPorts };
    });
  },

  setPortConnected: (id, connected) => {
    set((state) => ({
      ports: {
        ...state.ports,
        [id]: { ...state.ports[id], connected }
      }
    }));
  },

  getPort: (id) => get().ports[id],

  getNodePorts: (nodeId) => {
    return Object.values(get().ports).filter((port) => port.nodeId === nodeId);
  },

  getNodeInputPorts: (nodeId) => {
    return Object.values(get().ports).filter(
      (port) => port.nodeId === nodeId && port.direction === 'input'
    );
  },

  getNodeOutputPorts: (nodeId) => {
    return Object.values(get().ports).filter(
      (port) => port.nodeId === nodeId && port.direction === 'output'
    );
  }
}));

// Expose the port store to window for cross-store access
if (typeof window !== 'undefined') {
  (window as any).__portStore = usePortStore;
}