import { useQueryCart } from './useQueryCart';
import { useMutationCart } from './useMutationCart';

export const useCart = () => {
  const { cartQuery } = useQueryCart();
  const { 
    addItemMutation, 
    removeItemMutation, 
    updateQuantityMutation 
  } = useMutationCart();

  const items = cartQuery.data || [];
  const isLoading = cartQuery.isLoading;

  const totalItems = items.reduce((total, item) => total + item.quantity, 0);
  const totalPrice = items.reduce((total, item) => total + (item.product_price * item.quantity), 0);

  return {
    items,
    isLoading,
    totalItems,
    totalPrice,
    addItem: (productId: number, quantity: number) => addItemMutation.mutate({ productId, quantity }),
    removeItem: (productId: number) => removeItemMutation.mutate(productId),
    updateQuantity: (productId: number, quantity: number) => updateQuantityMutation.mutate({ productId, quantity })
  };
};
