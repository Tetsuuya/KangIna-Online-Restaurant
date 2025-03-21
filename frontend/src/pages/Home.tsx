// src/pages/Home.tsx
import React from 'react';
import LeftSidebar from '../components/Sidebar/LeftSidebar';
import RightSidebar from '../components/Sidebar/RightSidebar';
import useAppStore from '../store/HomeUserStore';
import { useProducts } from '../hooks/products/useProducts';
import { CategorySelector } from '../components/products/CatergorySelector';
import { ProductGrid } from '../components/products/ProductGrid';
import SearchBar from '../components/Searchbar';
import UserProfile from '../components/userprofile/UserProfile';

const Home: React.FC = () => {
    const { activeSection } = useAppStore();
   
    const {
        categories,
        products,
        selectedCategory,
        handleCategorySelect,
        handleSearch,
        searchQuery,
        isLoading: productsLoading,
        isError: productsError,
        error: productsErrorDetails
    } = useProducts();

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
                                isLoading={productsLoading}
                                isError={productsError}
                            />
                            <div className="border-b-1 border-gray-400 my-6 w-[92%] mx-auto"></div>
                           
                            {searchQuery.trim() !== '' && (
                                <div className="mb-4 text-lg">
                                    Search results for: <span className="font-semibold">{searchQuery}</span>
                                    {products.length === 0 && !productsLoading && (
                                        <span className="ml-2 text-gray-500">
                                            (No results found)
                                        </span>
                                    )}
                                </div>
                            )}
                           
                            <ProductGrid
                                products={products}
                                isLoading={productsLoading}
                                isError={productsError}
                                error={productsErrorDetails}
                            />
                        </>
                    ) : activeSection === 'profile' ? (
                        <UserProfile />
                    ) : (
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
