import { useQuery } from '@tanstack/react-query';
import { getCartItems } from '../../api/cart/cartApi';
import { CartItem } from '../../utils/types';

export const useQueryCart = () => {
  const cartQuery = useQuery<CartItem[]>({
    queryKey: ['cart'],
    queryFn: getCartItems,
    staleTime: 1000 * 60, // Cache for 1 minute
  });

  return {
    cartQuery
  };
};
