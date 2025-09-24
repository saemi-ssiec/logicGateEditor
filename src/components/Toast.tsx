import React from 'react';
import { create } from 'zustand';

interface ToastState {
  messages: { id: string; text: string; type: 'info' | 'warning' | 'error' | 'success' }[];
  addToast: (text: string, type?: 'info' | 'warning' | 'error' | 'success') => void;
  removeToast: (id: string) => void;
}

export const useToastStore = create<ToastState>((set) => ({
  messages: [],
  addToast: (text, type = 'info') => {
    const id = Date.now().toString();
    set((state) => ({
      messages: [...state.messages, { id, text, type }]
    }));

    // Auto remove after 3 seconds
    setTimeout(() => {
      set((state) => ({
        messages: state.messages.filter((msg) => msg.id !== id)
      }));
    }, 3000);
  },
  removeToast: (id) => {
    set((state) => ({
      messages: state.messages.filter((msg) => msg.id !== id)
    }));
  }
}));

const Toast: React.FC = () => {
  const { messages, removeToast } = useToastStore();

  if (messages.length === 0) {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }}
    >
      {messages.map((message) => (
        <div
          key={message.id}
          style={{
            padding: '12px 20px',
            borderRadius: '8px',
            backgroundColor:
              message.type === 'error'
                ? '#dc2626'
                : message.type === 'warning'
                ? '#f59e0b'
                : message.type === 'success'
                ? '#10b981'
                : '#3b82f6',
            color: '#ffffff',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            fontSize: '14px',
            fontWeight: '500',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            cursor: 'pointer',
            animation: 'slideIn 0.3s ease-out',
            minWidth: '250px',
            maxWidth: '400px'
          }}
          onClick={() => removeToast(message.id)}
        >
          {message.text}
        </div>
      ))}
      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default Toast;