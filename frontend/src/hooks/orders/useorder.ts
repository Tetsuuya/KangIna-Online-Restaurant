import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createOrder, getOrders } from '../../api/orders/orders';
import { toast } from 'sonner';
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
    onSuccess: (newOrder) => {
      queryClient.setQueryData(['orders'], (old: typeof orders = []) => [newOrder, ...old]);
      toast.success('Order created successfully');
    },
    onError: () => toast.error('Failed to create order'),
  });

  const handleCreateOrder = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to create an order');
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