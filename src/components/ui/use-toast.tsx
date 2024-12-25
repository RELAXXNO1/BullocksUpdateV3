import { useToast as useToastContext } from '../../contexts/ToastContext';

export const useToast = () => {
  const { toast } = useToastContext();

  return { toast };
};
