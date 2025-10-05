import React from 'react';
import toast from 'react-hot-toast';

export const useNotifications = () => {
  const showSuccess = (message: string) => {
    toast.success(message);
  };

  const showError = (message: string) => {
    toast.error(message);
  };

  const showWarning = (message: string) => {
    toast(message, {
      icon: '⚠️',
      style: {
        background: 'hsl(var(--background))',
        color: 'hsl(var(--foreground))',
        border: '1px solid rgb(234, 179, 8)',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
    });
  };

  const showInfo = (message: string) => {
    toast(message, {
      icon: 'ℹ️',
      style: {
        background: 'hsl(var(--background))',
        color: 'hsl(var(--foreground))',
        border: '1px solid rgb(59, 130, 246)',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
    });
  };

  const showLoading = (message: string) => {
    return toast.loading(message);
  };

  const dismissLoading = (toastId: string) => {
    toast.dismiss(toastId);
  };

  const confirm = (
    message: string,
    onConfirm: () => void,
    onCancel?: () => void
  ) => {
    toast(
      (t) => (
        <div className="flex flex-col gap-3">
          <p>{message}</p>
          <div className="flex gap-2">
            <button
              className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
              onClick={() => {
                toast.dismiss(t.id);
                onConfirm();
              }}
            >
              Confirmar
            </button>
            <button
              className="px-3 py-1 bg-gray-300 text-gray-800 rounded text-sm hover:bg-gray-400"
              onClick={() => {
                toast.dismiss(t.id);
                onCancel?.();
              }}
            >
              Cancelar
            </button>
          </div>
        </div>
      ),
      {
        duration: Infinity,
        style: {
          background: 'hsl(var(--background))',
          color: 'hsl(var(--foreground))',
          border: '1px solid hsl(var(--border))',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        },
      }
    );
  };

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showLoading,
    dismissLoading,
    confirm,
  };
};