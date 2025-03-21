import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createOrder } from '../../api/orders/orders';
import { useAuthStore } from '../auth/useauth';

export const useMutationOrders = () => {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuthStore();

  const createOrderMutation = useMutation({
    mutationFn: createOrder,
    onSuccess: () => {
      window.alert('Order successful');
      // Force refetch all necessary queries to ensure everything updates
      queryClient.refetchQueries({ queryKey: ['cart'] });
      queryClient.refetchQueries({ queryKey: ['products'] });
      queryClient.refetchQueries({ queryKey: ['orders'] });
    },
    onError: () => {
      window.alert('Failed to place order');
    },
  });

  return {
    createOrderMutation,
    isAuthenticated
  };
};
