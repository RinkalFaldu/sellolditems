import React, { useState } from 'react';
import { ArrowLeft, MessageCircle, MapPin, Clock, User, Shield } from 'lucide-react';
import { useMarketplace } from '../context/MarketplaceContext';
import { useAuth } from '../context/AuthContext';

interface ItemDetailProps {
  itemId: string;
  onBack: () => void;
  onStartChat: (conversationId: string) => void;
}

const ItemDetail: React.FC<ItemDetailProps> = ({ itemId, onBack, onStartChat }) => {
  const { items, startConversation } = useMarketplace();
  const { currentUser } = useAuth();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isStartingChat, setIsStartingChat] = useState(false);

  const item = items.find(i => i.id === itemId);

  if (!item) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Item not found</h2>
          <button
            onClick={onBack}
            className="text-purple-600 hover:text-purple-700 font-medium"
          >
            Go back to marketplace
          </button>
        </div>
      </div>
    );
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'new': return 'bg-green-100 text-green-800';
      case 'like-new': return 'bg-blue-100 text-blue-800';
      case 'good': return 'bg-yellow-100 text-yellow-800';
      case 'fair': return 'bg-orange-100 text-orange-800';
      case 'poor': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleContactSeller = async () => {
    if (!currentUser || item.sellerId === currentUser.id) return;

    try {
      setIsStartingChat(true);
      const conversationId = await startConversation(item);
      onStartChat(conversationId);
    } catch (error) {
      console.error('Error starting conversation:', error);
    } finally {
      setIsStartingChat(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 mb-6 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to marketplace</span>
        </button>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="lg:flex">
            {/* Image Gallery - Square Format */}
            <div className="lg:w-1/2">
              <div className="relative aspect-square">
                <img
                  src={item.images[currentImageIndex]}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
                {item.images.length > 1 && (
                  <>
                    {/* Image Indicators */}
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                      {item.images.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`w-3 h-3 rounded-full ${
                            index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                          }`}
                        />
                      ))}
                    </div>
                    
                    {/* Thumbnail Strip */}
                    <div className="absolute bottom-4 right-4 flex flex-col space-y-2 max-h-48 overflow-y-auto">
                      {item.images.map((image, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                            index === currentImageIndex 
                              ? 'border-white ring-2 ring-purple-500' 
                              : 'border-white/50 hover:border-white'
                          }`}
                        >
                          <img
                            src={image}
                            alt={`View ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Item Details */}
            <div className="lg:w-1/2 p-6 lg:p-8">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                    {item.title}
                  </h1>
                  <div className="text-3xl font-bold text-purple-600 mb-4">
                    {formatPrice(item.price)}
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getConditionColor(item.condition)}`}>
                  {item.condition.replace('-', ' ')}
                </span>
              </div>

              <p className="text-gray-700 mb-6 leading-relaxed">
                {item.description}
              </p>

              {/* Item Info */}
              <div className="space-y-4 mb-6">
                <div className="flex items-center space-x-3 text-gray-600">
                  <MapPin className="h-5 w-5" />
                  <span>{item.location}</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-600">
                  <Clock className="h-5 w-5" />
                  <span>Listed on {formatDate(item.createdAt)}</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-600">
                  <span className="w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center text-xs font-medium text-purple-600">
                    C
                  </span>
                  <span className="capitalize">{item.category.replace('-', ' ')}</span>
                </div>
              </div>

              {/* Seller Info */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Seller Information</h3>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900">{item.seller.name}</span>
                      {item.seller.isVerified && (
                        <div className="flex items-center space-x-1 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                          <Shield className="h-3 w-3" />
                          <span>Verified UW Student</span>
                        </div>
                      )}
                    </div>
                    <div className="text-sm text-gray-600">
                      UW NetID: {item.seller.uwNetId}
                    </div>
                    <div className="text-sm text-gray-500">
                      Joined {formatDate(item.seller.joinedDate)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                {currentUser && item.sellerId !== currentUser.id ? (
                  <>
                    <button
                      onClick={handleContactSeller}
                      disabled={isStartingChat}
                      className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center space-x-2"
                    >
                      <MessageCircle className="h-5 w-5" />
                      <span>{isStartingChat ? 'Starting Chat...' : 'Contact Seller'}</span>
                    </button>
                    <button className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors font-medium">
                      Make an Offer
                    </button>
                  </>
                ) : currentUser && item.sellerId === currentUser.id ? (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-blue-800 font-medium">This is your listing</p>
                    <p className="text-blue-600 text-sm mt-1">
                      You can edit or delete this item from your listings page.
                    </p>
                  </div>
                ) : null}
              </div>

              {/* Safety Notice */}
              <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-medium text-yellow-800 mb-2">Safety Tips</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• Meet in a public place on campus</li>
                  <li>• Inspect items before purchasing</li>
                  <li>• Use secure payment methods</li>
                  <li>• Trust your instincts</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemDetail;