import React, { useState } from 'react';
import GateItem from './GateItem';
import { GateType } from '../core/types';

const gateTypes: { type: GateType; label: string }[] = [
  { type: 'AND', label: 'AND' },
  { type: 'OR', label: 'OR' },
  { type: 'NAND', label: 'NAND' },
  { type: 'NOR', label: 'NOR' },
  { type: 'NOT', label: 'NOT' },
  { type: 'COMPARATOR', label: 'Comparator' },
  { type: 'RISING', label: 'Rising' },
  { type: 'FALLING', label: 'Falling' },
  { type: 'TIMER', label: 'Timer' },
  { type: 'LABEL', label: 'Label' },
  { type: 'SWITCH', label: 'Switch' },
];

const GatePanel: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className={`${isCollapsed ? 'w-12' : 'w-60'} bg-white transition-all duration-300`}>
      <div className="p-2 flex items-center justify-between">
        {!isCollapsed && <h3 className="text-sm font-semibold text-gray-700">Gates</h3>}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 hover:bg-gray-100 rounded transition-colors"
          aria-label={isCollapsed ? 'Expand panel' : 'Collapse panel'}
        >
          <svg
            className={`w-5 h-5 text-gray-600 transition-transform ${isCollapsed ? 'rotate-180' : ''}`}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M15 5l-7 7 7 7"></path>
          </svg>
        </button>
      </div>
      {!isCollapsed && (
        <div className="px-4 pb-4 space-y-2 overflow-y-auto max-h-[calc(100vh-60px)]">
          {gateTypes.map((gate) => (
            <GateItem
              key={gate.type}
              gateType={gate.type}
              label={gate.label}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default GatePanel;