// Feito por Gustavo Bezerra - Toast Premium
import { useEffect, useState } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
}

const toastConfig = {
  success: {
    icon: 'check-circle',
    gradient: 'from-emerald-500 to-teal-600',
    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    border: 'border-emerald-200/50 dark:border-emerald-800/50',
    text: 'text-emerald-800 dark:text-emerald-200',
  },
  error: {
    icon: 'circle-xmark',
    gradient: 'from-red-500 to-rose-600',
    bg: 'bg-red-50 dark:bg-red-900/20',
    border: 'border-red-200/50 dark:border-red-800/50',
    text: 'text-red-800 dark:text-red-200',
  },
  info: {
    icon: 'circle-info',
    gradient: 'from-indigo-500 to-purple-600',
    bg: 'bg-indigo-50 dark:bg-indigo-900/20',
    border: 'border-indigo-200/50 dark:border-indigo-800/50',
    text: 'text-indigo-800 dark:text-indigo-200',
  },
  warning: {
    icon: 'triangle-exclamation',
    gradient: 'from-amber-500 to-orange-600',
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    border: 'border-amber-200/50 dark:border-amber-800/50',
    text: 'text-amber-800 dark:text-amber-200',
  },
};

export function Toast({ message, type, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(100);
  const config = toastConfig[type] || toastConfig.info;

  useEffect(() => {
    const duration = 4000;
    const interval = 50;
    const decrement = (interval / duration) * 100;

    const progressTimer = setInterval(() => {
      setProgress((prev) => Math.max(0, prev - decrement));
    }, interval);

    const closeTimer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, duration);

    return () => {
      clearTimeout(closeTimer);
      clearInterval(progressTimer);
    };
  }, [onClose]);

  return (
    <div
      className={`
        relative overflow-hidden
        ${config.bg} ${config.border}
        backdrop-blur-xl
        border rounded-2xl
        shadow-xl
        transition-all duration-300
        ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}
      `}
    >
      <div className="flex items-start gap-3 p-4">
        {/* Icon */}
        <div className={`
          flex-shrink-0 w-10 h-10 rounded-xl
          bg-gradient-to-br ${config.gradient}
          flex items-center justify-center
          shadow-lg
        `}>
          <i className={`fa-solid fa-${config.icon} text-white`}></i>
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0 pt-1">
          <p className={`text-sm font-medium ${config.text}`}>
            {message}
          </p>
        </div>
        
        {/* Close button */}
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(onClose, 300);
          }}
          className={`
            flex-shrink-0 p-1.5 rounded-lg
            ${config.text} opacity-60 hover:opacity-100
            hover:bg-black/5 dark:hover:bg-white/5
            transition-all duration-200
          `}
        >
          <i className="fa-solid fa-xmark text-sm"></i>
        </button>
      </div>
      
      {/* Progress bar */}
      <div className="h-1 bg-black/5 dark:bg-white/5">
        <div 
          className={`h-full bg-gradient-to-r ${config.gradient} transition-all duration-100 ease-linear`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
}

let toastId = 0;
let toastCallback: ((toast: ToastItem) => void) | null = null;

export function showToast(message: string, type: ToastType = 'info') {
  if (toastCallback) {
    toastCallback({ id: ++toastId, message, type });
  }
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    toastCallback = (toast) => {
      setToasts((prev) => [...prev, toast]);
    };
    return () => {
      toastCallback = null;
    };
  }, []);

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      {toasts.map((toast, index) => (
        <div 
          key={toast.id} 
          className="pointer-events-auto animate-slide-up"
          style={{ 
            animationDelay: `${index * 0.05}s`,
            animationFillMode: 'both'
          }}
        >
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        </div>
      ))}
    </div>
  );
}
