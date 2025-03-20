import { useEffect, useState } from 'react';
import { useCartStore } from '../../hooks/cart/usecart';
import { useAuthStore } from '../../hooks/auth/useauth';
import { useOrderStore } from '../../hooks/orders/useorder';
import { CartItem } from '../../utils/types';


const RightSidebar = () => {
    // State to manage sidebar visibility on mobile
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
   
    // State to manage selected payment method
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);


    // Get the user from authStore
    const { user } = useAuthStore();
   
    // Using TanStack Query hooks
    const { items, isLoading, error, fetchCart, removeItem, updateQuantity, getTotalPrice } = useCartStore();
    const { createOrder, isLoading: isOrderLoading } = useOrderStore();
   
    useEffect(() => {
        fetchCart();  
    }, [fetchCart]);


    const handleQuantityChange = (productId: number, newQuantity: number): void => {
        if (newQuantity > 0) {
            updateQuantity(productId, newQuantity);
        }
    };


    const taxRate = 0.05; // 5% tax
    const taxAmount = getTotalPrice() * taxRate;
    const totalAmount = getTotalPrice() + taxAmount;


    // Toggle sidebar for mobile
    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };


    // Handle order placement
    const handlePlaceOrder = async () => {
      try {
          // Create order
          await createOrder();
         
          // Refresh the cart after placing the order
          await fetchCart();
 
          // Optional: Show success message or redirect
          alert('Order placed successfully!');
      } catch (error) {
          console.error('Failed to place order', error);
          alert('Failed to place order. Please try again.');
      }
    };


    // Cart item card component
    const CartItemCard = ({ item }: { item: CartItem }) => {
        if (!item) return null;
        
        return (
            <div className="bg-white rounded-lg mb-2 shadow-lg overflow-hidden flex border border-gray-100">
                {/* Product image on the left side with fixed dimensions */}
                <div className="w-14 h-14 bg-gray-50 flex-shrink-0">
                    {item.product_image ? (
                        <img
                            src={item.product_image}
                            alt={item.product_name}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full bg-gray-50 flex items-center justify-center">
                            <span className="text-xs text-gray-400">No img</span>
                        </div>
                    )}
                </div>
               
                {/* Product details in the middle with text ellipsis */}
                <div className="flex-grow p-2 min-w-0">
                    <h4 className="font-medium text-sm text-gray-800 truncate" title={item.product_name}>
                        {item.product_name}
                    </h4>
                    <div className="mt-0.5">
                        <span className="text-xs text-gray-500">Php {Number(item.product_price || 0).toFixed(2)}</span>
                    </div>
                </div>
               
                {/* Quantity controls and delete button on the right */}
                <div className="flex items-center p-1.5 flex-shrink-0">
                    <div className="flex items-center border border-gray-200 rounded-md overflow-hidden mr-1.5">
                        <button
                            className="bg-gray-50 hover:bg-gray-100 text-gray-600 w-5 h-5 flex items-center justify-center text-sm"
                            onClick={() => handleQuantityChange(item.product, item.quantity - 1)}
                        >
                            -
                        </button>
                        <span className="px-1.5 text-xs font-medium text-gray-700">{item.quantity}</span>
                        <button
                            className="bg-gray-50 hover:bg-gray-100 text-gray-600 w-5 h-5 flex items-center justify-center text-sm"
                            onClick={() => handleQuantityChange(item.product, item.quantity + 1)}
                        >
                            +
                        </button>
                    </div>
                   
                    <button
                        className="text-gray-400 hover:text-red-500"
                        onClick={() => removeItem(item.product)}
                        aria-label="Remove item"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>
            </div>
        );
    };


    return (
        <>
            {/* Mobile Cart Toggle Button */}
            <button
                onClick={toggleSidebar}
                className="fixed bottom-4 right-4 z-50 bg-indigo-800 text-white p-3 rounded-full shadow-lg block md:hidden"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {items.length}
                </span>
            </button>


            {/* Sidebar - Desktop and Mobile */}
            <div className={`
                fixed inset-y-0 right-0 w-full md:w-[320px] bg-white h-full overflow-hidden p-4 md:p-6 flex flex-col shadow-lg
                transform transition-transform duration-300 ease-in-out
                ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}
                md:translate-x-0 md:relative
                z-50
            `}>
                {/* Close button for mobile */}
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
               
                {/* Cart items section */}
                <div className="flex-grow flex flex-col min-h-0">
                    <h3 className="text-[#F58E26] mb-4 font-bold text-sm">Here's what's on your cart:</h3>
                    {/* Scrollable cart container */}
                    <div className="overflow-y-auto flex-grow pr-1 -mr-1">
                        {isLoading && items.length === 0 ? (
                            <div className="flex items-center justify-center h-32">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F58E26]"></div>
                            </div>
                        ) : error ? (
                            <div className="flex items-center justify-center h-32">
                                <p className="text-red-500 text-sm">Error loading cart: {error}</p>
                            </div>
                        ) : items.length === 0 ? (
                            <div className="flex items-center justify-center h-32">
                                <p className="text-gray-500 text-sm">Your cart is empty</p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-1.5">
                                {items.map((item: CartItem) => (
                                    <CartItemCard key={item.product} item={item} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
               
                {/* Order summary and payment */}
                <div className="mt-auto flex-shrink-0">
                    <div className="bg-gray-100 rounded-lg p-4 mb-4">
                        <div className="flex justify-between mb-2">
                            <span className="text-gray-600">Sub Total</span>
                            <span className="font-medium">Php {getTotalPrice().toFixed(2)}</span>
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


                    {/* Payment Options */}
                    <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="flex flex-col items-center">
                            <button
                                className={`flex items-center justify-center p-4 rounded w-16 h-16 ${
                                    selectedPaymentMethod === 'cash'
                                    ? 'bg-indigo-200 border-2 border-indigo-700'
                                    : 'bg-white border border-gray-300'
                                }`}
                                onClick={() => setSelectedPaymentMethod('cash')}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </button>
                            <span className="text-sm mt-2 font-medium">Cash</span>
                        </div>
                       
                        <div className="flex flex-col items-center">
                            <button
                                className={`flex items-center justify-center p-4 rounded w-16 h-16 ${
                                    selectedPaymentMethod === 'card'
                                    ? 'bg-indigo-200 border-2 border-indigo-700'
                                    : 'bg-white border border-gray-300'
                                }`}
                                onClick={() => setSelectedPaymentMethod('card')}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                </svg>
                            </button>
                            <span className="text-sm mt-2 font-medium">Credit/Debit</span>
                        </div>
                       
                        <div className="flex flex-col items-center">
                            <button
                                className={`flex items-center justify-center p-4 rounded w-16 h-16 ${
                                    selectedPaymentMethod === 'qr'
                                    ? 'bg-indigo-200 border-2 border-indigo-700'
                                    : 'bg-white border border-gray-300'
                                }`}
                                onClick={() => setSelectedPaymentMethod('qr')}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                                </svg>
                            </button>
                            <span className="text-sm mt-2 font-medium">QR Code</span>
                        </div>
                    </div>
                   
                    <button
                        className="w-full bg-[#ED3F25] text-white py-3 rounded-full font-semibold hover:bg-[#c41f06] transition"
                        onClick={handlePlaceOrder}
                        disabled={items.length === 0 || isOrderLoading}
                    >
                        {isOrderLoading ? 'Processing...' : 'Place Order'}
                    </button>
                </div>
            </div>


            {/* Overlay for mobile to close sidebar when open */}
            {isSidebarOpen && (
                <div
                    onClick={toggleSidebar}
                    className="fixed inset-0 bg-black opacity-50 z-40 block md:hidden"
                ></div>
            )}
        </>
    );
};


export default RightSidebar;

