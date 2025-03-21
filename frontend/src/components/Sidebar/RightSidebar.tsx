import { useState, useCallback, memo, useMemo, useRef, useEffect } from 'react';
import { useCart } from '../../hooks/cart/usecart';
import { useAuthStore } from '../../hooks/auth/useauth';
import { useOrders } from '../../hooks/orders/useorder';
import { useProducts } from '../../hooks/products/useProducts';
import { CartItem, Product } from '../../utils/types';

// Memoized Cart Item Card Component
const CartItemCard = memo(({ 
    item, 
    onQuantityChange, 
    onRemove,
    product,
    onLocalQuantityChange 
}: { 
    item: CartItem; 
    onQuantityChange: (id: number, quantity: number) => void;
    onRemove: (id: number) => void;
    product: Product;
    onLocalQuantityChange: (id: number, quantity: number) => void;
}) => {
    const [localQuantity, setLocalQuantity] = useState(item.quantity);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    const lastUpdateRef = useRef<number>(item.quantity);

    const handleQuantityChange = (newQuantity: number) => {
        setLocalQuantity(newQuantity);
        onLocalQuantityChange(item.product, newQuantity);
    };

    // Update server after delay
    useEffect(() => {
        if (localQuantity === lastUpdateRef.current) return;

        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
            lastUpdateRef.current = localQuantity;
            onQuantityChange(item.product, localQuantity);
        }, 1000);

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [localQuantity, item.product, onQuantityChange]);

    // Reset local quantity if server item quantity changes
    useEffect(() => {
        if (item.quantity !== lastUpdateRef.current) {
            setLocalQuantity(item.quantity);
            lastUpdateRef.current = item.quantity;
        }
    }, [item.quantity]);

    if (!item || !product) return null;
    
    return (
        <div className="bg-white rounded-lg mb-2 shadow-lg overflow-hidden flex border border-gray-100" data-product-id={item.product}>
            {/* Product image */}
            <div className="w-14 h-14 bg-gray-50 flex-shrink-0">
                {product.image_url ? (
                    <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        width={56}
                        height={56}
                        decoding="async"
                        onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/placeholder.png';
                            target.onerror = null;
                        }}
                    />
                ) : (
                    <div className="w-full h-full bg-gray-50 flex items-center justify-center">
                        <span className="text-xs text-gray-400">No img</span>
                    </div>
                )}
            </div>
           
            {/* Product details */}
            <div className="flex-grow p-2 min-w-0">
                <h4 className="font-medium text-sm text-gray-800 truncate" title={product.name}>
                    {product.name}
                </h4>
                <div className="mt-0.5">
                    <span className="text-xs text-gray-500">Php {Number(product.price || 0).toFixed(2)}</span>
                </div>
            </div>
           
            {/* Quantity controls */}
            <div className="flex items-center p-1.5 flex-shrink-0">
                <div className="flex items-center border border-gray-200 rounded-md overflow-hidden mr-1.5">
                    <button
                        className="bg-gray-50 hover:bg-gray-100 text-gray-600 w-5 h-5 flex items-center justify-center text-sm disabled:opacity-50"
                        onClick={() => handleQuantityChange(Math.max(1, localQuantity - 1))}
                        disabled={localQuantity <= 1}
                    >
                        -
                    </button>
                    <span className="px-1.5 text-xs font-medium text-gray-700" data-local-quantity>{localQuantity}</span>
                    <button
                        className="bg-gray-50 hover:bg-gray-100 text-gray-600 w-5 h-5 flex items-center justify-center text-sm"
                        onClick={() => handleQuantityChange(localQuantity + 1)}
                    >
                        +
                    </button>
                </div>
               
                <button
                    className="text-gray-400 hover:text-red-500"
                    onClick={() => onRemove(item.product)}
                    aria-label="Remove item"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </button>
            </div>
        </div>
    );
});

CartItemCard.displayName = 'CartItemCard';

const RightSidebar = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('cash');
    const [localQuantities, setLocalQuantities] = useState<Record<number, number>>({});
    const [isProcessing, setIsProcessing] = useState(false);
    const { user, isAuthenticated } = useAuthStore();

    const { items, isLoading, removeItem, updateQuantity } = useCart();
    const { products } = useProducts();
    const { createOrder } = useOrders();

    // Handle local quantity changes
    const handleLocalQuantityChange = useCallback((productId: number, quantity: number) => {
        setLocalQuantities(prev => ({
            ...prev,
            [productId]: quantity
        }));
    }, []);

    // Memoize calculations with local quantities
    const { currentTotal, taxAmount, totalAmount } = useMemo(() => {
        const subtotal = items?.reduce((total, item) => {
            const quantity = localQuantities[item.product] ?? item.quantity;
            return total + (item.product_price * quantity);
        }, 0) || 0;

        const tax = subtotal * 0.05;
        return {
            currentTotal: subtotal,
            taxAmount: tax,
            totalAmount: subtotal + tax
        };
    }, [items, localQuantities]);

    // Handle quantity change
    const handleQuantityChange = useCallback(async (productId: number, newQuantity: number) => {
        try {
            await updateQuantity(productId, newQuantity);
        } catch (error) {
            window.alert('Failed to update quantity');
        }
    }, [updateQuantity]);

    // Handle remove item
    const handleRemoveItem = useCallback(async (productId: number) => {
        try {
            await removeItem(productId);
        } catch (error) {
            window.alert('Failed to remove item');
        }
    }, [removeItem]);

    // Handle place order
    const handlePlaceOrder = useCallback(async () => {
        if (!isAuthenticated) {
            window.alert('Please log in to place an order');
            return;
        }

        if (!items || items.length === 0) {
            window.alert('Your cart is empty');
            return;
        }
        
        try {
            setIsProcessing(true);
            await createOrder(); 
            setIsProcessing(false);
            setIsSidebarOpen(false);
        } catch (error) {
            setIsProcessing(false);
            window.alert('Failed to place order. Please try again.');
        }
    }, [createOrder, items, isAuthenticated]);

    // Memoize cart items rendering
    const cartItems = useMemo(() => (
        <div className="flex flex-col gap-1.5">
            {items?.map((item: CartItem) => {
                const product = products.find(p => p.id === item.product);
                if (!product) return null;
                
                return (
                    <CartItemCard 
                        key={item.product} 
                        item={item}
                        product={product}
                        onQuantityChange={handleQuantityChange}
                        onRemove={handleRemoveItem}
                        onLocalQuantityChange={handleLocalQuantityChange}
                    />
                );
            })}
        </div>
    ), [items, products, handleQuantityChange, handleRemoveItem, handleLocalQuantityChange]);

    const toggleSidebar = useCallback(() => {
        setIsSidebarOpen(prev => !prev);
    }, []);

    return (
        <>
            {/* Mobile Cart Toggle */}
            <button
                onClick={toggleSidebar}
                className="fixed bottom-4 right-4 z-50 bg-indigo-800 text-white p-3 rounded-full shadow-lg block md:hidden"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {items?.length || 0}
                </span>
            </button>

            {/* Sidebar */}
            <div className={`
                fixed inset-y-0 right-0 w-full md:w-[320px] bg-white h-full overflow-hidden p-4 md:p-6 flex flex-col shadow-lg
                transform transition-transform duration-300 ease-in-out
                ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}
                md:translate-x-0 md:relative z-50
            `}>
                {/* Close button */}
                <button
                    onClick={toggleSidebar}
                    className="absolute top-4 left-4 text-gray-600 hover:text-gray-900 block md:hidden"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <h2 className="text-2xl md:text-4xl font-extrabold text-indigo-900 mb-4 mt-10 md:mt-6">
                    Kain na, {user?.username || 'Guest'}!
                </h2>
                <hr className="border-t border-gray-300 my-2" />
               
                {/* Cart items */}
                <div className="flex-grow flex flex-col min-h-0">
                    <h3 className="text-[#F58E26] mb-4 font-bold text-sm">Here's what's on your cart:</h3>
                    <div className="overflow-y-auto flex-grow pr-1 -mr-1">
                        {isLoading && (!items || items.length === 0) ? (
                            <div className="flex items-center justify-center h-32">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F58E26]"></div>
                            </div>
                        ) : !items || items.length === 0 ? (
                            <div className="flex items-center justify-center h-32">
                                <p className="text-gray-500 text-sm">Your cart is empty</p>
                            </div>
                        ) : (
                            cartItems
                        )}
                    </div>
                </div>
               
                {/* Order summary */}
                <div className="mt-auto flex-shrink-0">
                    <div className="bg-gray-100 rounded-lg p-4 mb-4">
                        <div className="flex justify-between mb-2">
                            <span className="text-gray-600">Sub Total</span>
                            <span className="font-medium">Php {currentTotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between mb-2">
                            <span className="text-gray-600">Tax 5%</span>
                            <span className="font-medium">Php {taxAmount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-semibold text-lg border-t border-dashed border-gray-300 pt-2">
                            <span>Total Amount</span>
                            <span>Php {totalAmount.toFixed(2)}</span>
                        </div>
                    </div>

                    {/* Payment Options - Just aesthetic UI with no functionality */}
                    <div className="grid grid-cols-3 gap-4 mb-4">
                        {['cash', 'card', 'qr'].map((method) => (
                            <div key={method} className="flex flex-col items-center">
                                <button
                                    className={`flex items-center justify-center p-4 rounded w-16 h-16 ${
                                        selectedPaymentMethod === method
                                        ? 'bg-indigo-200 border-2 border-indigo-700'
                                        : 'bg-white border border-gray-300'
                                    }`}
                                    onClick={() => setSelectedPaymentMethod(method)}
                                    type="button"
                                >
                                    {method === 'cash' && (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                    )}
                                    {method === 'card' && (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                        </svg>
                                    )}
                                    {method === 'qr' && (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                                        </svg>
                                    )}
                                </button>
                                <span className="text-sm mt-2 font-medium">
                                    {method === 'cash' ? 'Cash' : 
                                     method === 'card' ? 'Credit/Debit' : 'QR Code'}
                                </span>
                            </div>
                        ))}
                    </div>
                   
                    <button
                        className="w-full bg-[#ED3F25] text-white py-3 rounded-full font-semibold hover:bg-[#c41f06] transition disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={handlePlaceOrder}
                        disabled={!isAuthenticated || !items || items.length === 0 || isProcessing}
                        type="button"
                    >
                        {isProcessing ? 'Processing...' : 'Place Order'}
                    </button>
                </div>
            </div>

            {/* Mobile overlay */}
            {isSidebarOpen && (
                <div
                    onClick={toggleSidebar}
                    className="fixed inset-0 bg-black opacity-50 z-40 block md:hidden"
                />
            )}
        </>
    );
};

export default RightSidebar;