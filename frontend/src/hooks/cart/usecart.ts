import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getCartItems, addToCart, removeFromCart, updateCartItemQuantity } from '../../api/cart/cartApi';
import { toast } from 'sonner';
import { useAuthStore } from '../auth/useauth';
import { CartItem, Product } from '../../utils/types';
import { useProducts } from '../products/useProducts';
import { useMemo } from 'react';

interface CartContext {
  previousCart: CartItem[] | undefined;
}

export const useCart = () => {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuthStore();
  const { products } = useProducts();

  // Optimize query with better caching and stale time
  const { data: items = [], isLoading } = useQuery<CartItem[]>({
    queryKey: ['cart'],
    queryFn: async () => {
      const data = await getCartItems();
      return data;
    },
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
    refetchOnWindowFocus: false, // Prevent refetch on window focus
  });

  // Memoize products map to prevent unnecessary recalculations
  const productsMap = useMemo(() => {
    return products.reduce((acc, product) => {
      acc[product.id] = product;
      return acc;
    }, {} as Record<number, Product>);
  }, [products]);

  // Memoize total calculations
  const { totalItems, totalPrice } = useMemo(() => {
    const itemsTotal = items.reduce((total: number, item: CartItem) => total + item.quantity, 0);
    const priceTotal = items.reduce((total: number, item: CartItem) => total + (item.product_price * item.quantity), 0);
    return { totalItems: itemsTotal, totalPrice: priceTotal };
  }, [items]);

  // Optimize mutations with optimistic updates
  const addItemMutation = useMutation<CartItem, Error, { productId: number; quantity: number }, CartContext>({
    mutationFn: ({ productId, quantity }) => addToCart(productId, quantity),
    onMutate: async ({ productId, quantity }) => {
      await queryClient.cancelQueries({ queryKey: ['cart'] });
      const previousCart = queryClient.getQueryData<CartItem[]>(['cart']);
      
      const newItem: CartItem = {
        id: Date.now(), // Temporary ID
        product: productId,
        quantity,
        product_price: productsMap[productId]?.price || 0,
        product_name: productsMap[productId]?.name || '',
      };

      queryClient.setQueryData<CartItem[]>(['cart'], old => {
        if (!old) return [newItem];
        const existingItem = old.find(item => item.product === productId);
        if (existingItem) {
          return old.map(item =>
            item.product === productId
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        }
        return [...old, newItem];
      });

      return { previousCart };
    },
    onError: (err, _newTodo, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(['cart'], context.previousCart);
      }
      toast.error(err.message || 'Failed to add item to cart');
    },
    onSuccess: () => {
      toast.success('Item added to cart');
    },
  });

  const removeItemMutation = useMutation<void, Error, number, CartContext>({
    mutationFn: removeFromCart,
    onMutate: async (productId) => {
      await queryClient.cancelQueries({ queryKey: ['cart'] });
      const previousCart = queryClient.getQueryData<CartItem[]>(['cart']);
      queryClient.setQueryData<CartItem[]>(['cart'], old => 
        old?.filter(item => item.product !== productId) || []
      );
      return { previousCart };
    },
    onError: (err, _productId, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(['cart'], context.previousCart);
      }
      toast.error(err.message || 'Failed to remove item');
    },
    onSuccess: () => {
      toast.success('Item removed from cart');
    },
  });

  const updateQuantityMutation = useMutation<CartItem, Error, { productId: number; quantity: number }>({
    mutationFn: ({ productId, quantity }) => updateCartItemQuantity(productId, quantity),
    onSuccess: () => {
      // Refetch cart data to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to update cart');
    }
  });

  const addItem = async (productId: number, quantity = 1) => {
    if (!isAuthenticated) {
      toast.error('Please log in to add items to cart');
      return;
    }
    try {
      await addItemMutation.mutateAsync({ productId, quantity });
    } catch (error) {
      // Error is handled by mutation
    }
  };

  const removeItem = async (productId: number) => {
    if (!isAuthenticated) {
      toast.error('Please log in to remove items');
      return;
    }
    try {
      await removeItemMutation.mutateAsync(productId);
    } catch (error) {
      // Error is handled by mutation
    }
  };

  const updateQuantity = async (productId: number, quantity: number) => {
    if (!isAuthenticated) {
      toast.error('Please log in to update cart');
      return;
    }
    try {
      if (quantity <= 0) {
        await removeItem(productId);
      } else {
        await updateQuantityMutation.mutateAsync({ productId, quantity });
      }
    } catch (error) {
      // Error is handled by mutation
    }
  };

  return {
    items,
    products: productsMap,
    isLoading,
    addItem,
    removeItem,
    updateQuantity,
    getTotalItems: () => totalItems,
    getTotalPrice: () => totalPrice,
  };
};