import React, { useState, useEffect } from 'react';
import { useAuthStore } from "../../hooks/auth/useauth";
import { motion } from 'framer-motion';
import { ProfileEditModalProps, DietaryPreferences } from '../../utils/types';

const dietaryOptions = [
  { key: 'is_vegetarian', label: 'Vegetarian' },
  { key: 'is_vegan', label: 'Vegan' },
  { key: 'is_pescatarian', label: 'Pescatarian' },
  { key: 'is_flexitarian', label: 'Flexitarian' },
  { key: 'is_paleo', label: 'Paleolithic' },
  { key: 'is_ketogenic', label: 'Ketogenic' },
  { key: 'is_halal', label: 'Halal' },
  { key: 'is_kosher', label: 'Kosher' },
  { key: 'is_fruitarian', label: 'Fruitarian' },
  { key: 'is_gluten_free', label: 'Gluten-Free' },
  { key: 'is_dairy_free', label: 'Dairy-free' },
  { key: 'is_organic', label: 'Organic' },
];

export const ProfileEditModal: React.FC<ProfileEditModalProps> = ({ isOpen, onClose, initialData }) => {
  const { updateProfile, updateDietaryPreferences, updateProfilePicture, refreshUserData, isLoading, error } = useAuthStore();
  const [formData, setFormData] = useState({
    full_name: initialData.full_name,
    email: initialData.email,
    phone_number: initialData.phone_number,
  });
  const [dietaryPreferences, setDietaryPreferences] = useState(initialData.dietaryPreferences);
  const [previewImage, setPreviewImage] = useState<string | undefined>(initialData.profile_picture);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [newImageFile, setNewImageFile] = useState<File | null>(null);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        full_name: initialData.full_name,
        email: initialData.email,
        phone_number: initialData.phone_number,
      });
      setPreviewImage(initialData.profile_picture);
      setDietaryPreferences(initialData.dietaryPreferences);
      setUpdateError(null);
      setErrors({});
      setNewImageFile(null);
    }
  }, [isOpen, initialData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: '' });
  };

  const handleDietaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setDietaryPreferences((prev) => ({ ...prev, [name]: checked }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Store the file for later upload on form submission
      setNewImageFile(file);
      
      // Show a local preview
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setPreviewImage(event.target?.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.full_name.trim()) newErrors.full_name = 'Full name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Valid email address is required';
    if (!formData.phone_number.trim()) newErrors.phone_number = 'Phone number is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setUpdateLoading(true);
    setUpdateError(null);

    try {
      // Only upload the image if a new file was selected
      if (newImageFile) {
        const imageUrl = await updateProfilePicture(newImageFile);
        console.log('Received image URL after upload:', imageUrl);
      }
      
      // Update the profile basic info
      await updateProfile({
        full_name: formData.full_name,
        email: formData.email,
        phone_number: formData.phone_number,
      });
      
      // Update dietary preferences
      await updateDietaryPreferences(dietaryPreferences);
      
      // Refresh user data from server to ensure everything is in sync
      await refreshUserData();
      
      onClose();
    } catch (err) {
      console.error('Profile update error:', err);
      setUpdateError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setUpdateLoading(false);
    }
  };

  if (!isOpen) return null;

  

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[9999]">
      <motion.div
        initial={{ opacity: 0, scale: 1 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-lg shadow-xl p-4 sm:p-6 w-full max-w-4xl h-auto max-h-[90vh] relative overflow-y-auto z-[10000]"
      >
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-600 hover:text-gray-900 z-[10001]" aria-label="Close modal">
          ✕
        </button>

        <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-[#32347C] text-left">Edit Profile</h2>

        <form onSubmit={handleSubmit}>
          <div className="flex flex-col lg:flex-row items-center lg:items-start space-y-6 lg:space-y-0 lg:space-x-8">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-32 h-32 sm:w-40 sm:h-40 bg-gray-300 rounded-full overflow-hidden">
                {previewImage ? (
                  <img src={previewImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500">No Image</div>
                )}
              </div>
              <label className="bg-[#32347C] text-white px-4 sm:px-6 py-2 rounded hover:bg-[#21215C] transition cursor-pointer text-sm sm:text-base">
                Upload Image
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>

            <div className="w-full">
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 font-medium">Full Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleInputChange}
                    className={`w-full border ${errors.full_name ? 'border-red-500' : 'border-gray-300'} rounded p-2`}
                    required
                  />
                  {errors.full_name && <p className="text-red-500 text-sm mt-1">{errors.full_name}</p>}
                </div>

                <div>
                  <label className="block text-gray-700 font-medium">Email Address <span className="text-red-500">*</span></label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded p-2`}
                    required
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-gray-700 font-medium">Phone Number <span className="text-red-500">*</span></label>
                  <input
                    type="tel"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleInputChange}
                    className={`w-full border ${errors.phone_number ? 'border-red-500' : 'border-gray-300'} rounded p-2`}
                    required
                  />
                  {errors.phone_number && <p className="text-red-500 text-sm mt-1">{errors.phone_number}</p>}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-gray-700 font-medium mb-2">Dietary Preferences</label>
            <div className="flex flex-wrap gap-2">
              {dietaryOptions.map((option) => (
                <label key={option.key} className="flex items-center space-x-2 bg-gray-200 px-3 py-1 rounded-full text-sm cursor-pointer mb-2">
                  <input
                    type="checkbox"
                    name={option.key}
                    checked={dietaryPreferences[option.key as keyof typeof dietaryPreferences]}
                    onChange={handleDietaryChange}
                    className="accent-[#32347C]"
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {updateError && <div className="mt-4 text-red-500 text-sm">{updateError}</div>}
          {error && <div className="mt-4 text-red-500 text-sm">{error instanceof Error ? error.message : String(error)}</div>}

          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              disabled={updateLoading || isLoading}
              className="bg-[#32347C] text-white px-5 py-2 rounded-full hover:bg-[#21215C] transition disabled:opacity-70"
            >
              {updateLoading || isLoading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};