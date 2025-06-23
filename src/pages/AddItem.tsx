import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useMarketplace } from '../context/MarketplaceContext';
import { useAuth } from '../context/AuthContext';
import ImageUpload from '../components/ImageUpload';

interface AddItemProps {
  onBack: () => void;
  onSuccess: () => void;
}

const categories = [
  { key: 'textbooks', label: 'Textbooks' },
  { key: 'electronics', label: 'Electronics' },
  { key: 'furniture', label: 'Furniture' },
  { key: 'clothing', label: 'Clothing' },
  { key: 'sports', label: 'Sports & Recreation' },
  { key: 'misc', label: 'Miscellaneous' },
];

const conditions = [
  { key: 'new', label: 'New', description: 'Brand new, never used' },
  { key: 'like-new', label: 'Like New', description: 'Excellent condition, minimal use' },
  { key: 'good', label: 'Good', description: 'Good condition, shows some wear' },
  { key: 'fair', label: 'Fair', description: 'Fair condition, significant wear' },
  { key: 'poor', label: 'Poor', description: 'Heavy wear, but functional' },
];

const AddItem: React.FC<AddItemProps> = ({ onBack, onSuccess }) => {
  const { addItem, isLoading } = useMarketplace();
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    condition: '',
    location: 'UW Campus',
  });
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleImagesChange = (images: File[]) => {
    setSelectedImages(images);
    if (errors.images) {
      setErrors(prev => ({ ...prev, images: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Please enter a valid price';
    }

    if (!formData.category) {
      newErrors.category = 'Please select a category';
    }

    if (!formData.condition) {
      newErrors.condition = 'Please select a condition';
    }

    if (selectedImages.length === 0) {
      newErrors.images = 'Please upload at least one image';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !currentUser) return;

    setIsSubmitting(true);

    try {
      await addItem({
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category as any,
        condition: formData.condition as any,
        sellerId: currentUser.id,
        seller: currentUser,
        isAvailable: true,
        location: formData.location,
      }, selectedImages);

      onSuccess();
    } catch (error: any) {
      console.error('Error adding item:', error);
      setErrors({ submit: error.message || 'Failed to create listing. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-6">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back</span>
          </button>
          <h1 className="text-2xl font-bold text-gray-900">List an Item</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            {/* Title */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="What are you selling?"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors ${
                  errors.title ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title}</p>
              )}
            </div>

            {/* Description */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe your item in detail..."
                rows={4}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors ${
                  errors.description ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
              )}
            </div>

            {/* Price and Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', e.target.value)}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    className={`w-full pl-8 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors ${
                      errors.price ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                </div>
                {errors.price && (
                  <p className="mt-1 text-sm text-red-600">{errors.price}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors ${
                    errors.category ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category.key} value={category.key}>
                      {category.label}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="mt-1 text-sm text-red-600">{errors.category}</p>
                )}
              </div>
            </div>

            {/* Condition */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Condition *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {conditions.map((condition) => (
                  <button
                    key={condition.key}
                    type="button"
                    onClick={() => handleInputChange('condition', condition.key)}
                    className={`p-3 border rounded-lg text-left transition-colors ${
                      formData.condition === condition.key
                        ? 'border-purple-500 bg-purple-50 ring-2 ring-purple-200'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="font-medium text-gray-900">{condition.label}</div>
                    <div className="text-sm text-gray-600">{condition.description}</div>
                  </button>
                ))}
              </div>
              {errors.condition && (
                <p className="mt-1 text-sm text-red-600">{errors.condition}</p>
              )}
            </div>

            {/* Images */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Product Images *
              </label>
              <ImageUpload
                images={selectedImages}
                onImagesChange={handleImagesChange}
                maxImages={5}
                error={errors.images}
              />
            </div>

            {/* Location */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pickup Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="Where can buyers pick up this item?"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
              />
            </div>

            {errors.submit && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-600">{errors.submit}</p>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={onBack}
              className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isLoading}
              className="flex-1 bg-purple-600 text-white py-3 px-6 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {isSubmitting ? 'Listing Item...' : 'List Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddItem;