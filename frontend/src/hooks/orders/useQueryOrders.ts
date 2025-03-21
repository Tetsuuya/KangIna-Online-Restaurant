import { useQuery } from '@tanstack/react-query';
import { getOrders } from '../../api/orders/orders';
import { useAuthStore } from '../auth/useauth';

export const useQueryOrders = () => {
  const { isAuthenticated } = useAuthStore();

  const ordersQuery = useQuery({
    queryKey: ['orders'],
    queryFn: getOrders,
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    ordersQuery
  };
};
