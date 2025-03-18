// src/pages/Home.tsx
import React, { useEffect, useState } from 'react';
import LeftSidebar from '../components/Sidebar/LeftSidebar';
import RightSidebar from '../components/Sidebar/RightSidebar';
import useAppStore from '../store/HomeUserStore';
import useAuthStore from '../store/AuthStore';
import { useProducts } from '../hooks/useProducts';
import { CategorySelector } from '../components/products';
import { ProductGrid } from '../components/products/ProductGrid';
import SearchBar from '../components/Searchbar';
import UserProfile from '../components/userprofile/UserProfile';
import { Product } from '../api/productApi';


const Home: React.FC = () => {
    const { activeSection } = useAppStore();
    const { user, checkAuthStatus } = useAuthStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
   
    useEffect(() => {
        // Ensure user data is loaded
        if (!user) {
            checkAuthStatus();
        }
    }, [user, checkAuthStatus]);


    const {
        categoriesQuery,
        productsQuery,
        selectedCategory,
        handleCategorySelect
    } = useProducts();
   
    const {
        data: categories = [],
        isLoading: categoriesLoading,
        isError: categoriesError
    } = categoriesQuery;
   
    const {
        data: products = [],
        isLoading: productsLoading,
        isError: productsError,
        error: productsErrorDetails
    } = productsQuery;


    // Handle search functionality locally
    useEffect(() => {
        if (searchQuery.trim() === '') {
            // If search is empty, show all products from current category
            setFilteredProducts(products);
        } else {
            // Filter products based on search query
            const filtered = products.filter(product =>
                product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (product.description &&
                 product.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (product.category &&
                 product.category.toLowerCase().includes(searchQuery.toLowerCase()))
            );
            setFilteredProducts(filtered);
        }
    }, [searchQuery, products]);


    const handleSearch = (query: string) => {
        setSearchQuery(query);
    };


    return (
        <div className="flex h-screen overflow-hidden">
            {/* Left Sidebar (responsive) */}
            <LeftSidebar />


            {/* Main Content Area (scrollable) */}
            <div className="flex-1 overflow-y-auto relative">
                <div className="bg-gray-200 p-4 sm:p-6 min-h-full">
                    {activeSection === 'home' ? (
                        <>
                            <SearchBar
                                className="mb-4 sm:mb-6"
                                onSearch={handleSearch}
                                initialValue={searchQuery}
                            />
                            <CategorySelector
                                categories={categories}
                                selectedCategory={selectedCategory}
                                onCategorySelect={handleCategorySelect}
                                isLoading={categoriesLoading}
                                isError={categoriesError}
                            />
                            <div className="border-b-1 border-gray-400 my-6 w-[92%] mx-auto"></div>
                           
                            {searchQuery.trim() !== '' && (
                                <div className="mb-4 text-lg">
                                    Search results for: <span className="font-semibold">{searchQuery}</span>
                                    {filteredProducts.length === 0 && !productsLoading && (
                                        <span className="ml-2 text-gray-500">
                                            (No results found)
                                        </span>
                                    )}
                                </div>
                            )}
                           
                            <ProductGrid
                                products={filteredProducts}
                                isLoading={productsLoading}
                                isError={productsError}
                                error={productsErrorDetails}
                            />
                        </>
                    ) : activeSection === 'profile' ? (
                        <UserProfile />
                    ) : (
                        // Default fallback, should not happen with current store
                        <div className="p-4">Content not available</div>
                    )}
                </div>
            </div>


            {/* Right Sidebar (responsive) */}
            <RightSidebar />
        </div>
    );
};


export default Home;

