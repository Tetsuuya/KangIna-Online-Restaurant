import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getCartItems, addToCart, removeFromCart, updateCartItemQuantity } from '../../api/cart/cartApi';
import { toast } from 'sonner';
import { CartState, CartItem } from '../../utils/types';
import { useAuthStore } from '../auth/useauth';

export const useCartStore = (): CartState => {
  const queryClient = useQueryClient();
  const { isAuthenticated, hasCheckedAuth } = useAuthStore();

  // Query for fetching cart items
  const { data: items = [], isLoading: isInitialLoading, error } = useQuery({
    queryKey: ['cart'],
    queryFn: getCartItems,
    staleTime: 1000 * 60 * 5, // Consider data stale after 5 minutes
    enabled: isAuthenticated && hasCheckedAuth, // Only fetch when user is authenticated and auth check is complete
    refetchOnMount: true, // Always refetch when component mounts
    refetchOnWindowFocus: true, // Refetch when window regains focus
  });

  // Add item mutation
  const addItemMutation = useMutation({
    mutationFn: ({ productId, quantity }: { productId: number; quantity: number }) => 
      addToCart(productId, quantity),
    onSuccess: () => {
      // Invalidate and refetch cart data after successful addition
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.success('Item added to cart successfully');
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add item to cart';
      toast.error(errorMessage);
    },
  });

  // Remove item mutation
  const removeItemMutation = useMutation({
    mutationFn: removeFromCart,
    onMutate: async (productId) => {
      await queryClient.cancelQueries({ queryKey: ['cart'] });
      const previousItems = queryClient.getQueryData(['cart']);

      queryClient.setQueryData(['cart'], (old: CartItem[] = []) => 
        old.filter(item => item.product !== productId)
      );

      return { previousItems };
    },
    onSuccess: () => {
      toast.success('Item removed from cart');
    },
    onError: (error, _, context) => {
      const errorMessage = error instanceof Error ? error.message : 'Failed to remove item from cart';
      if (context?.previousItems) {
        queryClient.setQueryData(['cart'], context.previousItems);
      }
      toast.error(errorMessage);
    },
  });

  // Update quantity mutation
  const updateQuantityMutation = useMutation({
    mutationFn: ({ productId, quantity }: { productId: number; quantity: number }) => 
      updateCartItemQuantity(productId, quantity),
    onMutate: async ({ productId, quantity }) => {
      await queryClient.cancelQueries({ queryKey: ['cart'] });
      const previousItems = queryClient.getQueryData(['cart']);

      queryClient.setQueryData(['cart'], (old: CartItem[] = []) => 
        old.map(item => 
          item.product === productId ? { ...item, quantity } : item
        )
      );

      return { previousItems };
    },
    onSuccess: () => {
      toast.success('Cart updated successfully');
    },
    onError: (error, _, context) => {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update item quantity';
      if (context?.previousItems) {
        queryClient.setQueryData(['cart'], context.previousItems);
      }
      toast.error(errorMessage);
    },
  });

  // Fetch cart function
  const fetchCart = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to view your cart');
      return;
    }
    await queryClient.invalidateQueries({ queryKey: ['cart'] });
  };

  // Add item function
  const addItem = async (productId: number, quantity = 1) => {
    if (!isAuthenticated) {
      toast.error('Please log in to add items to cart');
      return;
    }
    await addItemMutation.mutateAsync({ productId, quantity });
  };

  // Remove item function
  const removeItem = async (productId: number) => {
    if (!isAuthenticated) {
      toast.error('Please log in to remove items from cart');
      return;
    }
    await removeItemMutation.mutateAsync(productId);
  };

  // Update quantity function
  const updateQuantity = async (productId: number, quantity: number) => {
    if (!isAuthenticated) {
      toast.error('Please log in to update cart items');
      return;
    }
    if (quantity <= 0) {
      await removeItem(productId);
    } else {
      await updateQuantityMutation.mutateAsync({ productId, quantity });
    }
  };

  // Computed functions
  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return items.reduce((total, item) => total + (item.product_price * item.quantity), 0);
  };

  return {
    items,
    isLoading: isInitialLoading,
    loadingProductIds: [],
    error: error as string | null,

    // Actions
    fetchCart,
    addItem,
    removeItem,
    updateQuantity,

    // Computed
    getTotalItems,
    getTotalPrice,
  };
};