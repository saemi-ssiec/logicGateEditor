import React, { useCallback } from 'react';
import { GateType } from '../core/types';

interface GateItemProps {
  gateType: GateType;
  label: string;
}

const GateItem: React.FC<GateItemProps> = ({ gateType, label }) => {
  const handleDragStart = useCallback((e: React.DragEvent) => {
    e.dataTransfer.setData('nodeType', 'gate');
    e.dataTransfer.setData('gateType', gateType);
    e.dataTransfer.setData('label', label);
    e.dataTransfer.effectAllowed = 'copy';
  }, [gateType, label]);

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className="flex items-center gap-2 p-2 bg-gray-50 hover:bg-gray-100 rounded cursor-move transition-colors"
    >
      {/* <div className="w-8 h-6 bg-indigo-100 rounded flex items-center justify-center">
        <span className="text-xs font-mono font-bold text-indigo-600">
          {gateType}
        </span>
      </div> */}
      <span className="text-sm text-gray-700">{label}</span>
    </div>
  );
};

export default GateItem;