import { create } from 'zustand';

interface Toast {
  message: string;
  type: 'success' | 'error' | 'info';
  id: number;
}

interface ToastState {
  toasts: Toast[];
  addToast: (message: string, type: 'success' | 'error' | 'info') => void;
  removeToast: (id: number) => void;
}

const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  addToast: (message, type) =>
    set((state) => {
      const id = Date.now();
      return { toasts: [...state.toasts, { message, type, id }] };
    }),
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    })),
}));

export const useToast = () => {
  const { toasts, addToast, removeToast } = useToastStore();

  const toast = (message: string, type: 'success' | 'error' | 'info') => {
    addToast(message, type);
  };

  return { toasts, toast, removeToast };
};
