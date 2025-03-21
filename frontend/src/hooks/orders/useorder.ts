import { useQueryOrders } from './useQueryOrders';
import { useMutationOrders } from './useMutationOrders';

export const useOrders = () => {
  const { ordersQuery } = useQueryOrders();
  const { createOrderMutation, isAuthenticated } = useMutationOrders();

  const orders = ordersQuery.data || [];
  const isLoading = ordersQuery.isLoading;

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