import React, { useRef, useEffect } from 'react';

interface InlineEditInputProps {
  value: string;
  position: { x: number; y: number };
  width: number;
  onSave: (value: string) => void;
  onCancel: () => void;
  type?: 'text' | 'number';
  placeholder?: string;
}

const InlineEditInput: React.FC<InlineEditInputProps> = ({
  value,
  position,
  width,
  onSave,
  onCancel,
  type = 'text',
  placeholder = 'Enter value...'
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSave(inputRef.current?.value || '');
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  const handleBlur = () => {
    onSave(inputRef.current?.value || '');
  };

  return (
    <div
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        zIndex: 999999,
        backgroundColor: 'transparent',
      }}
    >
      <input
        ref={inputRef}
        type={type}
        defaultValue={value}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        placeholder={placeholder}
        min={type === 'number' ? '1' : undefined}
        step={type === 'number' ? '1' : undefined}
        style={{
          width: `${Math.max(width, 100)}px`,
          height: '32px',
          fontSize: '14px',
          fontFamily: 'monospace',
          fontWeight: 'bold',
          textAlign: 'center',
          border: '3px solid #6366f1',
          borderRadius: '6px',
          padding: '4px 8px',
          backgroundColor: '#ffffff',
          color: '#1f2937',
          outline: 'none',
          boxShadow: '0 4px 20px rgba(99, 102, 241, 0.3), 0 2px 8px rgba(0,0,0,0.1)',
          display: 'block',
        }}
      />
    </div>
  );
};

export default InlineEditInput;