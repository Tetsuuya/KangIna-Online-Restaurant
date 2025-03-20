import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { orderApi } from '../../api/orders/orders';
import { toast } from 'sonner';
import { OrderState, Order } from '../../utils/types';

export const useOrderStore = (): OrderState => {
  const queryClient = useQueryClient();

  // Query for fetching orders
  const { data: orders = [], isLoading, error } = useQuery({
    queryKey: ['orders'],
    queryFn: orderApi.getRecentOrders,
    staleTime: 1000 * 60 * 5, // Consider data stale after 5 minutes
  });

  // Create order mutation
  const createOrderMutation = useMutation({
    mutationFn: orderApi.createOrder,
    onSuccess: (newOrder) => {
      // Update the orders list with the new order
      queryClient.setQueryData(['orders'], (old: Order[] = []) => [newOrder, ...old]);
      toast.success('Order created successfully');
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create order';
      toast.error(errorMessage);
    },
  });

  // Fetch orders function
  const fetchOrders = async () => {
    await queryClient.invalidateQueries({ queryKey: ['orders'] });
  };

  // Create order function
  const createOrder = async () => {
    await createOrderMutation.mutateAsync();
  };

  return {
    orders,
    isLoading,
    error: error as string | null,
    
    // Actions
    createOrder,
    fetchOrders,
    clearError: () => {}, // No-op since errors are handled by mutations
  };
};