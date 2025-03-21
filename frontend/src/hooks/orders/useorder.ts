import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createOrder, getOrders } from '../../api/orders/orders';
import { useAuthStore } from '../auth/useauth';

export const useOrders = () => {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuthStore();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: getOrders,
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

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

  const handleCreateOrder = async () => {
    if (!isAuthenticated) {
      window.alert('Please log in to place an order');
      return;
    }
    await createOrderMutation.mutateAsync();
  };

  return {
    orders,
    isLoading,
    createOrder: handleCreateOrder,
  };
};