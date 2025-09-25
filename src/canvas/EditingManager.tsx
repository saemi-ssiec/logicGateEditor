import React, { useState, useCallback, useEffect } from 'react';
import InlineEditInput from './elements/InlineEditInput';
import { useNodeStore } from '../core/store';
import { GateNode } from '../core/models';

interface EditingState {
  nodeId: string | null;
  position: { x: number; y: number };
  value: string;
  type: 'text' | 'number';
  width: number;
}

const EditingManager: React.FC = () => {
  const [editingState, setEditingState] = useState<EditingState | null>(null);
  const { nodes, updateNode } = useNodeStore();

  // Listen for double-click events from the window
  useEffect(() => {
    const handleDoubleClick = (event: any) => {
      const detail = event.detail;
      if (!detail) return;

      const { nodeId, gateType, position, width } = detail;
      const node = nodes[nodeId] as GateNode;

      if (!node) return;

      console.log('EditingManager: Starting edit for node:', nodeId, gateType);

      // Determine the current value and type
      let value = '';
      let type: 'text' | 'number' = 'text';

      if (gateType === 'LABEL') {
        value = node.customLabel || 'LABEL';
        type = 'text';
      } else if (gateType === 'PDTIMER') {
        value = String(node.timerValue || 5);
        type = 'number';
      }

      setEditingState({
        nodeId,
        position,
        value,
        type,
        width
      });
    };

    window.addEventListener('gate-edit-start', handleDoubleClick);

    return () => {
      window.removeEventListener('gate-edit-start', handleDoubleClick);
    };
  }, [nodes]);

  const handleSave = useCallback((value: string) => {
    if (!editingState || !editingState.nodeId) return;

    const node = nodes[editingState.nodeId] as GateNode;
    if (!node) return;

    console.log('EditingManager: Saving value:', value, 'for node:', editingState.nodeId);

    if (node.gateType === 'LABEL') {
      updateNode(editingState.nodeId, { customLabel: value });
    } else if (node.gateType === 'PDTIMER') {
      const numValue = parseFloat(value);
      if (!isNaN(numValue) && numValue > 0) {
        updateNode(editingState.nodeId, { timerValue: numValue });
      }
    }

    setEditingState(null);
  }, [editingState, nodes, updateNode]);

  const handleCancel = useCallback(() => {
    console.log('EditingManager: Cancelling edit');
    setEditingState(null);
  }, []);

  if (!editingState) {
    return null;
  }

  return (
    <InlineEditInput
      value={editingState.value}
      position={editingState.position}
      width={editingState.width}
      onSave={handleSave}
      onCancel={handleCancel}
      type={editingState.type}
      placeholder={editingState.type === 'text' ? 'Enter label...' : 'Enter seconds...'}
    />
  );
};

export default EditingManager;