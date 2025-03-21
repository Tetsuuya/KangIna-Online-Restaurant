// Base types
export interface BaseEntity {
    id: number;
    created_at?: string;
}

// User related types
export interface AuthUser extends BaseEntity {
    username: string;
    email: string;
    full_name?: string;
    phone_number?: string;
    profile_picture?: string;
    date_joined?: string;
    dietary_preferences?: DietaryPreferences;
}

export interface RegisterData {
    username: string;
    email: string;
    password: string;
    full_name: string;
}

export interface DietaryPreferences {
    is_vegetarian: boolean;
    is_vegan: boolean;
    is_pescatarian: boolean;
    is_flexitarian: boolean;
    is_paleo: boolean;
    is_ketogenic: boolean;
    is_halal: boolean;
    is_kosher: boolean;
    is_fruitarian: boolean;
    is_gluten_free: boolean;
    is_dairy_free: boolean;
    is_organic: boolean;
}

// API related types
export interface ApiResponse<T> {
    data: T;
    status: number;
}

// Product related types
export interface Product extends BaseEntity {
    name: string;
    description: string | null;
    price: number;
    image_url: string | null;
    available: boolean;
    category: string;
    ingredients: string | null;
    serving_size: string | null;
    dietary_info: string | null;
}

export interface CategoryOption {
    value: string;
    label: string;
}

// Cart related types
export interface CartItem extends BaseEntity {
    product: number;
    product_name: string;
    product_price: number;
    product_image?: string;
    quantity: number;
}

export interface CartState {
    items: CartItem[];
    isLoading: boolean;
    loadingProductIds: number[];
    error: string | null;

    // Actions
    fetchCart: () => Promise<void>;
    addItem: (productId: number, quantity?: number, product?: Product) => Promise<void>;
    removeItem: (productId: number) => Promise<void>;
    updateQuantity: (productId: number, quantity: number) => Promise<void>;

    // Computed
    getTotalItems: () => number;
    getTotalPrice: () => number;
}

// Order related types
export interface OrderItem {
    id?: number;
    product: number;
    product_name: string;
    quantity: number;
    price: number;
}

export interface Order extends BaseEntity {
    status: string;
    total_amount: number;
    items: OrderItem[];
}

export interface OrderState {
    orders: Order[];
    isLoading: boolean;
    error: string | null;
    
    createOrder: () => Promise<void>;
    fetchOrders: () => Promise<void>;
    clearError: () => void;
}

// Favorites related types
export interface FavoriteToggleResponse {
    status: string;
}

export interface FavoriteState {
    favorites: Product[];
    isLoading: boolean;
    error: string | null;
    userId: number | null;
    
    fetchFavorites: () => Promise<void>;
    toggleFavorite: (productId: number) => Promise<void>;
    isFavorite: (productId: number) => boolean;
    removeFavorite: (productId: number) => Promise<void>;
    clearFavorites: () => void;
    setUserId: (userId: number | null) => void;
}

// Component Props types
export interface ProductCardProps {
    product: Product;
}

export interface ProductDetailModalProps {
    product: Product;
    onClose: () => void;
    onToggleFavorite: () => void;
}

export interface ProfileEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialData: {
        full_name: string;
        email: string;
        phone_number: string;
        profile_picture?: string;
        dietaryPreferences: DietaryPreferences;
    };
}

export interface SearchBarProps {
    className?: string;
    onSearch?: (query: string) => void;
    initialValue?: string;
}

export interface CategorySelectorProps {
    categories: CategoryOption[];
    selectedCategory: string;
    onCategorySelect: (category: string) => void;
    isLoading: boolean;
    isError: boolean;
}

export interface ProductGridProps {
    products: Product[];
    isLoading: boolean;
    isError: boolean;
    error?: Error | null;
}