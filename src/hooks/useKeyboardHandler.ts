import { useEffect, useCallback } from 'react';
import { useNodeStore, useConnectionStore, usePortStore } from '../core/store';

export const useKeyboardHandler = () => {
  const { removeNode, clearNodeSelection, getSelectedNodes } = useNodeStore();
  const { removeConnection, clearConnectionSelection, getSelectedConnections, removeConnectionsByNode } = useConnectionStore();
  const { removePortsByNode, setPortConnected, getNodePorts } = usePortStore();

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Ignore if user is typing in an input field
    if (
      event.target instanceof HTMLInputElement ||
      event.target instanceof HTMLTextAreaElement ||
      (event.target as any)?.isContentEditable
    ) {
      return;
    }

    switch (event.key) {
      case 'Delete':
      case 'Backspace':
        event.preventDefault();

        // Delete selected connections first
        const selectedConnections = getSelectedConnections();
        selectedConnections.forEach(connection => {
          // Update port connection status
          setPortConnected(connection.fromPortId, false);
          setPortConnected(connection.toPortId, false);
          removeConnection(connection.id);
        });

        // Delete selected nodes
        const selectedNodes = getSelectedNodes();
        selectedNodes.forEach(node => {
          // Get all ports for this node
          const nodePorts = getNodePorts(node.id);
          const portIds = nodePorts.map(port => port.id);

          // Remove all connections related to this node
          removeConnectionsByNode(node.id, portIds);

          // Remove all ports for this node
          removePortsByNode(node.id);

          // Remove the node itself
          removeNode(node.id);
        });

        // Clear selections after deletion
        if (selectedConnections.length > 0 || selectedNodes.length > 0) {
          clearConnectionSelection();
          clearNodeSelection();
          console.log('Deleted:', selectedConnections.length, 'connections and', selectedNodes.length, 'nodes');
        }
        break;

      case 'Escape':
        event.preventDefault();
        clearConnectionSelection();
        clearNodeSelection();
        console.log('Cleared all selections');
        break;
    }
  }, [
    removeNode,
    removeConnection,
    clearNodeSelection,
    clearConnectionSelection,
    getSelectedNodes,
    getSelectedConnections,
    removeConnectionsByNode,
    removePortsByNode,
    setPortConnected,
    getNodePorts
  ]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
};