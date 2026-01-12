import React, { createContext, useContext, useState, useCallback } from 'react';
import Toast, { ToastType } from '../components/Toast';

interface ToastContextType {
  showToast: (message: string, type?: ToastType, title?: string, duration?: number) => void;
  hideToast: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [title, setTitle] = useState<string | undefined>(undefined);
  const [type, setType] = useState<ToastType>('info');
  const [duration, setDuration] = useState(4000);

  const showToast = useCallback((msg: string, toastType: ToastType = 'info', customTitle?: string, dur: number = 4000) => {
    setMessage(msg);
    setType(toastType);
    setTitle(customTitle);
    setDuration(dur);
    setVisible(true);
  }, []);

  const hideToast = useCallback(() => {
    setVisible(false);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      <Toast
        visible={visible}
        message={message}
        title={title}
        type={type}
        duration={duration}
        onDismiss={hideToast}
      />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
