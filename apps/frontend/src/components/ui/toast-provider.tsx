'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { Toast } from './toast';

type ToastItem = {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
};

type ToastContextType = {
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
};

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const showToast = useCallback(
    (message: string, type: 'success' | 'error' | 'info' = 'info') => {
      const id = Date.now();

      setItems((prev) => [...prev, { id, message, type }]);

      setTimeout(() => {
        setItems((prev) => prev.filter((item) => item.id !== id));
      }, 3000);
    },
    [],
  );

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}

      <div className="fixed right-4 top-4 z-[999] w-full max-w-sm space-y-3">
        {items.map((item) => (
          <Toast key={item.id} message={item.message} type={item.type} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error('useToast deve ser usado dentro de ToastProvider');
  }

  return context;
}
