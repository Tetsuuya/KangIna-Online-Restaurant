import React from 'react';
import { CategoryOption } from '../../api/productApi';
import image1 from '../../assets/categories/category1.png';
import image2 from '../../assets/categories/category2.png';
import image3 from '../../assets/categories/category3.png';     
import image4 from '../../assets/categories/category4.png';
import image5 from '../../assets/categories/category5.png';

interface CategorySelectorProps {
  categories: CategoryOption[];
  selectedCategory: string;
  onCategorySelect: (category: string) => void;
  isLoading: boolean;
  isError: boolean;
}

const categoryStyles: Record<string, { image: string; bgColor: string; textColor: string; borderColor: string }> = {
  ALL: { image: image1, bgColor: 'bg-white', textColor: 'text-black', borderColor: 'border-indigo-700' },
  AGAHAN: { image: image2, bgColor: 'bg-white', textColor: 'text-black', borderColor: 'border-red-500' },
  TANGHALIAN: { image: image3, bgColor: 'bg-white', textColor: 'text-black', borderColor: 'border-yellow-500' },
  HAPUNAN: { image: image4, bgColor: 'bg-white', textColor: 'text-black', borderColor: 'border-indigo-700' },
  MERIENDA: { image: image5, bgColor: 'bg-white', textColor: 'text-black', borderColor: 'border-red-500' }
};

// Define the custom order for categories
const categoryOrder = ['ALL', 'AGAHAN', 'TANGHALIAN', 'HAPUNAN', 'MERIENDA'];

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  categories,
  selectedCategory,
  onCategorySelect,
  isLoading,
  isError
}) => {
  if (isLoading) {
    return (
      <div className="mb-6 flex justify-center gap-2">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-40 w-40 rounded-lg bg-gray-200 animate-pulse"></div>
        ))}
      </div>
    );
  }

  if (isError) {
    return <div className="mb-6 text-red-500">Failed to load categories</div>;
  }

  // Sort categories based on the custom order
  const sortedCategories = [...categories].sort((a, b) => {
    const aIndex = categoryOrder.indexOf(a.value.toUpperCase());
    const bIndex = categoryOrder.indexOf(b.value.toUpperCase());
    
    // Handle any categories not in the order array
    if (aIndex === -1 && bIndex === -1) return 0;
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    
    return aIndex - bIndex;
  });

  return (
    <div className="mb-6">
      <div className="flex justify-center gap-3 overflow-x-auto py-2">
        {sortedCategories.map((category) => {
          const style = categoryStyles[category.value.toUpperCase()] || {
            image: '/images/default.jpg',
            bgColor: 'bg-white',
            textColor: 'text-black',
            borderColor: 'border-gray-200'
          };

          const subtitle = 
            category.value.toLowerCase() === 'all' ? '18 items' : 
            category.value.toLowerCase() === 'agahan' ? '5 items' :
            category.value.toLowerCase() === 'tanghalian' ? '4 items' :
            category.value.toLowerCase() === 'hapunan' ? '4 items' :
            category.value.toLowerCase() === 'merienda' ? '5 items' : '';

          return (
            <button
              key={category.value}
              onClick={() => onCategorySelect(category.value)}
              className={`flex flex-col items-start p-4 w-32 h-32 rounded-lg shadow-lg transition-all 
                ${style.bgColor} ${style.textColor}
                ${selectedCategory === category.value 
                  ? `border ${style.borderColor}` 
                  : 'border border-gray-200'}`}
            >
              <img
                src={style.image}
                alt={category.label}
                className="w-13 h-13 object-contain mb-2"
              />
              <div className="w-full text-left">
                <div className="text-sm font-medium">{category.label}</div>
                <div className="text-xs text-gray-500">{subtitle}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
