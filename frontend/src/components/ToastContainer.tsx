import React, { useState, useCallback } from 'react';
import Toast, { ToastProps } from './Toast';

interface ToastItem extends Omit<ToastProps, 'onClose'> {
  id: number;
}

interface ToastContainerProps {
  children: (showToast: (message: string, type: ToastProps['type']) => void) => React.ReactNode;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((message: string, type: ToastProps['type'] = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <>
      {children(showToast)}
      <div className="toast-container">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </>
  );
};

export default ToastContainer;
