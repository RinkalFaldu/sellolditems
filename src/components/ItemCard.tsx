import React from 'react';
import { MapPin, Clock, User, Heart, Eye } from 'lucide-react';
import { Item } from '../types';

interface ItemCardProps {
  item: Item;
  onClick: () => void;
}

const ItemCard: React.FC<ItemCardProps> = ({ item, onClick }) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'new': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'like-new': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'good': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'fair': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'poor': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div 
      onClick={onClick}
      className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:border-purple-200 transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        <img
          src={item.images[0]}
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        
        {/* Overlay Elements */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        {/* Condition Badge */}
        <div className="absolute top-3 left-3">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold border backdrop-blur-sm ${getConditionColor(item.condition)}`}>
            {item.condition.replace('-', ' ')}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="absolute top-3 right-3 flex space-x-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
          <button className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-lg">
            <Heart className="h-4 w-4 text-gray-600 hover:text-red-500 transition-colors" />
          </button>
          <button className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-lg">
            <Eye className="h-4 w-4 text-gray-600 hover:text-purple-500 transition-colors" />
          </button>
        </div>

        {/* Image Count Indicator */}
        {item.images.length > 1 && (
          <div className="absolute bottom-3 right-3 bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
            +{item.images.length - 1}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-bold text-gray-900 group-hover:text-purple-700 transition-colors line-clamp-2 flex-1 mr-3">
            {item.title}
          </h3>
          <div className="text-xl font-bold text-purple-600 bg-purple-50 px-3 py-1 rounded-xl">
            {formatPrice(item.price)}
          </div>
        </div>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
          {item.description}
        </p>

        {/* Seller Info */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center">
              <User className="h-3 w-3 text-purple-600" />
            </div>
            <span className="text-sm font-medium text-gray-700">{item.seller.name}</span>
            {item.seller.isVerified && (
              <div className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full font-medium border border-blue-200">
                ✓ Verified
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-1 text-sm text-gray-500">
            <MapPin className="h-4 w-4" />
            <span className="truncate">{item.location}</span>
          </div>
          <div className="flex items-center space-x-1 text-sm text-gray-500">
            <Clock className="h-4 w-4" />
            <span>{formatDate(item.createdAt)}</span>
          </div>
        </div>
      </div>

      {/* Hover Effect Border */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500 to-purple-600 opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none"></div>
    </div>
  );
};

export default ItemCard;