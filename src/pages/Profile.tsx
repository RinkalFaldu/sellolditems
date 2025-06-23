import React, { useState } from 'react';
import { User, Mail, Shield, Calendar, Edit, Save, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useMarketplace } from '../context/MarketplaceContext';

const Profile: React.FC = () => {
  const { currentUser } = useAuth();
  const { items } = useMarketplace();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    uwNetId: currentUser?.uwNetId || '',
  });

  const myItems = items.filter(item => item.sellerId === currentUser?.id);
  const activeListings = myItems.filter(item => item.isAvailable);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleSave = () => {
    // In a real app, this would update the user profile
    console.log('Saving profile:', formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      name: currentUser?.name || '',
      uwNetId: currentUser?.uwNetId || '',
    });
    setIsEditing(false);
  };

  if (!currentUser) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-purple-600 to-purple-800 px-6 py-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
                  <User className="h-10 w-10 text-purple-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">{currentUser.name}</h1>
                  <p className="text-purple-200">{currentUser.email}</p>
                  {currentUser.isVerified && (
                    <div className="flex items-center space-x-1 mt-2">
                      <Shield className="h-4 w-4 text-green-300" />
                      <span className="text-green-300 text-sm font-medium">Verified UW Student</span>
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="bg-white text-purple-600 px-4 py-2 rounded-lg hover:bg-purple-50 transition-colors font-medium flex items-center space-x-2"
              >
                <Edit className="h-4 w-4" />
                <span>Edit Profile</span>
              </button>
            </div>
          </div>

          <div className="p-6">
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    UW NetID
                  </label>
                  <input
                    type="text"
                    value={formData.uwNetId}
                    onChange={(e) => setFormData(prev => ({ ...prev, uwNetId: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={handleSave}
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
                  >
                    <Save className="h-4 w-4" />
                    <span>Save Changes</span>
                  </button>
                  <button
                    onClick={handleCancel}
                    className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2"
                  >
                    <X className="h-4 w-4" />
                    <span>Cancel</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Email</p>
                      <p className="text-sm text-gray-600">{currentUser.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <User className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">UW NetID</p>
                      <p className="text-sm text-gray-600">{currentUser.uwNetId}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Member Since</p>
                      <p className="text-sm text-gray-600">{formatDate(currentUser.joinedDate)}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Shield className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Account Status</p>
                      <p className={`text-sm ${
                        currentUser.isVerified ? 'text-green-600' : 'text-orange-600'
                      }`}>
                        {currentUser.isVerified ? 'Verified' : 'Pending Verification'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-purple-600 font-bold text-lg">{myItems.length}</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Listings</p>
                <p className="text-lg font-semibold text-gray-900">All Time</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-green-600 font-bold text-lg">{activeListings.length}</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Listings</p>
                <p className="text-lg font-semibold text-gray-900">Currently Selling</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 font-bold text-sm">$</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Value</p>
                <p className="text-lg font-semibold text-gray-900">
                  {formatPrice(myItems.reduce((sum, item) => sum + item.price, 0))}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          
          {myItems.length > 0 ? (
            <div className="space-y-4">
              {myItems.slice(0, 5).map((item) => (
                <div key={item.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                  <div className="w-12 h-12 rounded-lg overflow-hidden">
                    <img
                      src={item.images[0]}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{item.title}</p>
                    <p className="text-sm text-gray-600">
                      Listed on {formatDate(item.createdAt)} • {formatPrice(item.price)}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    item.isAvailable
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {item.isAvailable ? 'Active' : 'Sold'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600">No activity yet. Start by creating your first listing!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;