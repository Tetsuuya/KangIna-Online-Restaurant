import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from "../../hooks/auth/useauth";
import { useFavorites } from '../../hooks/favorites/usefavorites';
import { useOrders } from '../../hooks/orders/useorder';
import { ProfileEditModal } from './ProfileEdit';
import { Product, Order } from '../../utils/types';

const UserProfilePage = () => {
  const navigate = useNavigate();
  const {
    user,
    isLoading: profileLoading,
    isAuthenticated,
    hasCheckedAuth,
    refreshUserData
  } = useAuthStore();
 
  const {
    favorites,
    isLoading: favoritesLoading
  } = useFavorites();
 
  const {
    orders,
    isLoading: ordersLoading
  } = useOrders();
 
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [shouldRefreshUser, setShouldRefreshUser] = useState(false);

  useEffect(() => {
    if (shouldRefreshUser && isAuthenticated) {
      const doRefresh = async () => {
        try {
          await refreshUserData();
        } catch (error) {
          setShouldRefreshUser(false);
        }
      };
     
      doRefresh();
    }
  }, [shouldRefreshUser, refreshUserData, isAuthenticated]);

  const handleModalClose = useCallback(() => {
    setIsEditModalOpen(false);
    setShouldRefreshUser(true);
  }, []);

  const getActiveDietaryPreferences = () => {
    if (!user) return [];

    const dietaryMap = {
      is_vegetarian: 'Vegetarian',
      is_vegan: 'Vegan',
      is_pescatarian: 'Pescatarian',
      is_flexitarian: 'Flexitarian',
      is_paleo: 'Paleolithic',
      is_ketogenic: 'Ketogenic',
      is_halal: 'Halal',
      is_kosher: 'Kosher',
      is_fruitarian: 'Fruitarian',
      is_gluten_free: 'Gluten-Free',
      is_dairy_free: 'Dairy-free',
      is_organic: 'Organic'
    };

    return Object.entries(dietaryMap)
      .filter(([key]) => {
        const value = user[key as keyof typeof user];
        return typeof value === 'boolean' && value === true;
      })
      .map(([_, label]) => label);
  };

  const activeDietary = getActiveDietaryPreferences();

  // Show loading state while checking authentication
  if (!hasCheckedAuth || profileLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-2rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ed3f25]"></div>
        <p className="mt-4 text-gray-600">Loading profile...</p>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-2rem)]">
        <h1 className="text-2xl font-bold mb-4">Please log in to view your profile</h1>
        <button 
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={() => navigate('/login')}
        >
          Go to Login
        </button>
      </div>
    );
  }

  // If we have a user, show the profile
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-2rem)]">
        <h1 className="text-2xl font-bold mb-4">Error loading profile</h1>
        <button 
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={() => refreshUserData()}
        >
          Retry
        </button>
      </div>
    );
  }

  // Get the profile picture URL
  const getProfilePicture = () => {
    if (!user?.profile_picture) return null;
    return user.profile_picture.startsWith('http') 
      ? user.profile_picture 
      : `http://res.cloudinary.com/dlp4jsibt/${user.profile_picture}`;
  };

  const profilePictureUrl = getProfilePicture();

  return (
    <>
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        {/* Profile Card */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-4 sm:mb-6 relative">
          <button onClick={() => setIsEditModalOpen(true)} className="absolute top-3 right-3 sm:top-4 sm:right-4 text-gray-600 hover:text-blue-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
          </button>
          <div className="p-4 sm:p-6 flex flex-col md:flex-row items-center md:items-start gap-4 sm:gap-6">
            <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-gray-200 flex items-center justify-center text-2xl sm:text-3xl text-gray-500 overflow-hidden">
            {profilePictureUrl ? (
              <img
                src={profilePictureUrl}
                alt={user?.username?.charAt(0).toUpperCase() || ''}
                className="h-full w-full object-cover rounded-full"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              user?.full_name ?
                user.full_name.charAt(0).toUpperCase() :
                (user?.username?.charAt(0).toUpperCase() || '?')
            )}
            </div>
            <div className="text-center md:text-left w-full">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#32347C]">{user?.full_name || user?.username || 'No name set'}</h2>
              <div className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600">
                <p>Email address: {user?.email || 'No email set'}</p>
                <p>Phone number: {user?.phone_number || 'No phone number set'}</p>
              </div>
              <div className="mt-3 sm:mt-4">
                <h3 className="font-semibold mb-1 sm:mb-2 text-sm sm:text-base">Dietary Preferences:</h3>
                <div className="flex flex-wrap gap-1 sm:gap-2">
                  {activeDietary.length > 0 ? (
                    activeDietary.map((preference, index) => (
                      <span key={index} className="px-2 py-0.5 sm:px-3 sm:py-1 bg-blue-100 text-blue-800 rounded-full text-xs sm:text-sm">
                        {preference}
                      </span>
                    ))
                  ) : (
                    <p className="text-xs sm:text-sm text-gray-500">No dietary preferences set</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="border-b border-gray-300 sm:border-b-2 sm:border-gray-400 my-6 sm:my-10"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div>
            {/* Favorites */}
            <h2 className="text-lg sm:text-xl font-bold mb-2 sm:mb-4 text-[#ED3F25]">Your favorite meals:</h2>
            {favoritesLoading ? (
              <div className="text-center text-gray-500 text-sm sm:text-base">Loading favorites...</div>
            ) : favorites.length === 0 ? (
              <div className="text-center text-gray-500 text-sm sm:text-base py-2 sm:py-3">No favorite meals yet. Start adding your favorites!</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-1 gap-2 sm:gap-3 max-h-60 sm:max-h-72 overflow-y-auto pr-1 sm:pr-2">
                {favorites.map((meal: Product) => (
                  <div
                    key={meal.id}
                    className="bg-white rounded-lg shadow-sm hover:shadow overflow-hidden flex transition"
                  >
                    <div className="w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 overflow-hidden bg-gray-50">
                      {meal.image_url ? (
                        <img src={meal.image_url} alt={meal.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs">No Image</div>
                      )}
                    </div>
                    <div className="flex-1 p-2 sm:p-3">
                      <h3 className="font-medium text-xs sm:text-sm line-clamp-1">{meal.name}</h3>
                      <p className="text-xs text-gray-500 mt-0.5 sm:mt-1 line-clamp-1">{meal.description}</p>
                      <p className="text-xs sm:text-sm font-semibold text-black mt-0.5 sm:mt-1">₱{Number(meal.price || 0).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* Recent Purchase */}
          <div>
            <h2 className="text-lg sm:text-xl font-bold mb-2 sm:mb-4 text-[#ED3F25]">Recently purchased:</h2>
            {ordersLoading ? (
              <div className="text-center text-gray-500 text-sm sm:text-base">Loading orders...</div>
            ) : orders.length === 0 ? (
              <div className="text-center text-gray-500 text-sm sm:text-base py-2 sm:py-3">No recent orders yet. Palit na bai!</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-1 gap-2 sm:gap-3 max-h-60 sm:max-h-72 overflow-y-auto pr-1 sm:pr-2">
                {orders.map((order: Order) => (
                  <div key={order.id} className="bg-white rounded-lg shadow-sm hover:shadow overflow-hidden p-3">
                    <div>
                      <p className="text-xs sm:text-sm text-gray-500">Ordered on {order.created_at ? new Date(order.created_at).toLocaleDateString() : 'N/A'}</p>
                      <div className="mt-1 sm:mt-2">
                        <p className="text-xs sm:text-sm font-semibold">₱{Number(order.total_amount).toFixed(2)}</p>
                        <p className="text-xs text-gray-600 mt-0.5 sm:mt-1">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</p>
                      </div>
                      {order.items.length > 0 && (  
                        <div className="mt-2 pt-2 border-t border-gray-100">
                          <p className="text-xs sm:text-sm font-medium line-clamp-1">{order.items[0].product_name}</p>
                          {order.items.length > 1 && (
                            <p className="text-xs sm:text-sm font-medium line-clamp-1">{order.items[1].product_name}</p>
                          )}
                          {order.items.length > 2 && (
                            <p className="text-xs text-gray-500 mt-0.5 sm:mt-1">See more</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      {user && (
        <ProfileEditModal
          isOpen={isEditModalOpen}
          onClose={handleModalClose}
          initialData={{
            full_name: user.full_name || '',
            email: user.email || '',
            phone_number: user.phone_number || '',
            profile_picture: user.profile_picture,
            dietaryPreferences: user.dietary_preferences || {
              is_vegetarian: false,
              is_vegan: false,
              is_pescatarian: false,
              is_flexitarian: false,
              is_paleo: false,
              is_ketogenic: false,
              is_halal: false,
              is_kosher: false,
              is_fruitarian: false,
              is_gluten_free: false,
              is_dairy_free: false,
              is_organic: false,
            },
          }}
        />
      )}
    </>
  );
};

export default UserProfilePage;