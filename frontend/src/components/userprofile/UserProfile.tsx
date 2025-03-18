import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from "../../store/AuthStore";
import { useFavoriteStore } from '../../store/StoreFavorites';
import { useOrderStore } from '../../store/StoreOrders';
import { ProfileEditModal } from './ProfileEdit';


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
    fetchFavorites,
    isLoading: favoritesLoading
  } = useFavoriteStore();
 
  const {
    orders,
    fetchOrders,
    isLoading: ordersLoading
  } = useOrderStore();
 
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [dataFetched, setDataFetched] = useState(false);
 
  // Add state to track if we need to refresh user data (only after edit)
  const [shouldRefreshUser, setShouldRefreshUser] = useState(false);


  // Only fetch favorites and orders once when user is authenticated and auth check is complete
  useEffect(() => {
    // Only proceed if auth has been checked, user is authenticated, and data hasn't been fetched yet
    if (hasCheckedAuth && isAuthenticated && !dataFetched) {
      const loadData = async () => {
        try {
          // Execute these in parallel but handle errors for each individually
          const fetchPromises = [
            fetchFavorites().catch(err => console.error("Error fetching favorites:", err)),
            fetchOrders().catch(err => console.error("Error fetching orders:", err))
          ];
         
          await Promise.all(fetchPromises);
          setDataFetched(true);
        } catch (error) {
          console.error("Error loading profile data:", error);
          setDataFetched(true); // Mark as fetched even on error to prevent infinite retries
        }
      };
     
      loadData();
    }
  }, [hasCheckedAuth, isAuthenticated, dataFetched, fetchFavorites, fetchOrders]);


  // Only refresh user data when modal is closed with shouldRefreshUser flag
  useEffect(() => {
    if (shouldRefreshUser && isAuthenticated) {
      const doRefresh = async () => {
        try {
          await refreshUserData();
        } catch (error) {
          console.error("Error refreshing user data:", error);
        } finally {
          setShouldRefreshUser(false);
        }
      };
     
      doRefresh();
    }
  }, [shouldRefreshUser, refreshUserData, isAuthenticated]);


  // Handler for modal close to set refresh flag
  const handleModalClose = useCallback(() => {
    setIsEditModalOpen(false);
    setShouldRefreshUser(true); // Set flag to refresh instead of calling directly
  }, []);


  const getActiveDietaryPreferences = useCallback(() => {
    if (!user) return [];
    return [
      user.is_vegetarian && 'Vegetarian',
      user.is_vegan && 'Vegan',
      user.is_pescatarian && 'Pescatarian',
      user.is_flexitarian && 'Flexitarian',
      user.is_paleo && 'Paleolithic',
      user.is_ketogenic && 'Ketogenic',
      user.is_halal && 'Halal',
      user.is_kosher && 'Kosher',
      user.is_fruitarian && 'Fruitarian',
      user.is_gluten_free && 'Gluten-Free',
      user.is_dairy_free && 'Dairy-free',
      user.is_organic && 'Organic',
    ].filter(Boolean);
  }, [user]);


  const activeDietary = getActiveDietaryPreferences();


  // Show loading state while checking authentication
  if (!hasCheckedAuth || (profileLoading && !user)) {
    return <div className="flex justify-center items-center h-screen">Loading profile...</div>;
  }


  // Redirect to login if not authenticated
  if (!isAuthenticated || (!user && !profileLoading)) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-2xl font-bold mb-4">Please log in to view your profile</h1>
        <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600" onClick={() => navigate('/login')}>
          Go to Login
        </button>
      </div>
    );
  }


  // Get the profile picture URL with cache-busting only if needed
  const getProfilePicture = () => {
    if (!user?.profile_picture) return null;
   
    // Check if the URL already includes the domain
    if (user.profile_picture.startsWith('http')) {
      return user.profile_picture;
    } else {
      // If it's just a path, add the Cloudinary domain
      return `http://res.cloudinary.com/dlp4jsibt/${user.profile_picture}`;
    }
  };


  const profilePictureUrl = getProfilePicture();


  return (
    <>
      <div className="max-w-4xl mx-auto p-6">
        {/* Profile Card */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6 relative">
          <button onClick={() => setIsEditModalOpen(true)} className="absolute top-4 right-4 text-gray-600 hover:text-blue-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
          </button>
          <div className="p-6 flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center text-3xl text-gray-500 overflow-hidden">
            {profilePictureUrl ? (
              <>
                <img
                  src={profilePictureUrl}
                  alt={user?.username?.charAt(0).toUpperCase() || ''}
                  className="h-full w-full object-cover rounded-full"
                  onLoad={() => console.log('Image loaded successfully:', profilePictureUrl)}
                  onError={(e) => {
                    console.error("Profile image failed to load:", profilePictureUrl);
                    e.currentTarget.style.display = 'none';
                  }}
                />
                {/* Fallback for debugging */}
                <div className="hidden">{profilePictureUrl}</div>
              </>
            ) : (
              user?.full_name ?
                user.full_name.charAt(0).toUpperCase() :
                (user?.username?.charAt(0).toUpperCase() || '?')
            )}
            </div>
            <div className="text-center md:text-left w-full">
              <h2 className="text-4xl font-bold text-[#32347C]">{user?.full_name || user?.username || 'No name set'}</h2>
              <div className="mt-2 text-gray-600">
                <p>Email address: {user?.email || 'No email set'}</p>
                <p>Phone number: {user?.phone_number || 'No phone number set'}</p>
              </div>
              <div className="mt-4">
                <h3 className="font-semibold mb-2">Dietary Preferences:</h3>
                <div className="flex flex-wrap gap-2">
                  {activeDietary.length > 0 ? (
                    activeDietary.map((preference, index) => (
                      <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                        {preference}
                      </span>
                    ))
                  ) : (
                    <p className="text-gray-500">No dietary preferences set</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="border-b-2 border-gray-400 my-10"></div>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            {/* Favorites */}
            <h2 className="text-xl font-bold mb-4 text-[#ED3F25]">Your favorite meals:</h2>
            {favoritesLoading ? (
              <div className="text-center text-gray-500">Loading favorites...</div>
            ) : favorites.length === 0 ? (
              <div className="text-center text-gray-500">No favorite meals yet. Start adding your favorites!</div>
            ) : (
              <div className="grid grid-cols-1 gap-4 max-h-75 overflow-y-auto pr-2">
                {favorites.map((meal) => (
                  <div
                    key={meal.id}
                    className="bg-white rounded-lg shadow overflow-hidden flex cursor-pointer"
                    onClick={() => navigate(`/product/${meal.id}`)}
                  >
                    <div className="w-full h-full md:w-20 md:h-20 flex-shrink-0 rounded-md overflow-hidden bg-gray-50">
                      {meal.image_url ? (
                        <img src={meal.image_url} alt={meal.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full bg-gray-300 flex items-center justify-center text-gray-500">No Image</div>
                      )}
                    </div>
                    <div className="w-2/3 p-3">
                      <h3 className="font-medium text-sm">{meal.name}</h3>
                      <p className="text-xs text-gray-500 mt-1 truncate">{meal.description}</p>
                      <p className="text-sm font-semibold text-black mt-1">₱{Number(meal.price || 0).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* Recent Purchase */}
          <div>
            <h2 className="text-xl font-bold mb-4 text-[#ED3F25]">Recently purchased:</h2>
            {ordersLoading ? (
              <div className="text-center text-gray-500">Loading orders...</div>
            ) : orders.length === 0 ? (
              <div className="text-center text-gray-500">No recent orders yet. Palit na bai!</div>
            ) : (
              <div className="grid grid-cols-1 gap-2 max-h-75 overflow-y-auto pr-2">
                {orders.map((order) => (
                  <div key={order.id} className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="p-1">
                      <div className="mb-2">
                        <p className="text-sm text-gray-500">Ordered on {new Date(order.created_at).toLocaleDateString()}</p>
                        <div className="mt-2">
                          <p className="text-sm font-semibold">₱{Number(order.total_amount).toFixed(2)}</p>
                          <p className="text-xs text-gray-600 mt-1">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</p>
                        </div>
                        {order.items.length > 0 && (  
                          <div className="mt-3 pt-3 border-t border-gray-100">
                            <p className="text-sm font-medium">{order.items[0].product_name}</p>
                            {order.items.length > 1 && (
                              <p className="text-sm font-medium">{order.items[1].product_name}</p>
                            )}
                            {order.items.length > 2 && (
                              <p className="text-xs text-gray-500 mt-1">See more</p>
                            )}
                          </div>
                        )}
                      </div>
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
            dietaryPreferences: {
              is_vegetarian: user.is_vegetarian || false,
              is_vegan: user.is_vegan || false,
              is_pescatarian: user.is_pescatarian || false,
              is_flexitarian: user.is_flexitarian || false,
              is_paleo: user.is_paleo || false,
              is_ketogenic: user.is_ketogenic || false,
              is_halal: user.is_halal || false,
              is_kosher: user.is_kosher || false,
              is_fruitarian: user.is_fruitarian || false,
              is_gluten_free: user.is_gluten_free || false,
              is_dairy_free: user.is_dairy_free || false,
              is_organic: user.is_organic || false,
            },
          }}
        />
      )}
    </>
  );
};


export default UserProfilePage;

