import React, { useCallback } from 'react';

interface TagItemProps {
  id: string;
  label: string;
  icon?: string;
}

const TagItem: React.FC<TagItemProps> = ({ label, icon }) => {
  const handleDragStart = useCallback((e: React.DragEvent) => {
    e.dataTransfer.setData('nodeType', 'tag');
    e.dataTransfer.setData('label', label);
    e.dataTransfer.effectAllowed = 'copy';
  }, [label]);

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className="flex items-center gap-2 p-2 bg-gray-50 hover:bg-gray-100 rounded cursor-move transition-colors"
    >
      {icon && <span className="text-lg">{icon}</span>}
      <span className="text-sm text-gray-700">{label}</span>
    </div>
  );
};

export default TagItem;