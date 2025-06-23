import React, { useState } from 'react';
import { Plus, Edit, Trash2, Eye, MoreVertical } from 'lucide-react';
import { useMarketplace } from '../context/MarketplaceContext';
import { useAuth } from '../context/AuthContext';
import ItemCard from '../components/ItemCard';

interface MyListingsProps {
  onItemClick: (itemId: string) => void;
}

const MyListings: React.FC<MyListingsProps> = ({ onItemClick }) => {
  const { items } = useMarketplace();
  const { currentUser } = useAuth();
  const [showMenu, setShowMenu] = useState<string | null>(null);

  const myItems = items.filter(item => item.sellerId === currentUser?.id);

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
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Listings</h1>
            <p className="text-gray-600 mt-1">
              {myItems.length} {myItems.length === 1 ? 'item' : 'items'} listed
            </p>
          </div>
        </div>

        {myItems.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No listings yet</h3>
            <p className="text-gray-600 max-w-md mx-auto mb-6">
              Start selling by creating your first listing. It's easy and free!
            </p>
            <button className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center space-x-2 mx-auto">
              <Plus className="h-5 w-5" />
              <span>Create Your First Listing</span>
            </button>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Eye className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Active Listings</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {myItems.filter(item => item.isAvailable).length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <span className="text-purple-600 font-bold text-lg">$</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Value</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatPrice(myItems.reduce((sum, item) => sum + item.price, 0))}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Trash2 className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Sold Items</p>
                    <p className="text-2xl font-bold text-gray-900">0</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Items Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {myItems.map((item) => (
                <div key={item.id} className="relative">
                  <ItemCard item={item} onClick={() => onItemClick(item.id)} />
                  
                  {/* Action Menu */}
                  <div className="absolute top-3 right-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowMenu(showMenu === item.id ? null : item.id);
                      }}
                      className="w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center hover:shadow-lg transition-shadow"
                    >
                      <MoreVertical className="h-4 w-4 text-gray-600" />
                    </button>

                    {showMenu === item.id && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                        <button
                          onClick={() => {
                            onItemClick(item.id);
                            setShowMenu(null);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                        >
                          <Eye className="h-4 w-4" />
                          <span>View Item</span>
                        </button>
                        <button
                          onClick={() => {
                            setShowMenu(null);
                            // Handle edit action
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                        >
                          <Edit className="h-4 w-4" />
                          <span>Edit Listing</span>
                        </button>
                        <button
                          onClick={() => {
                            setShowMenu(null);
                            // Handle delete action
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span>Delete Listing</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MyListings;