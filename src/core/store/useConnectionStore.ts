import { create } from 'zustand';
import { ConnectionId, PortId, NodeId, Position, ConnectionModel, validateConnection } from '../models';

interface ConnectionStore {
  connections: Record<ConnectionId, ConnectionModel>;

  // Actions
  addConnection: (connection: ConnectionModel) => { success: boolean; message?: string };
  removeConnection: (id: ConnectionId) => void;
  removeConnectionsByPort: (portId: PortId) => void;
  removeConnectionsByNode: (nodeId: NodeId, ports: PortId[]) => void;
  selectConnection: (id: ConnectionId, isMultiSelect?: boolean) => void;
  clearConnectionSelection: () => void;
  updateConnectionWaypoints: (id: ConnectionId, waypoints: Position[]) => void;
  addConnectionWaypoint: (id: ConnectionId, waypoint: Position, index: number) => void;
  removeConnectionWaypoint: (id: ConnectionId, index: number) => void;

  // Selectors
  getConnection: (id: ConnectionId) => ConnectionModel | undefined;
  getPortConnections: (portId: PortId) => ConnectionModel[];
  getSelectedConnections: () => ConnectionModel[];
  getAllConnections: () => ConnectionModel[];
  isValidConnection: (fromPortId: PortId, toPortId: PortId) => { valid: boolean; message?: string };
}

export const useConnectionStore = create<ConnectionStore>((set, get) => ({
  connections: {},

  addConnection: (connection) => {
    // Get ports from the global store
    const portStore = (window as any).__portStore;
    const ports = portStore?.getState?.()?.ports || {};

    const state = get();
    const validationResult = validateConnection(
      connection.fromPortId,
      connection.toPortId,
      Object.values(state.connections),
      ports
    );

    const isValid = typeof validationResult === 'boolean' ? validationResult : validationResult.valid;
    const message = typeof validationResult === 'object' ? validationResult.message : undefined;

    if (isValid) {
      set((state) => ({
        connections: { ...state.connections, [connection.id]: connection }
      }));
      return { success: true };
    }
    return { success: false, message };
  },

  removeConnection: (id) => {
    set((state) => {
      const { [id]: removed, ...remainingConnections } = state.connections;
      return { connections: remainingConnections };
    });
  },

  removeConnectionsByPort: (portId) => {
    set((state) => {
      const newConnections = { ...state.connections };
      Object.keys(newConnections).forEach((connId) => {
        const conn = newConnections[connId];
        if (conn.fromPortId === portId || conn.toPortId === portId) {
          delete newConnections[connId];
        }
      });
      return { connections: newConnections };
    });
  },

  removeConnectionsByNode: (_, ports) => {
    set((state) => {
      const newConnections = { ...state.connections };
      const portSet = new Set(ports);

      Object.keys(newConnections).forEach((connId) => {
        const conn = newConnections[connId];
        if (portSet.has(conn.fromPortId) || portSet.has(conn.toPortId)) {
          delete newConnections[connId];
        }
      });
      return { connections: newConnections };
    });
  },

  selectConnection: (id, isMultiSelect = false) => {
    set((state) => {
      const updatedConnections = { ...state.connections };

      if (!isMultiSelect) {
        // Clear all selections first
        Object.keys(updatedConnections).forEach((connId) => {
          updatedConnections[connId] = { ...updatedConnections[connId], selected: false };
        });
      }

      // Select the target connection
      updatedConnections[id] = { ...updatedConnections[id], selected: true };

      return { connections: updatedConnections };
    });
  },

  clearConnectionSelection: () => {
    set((state) => {
      const updatedConnections = { ...state.connections };
      Object.keys(updatedConnections).forEach((connId) => {
        updatedConnections[connId] = { ...updatedConnections[connId], selected: false };
      });
      return { connections: updatedConnections };
    });
  },

  updateConnectionWaypoints: (id, waypoints) => {
    set((state) => ({
      connections: {
        ...state.connections,
        [id]: { ...state.connections[id], waypoints }
      }
    }));
  },

  addConnectionWaypoint: (id, waypoint, index) => {
    set((state) => {
      const connection = state.connections[id];
      if (!connection) return state;

      const waypoints = [...(connection.waypoints || [])];
      waypoints.splice(index, 0, waypoint);

      return {
        connections: {
          ...state.connections,
          [id]: { ...connection, waypoints }
        }
      };
    });
  },

  removeConnectionWaypoint: (id, index) => {
    set((state) => {
      const connection = state.connections[id];
      if (!connection || !connection.waypoints) return state;

      const waypoints = [...connection.waypoints];
      waypoints.splice(index, 1);

      return {
        connections: {
          ...state.connections,
          [id]: { ...connection, waypoints: waypoints.length > 0 ? waypoints : undefined }
        }
      };
    });
  },

  getConnection: (id) => get().connections[id],

  getPortConnections: (portId) => {
    return Object.values(get().connections).filter(
      (conn) => conn.fromPortId === portId || conn.toPortId === portId
    );
  },

  getSelectedConnections: () => {
    return Object.values(get().connections).filter((conn) => conn.selected);
  },

  getAllConnections: () => Object.values(get().connections),

  isValidConnection: (fromPortId, toPortId) => {
    const portStore = (window as any).__portStore;
    const ports = portStore?.getState?.()?.ports || {};

    const state = get();
    const result = validateConnection(fromPortId, toPortId, Object.values(state.connections), ports);

    if (typeof result === 'boolean') {
      return { valid: result };
    }
    return result;
  }
}));