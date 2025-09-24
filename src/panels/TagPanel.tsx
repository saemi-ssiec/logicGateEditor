import React, { useState } from 'react';
import TagItem from './TagItem';

const tagTypes = [
  { id: 'enremote', label: 'ENREMOTE' },
  { id: 'enlock', label: 'ENLOCK' },
];

const TagPanel: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className={`${isCollapsed ? 'w-12' : 'w-48'} bg-white border-r border-gray-200 transition-all duration-300`}>
      <div className="p-2 flex items-center justify-between">
        {!isCollapsed && <h3 className="text-sm font-semibold text-gray-700">Tags</h3>}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 hover:bg-gray-100 rounded transition-colors"
          aria-label={isCollapsed ? 'Expand panel' : 'Collapse panel'}
        >
          <svg
            className={`w-5 h-5 text-gray-600 transition-transform ${isCollapsed ? '' : 'rotate-180'}`}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M9 5l7 7-7 7"></path>
          </svg>
        </button>
      </div>
      {!isCollapsed && (
        <div className="px-4 pb-4 space-y-2">
          {tagTypes.map((tag) => (
            <TagItem
              key={tag.id}
              id={tag.id}
              label={tag.label}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TagPanel;