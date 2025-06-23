import React, { useState } from 'react';
import { Search, MessageCircle, Plus, User, LogOut, Menu, X, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useMarketplace } from '../context/MarketplaceContext';

interface HeaderProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

const Header: React.FC<HeaderProps> = ({ currentPage, onNavigate }) => {
  const { currentUser, logout } = useAuth();
  const { searchQuery, setSearchQuery } = useMarketplace();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    if (currentPage !== 'marketplace') {
      onNavigate('marketplace');
    }
  };

  const navigation = [
    { name: 'Marketplace', key: 'marketplace' },
    { name: 'Messages', key: 'messages' },
    { name: 'My Listings', key: 'my-listings' },
  ];

  return (
    <header className="bg-white/95 backdrop-blur-md shadow-lg border-b border-purple-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <button
              onClick={() => onNavigate('marketplace')}
              className="flex items-center space-x-3 text-purple-700 font-bold text-xl hover:text-purple-800 transition-all duration-200 group"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 via-purple-700 to-purple-800 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-purple-200 group-hover:scale-105 transition-all duration-200">
                <span className="text-white font-bold text-sm">UW</span>
              </div>
              <div className="hidden sm:block">
                <span className="bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
                  HuskyMarket
                </span>
                <div className="text-xs text-purple-500 font-normal -mt-1">Student Marketplace</div>
              </div>
            </button>
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-8">
            <div className="relative w-full group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearch}
                placeholder="Search for textbooks, electronics, furniture..."
                className="block w-full pl-12 pr-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50 hover:bg-white focus:bg-white transition-all duration-200 text-gray-900 placeholder-gray-500"
              />
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500 to-purple-600 opacity-0 group-focus-within:opacity-10 transition-opacity pointer-events-none"></div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            {navigation.map((item) => (
              <button
                key={item.key}
                onClick={() => onNavigate(item.key)}
                className={`relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  currentPage === item.key
                    ? 'bg-gradient-to-r from-purple-100 to-purple-50 text-purple-700 shadow-sm'
                    : 'text-gray-600 hover:text-purple-700 hover:bg-purple-50'
                }`}
              >
                {item.name}
                {currentPage === item.key && (
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-purple-600 rounded-full"></div>
                )}
              </button>
            ))}

            {/* Notifications */}
            <button className="relative p-2 text-gray-600 hover:text-purple-700 hover:bg-purple-50 rounded-xl transition-all duration-200">
              <Bell className="h-5 w-5" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
              </div>
            </button>

            <button
              onClick={() => onNavigate('add-item')}
              className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-2.5 rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-purple-200 hover:scale-105"
            >
              <Plus className="h-4 w-4" />
              <span className="font-medium">Sell Item</span>
            </button>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-3 text-gray-600 hover:text-gray-800 transition-all duration-200 p-2 rounded-xl hover:bg-gray-50"
              >
                <div className="w-9 h-9 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center ring-2 ring-white shadow-sm">
                  <User className="h-4 w-4 text-purple-600" />
                </div>
                <div className="hidden lg:block text-left">
                  <div className="text-sm font-medium text-gray-900">{currentUser?.name}</div>
                  <div className="text-xs text-gray-500">@{currentUser?.uwNetId}</div>
                </div>
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-in slide-in-from-top-2 duration-200">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center">
                        <User className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{currentUser?.name}</div>
                        <div className="text-sm text-gray-500">{currentUser?.email}</div>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      onNavigate('profile');
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors flex items-center space-x-3"
                  >
                    <User className="h-4 w-4" />
                    <span>View Profile</span>
                  </button>
                  <button
                    onClick={() => {
                      logout();
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-red-50 hover:text-red-700 transition-colors flex items-center space-x-3"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-600 hover:text-gray-800 transition-colors p-2 rounded-xl hover:bg-gray-50"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden pb-4">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearch}
              placeholder="Search items..."
              className="block w-full pl-12 pr-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50 hover:bg-white focus:bg-white transition-all duration-200"
            />
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 pb-4 animate-in slide-in-from-top-2 duration-200">
            <div className="pt-4 space-y-1">
              {navigation.map((item) => (
                <button
                  key={item.key}
                  onClick={() => {
                    onNavigate(item.key);
                    setIsMenuOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 ${
                    currentPage === item.key
                      ? 'bg-gradient-to-r from-purple-100 to-purple-50 text-purple-700'
                      : 'text-gray-600 hover:text-purple-700 hover:bg-purple-50'
                  }`}
                >
                  {item.name}
                </button>
              ))}
              
              <button
                onClick={() => {
                  onNavigate('add-item');
                  setIsMenuOpen(false);
                }}
                className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 py-3 rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all duration-200 flex items-center justify-center space-x-2 mt-4 shadow-lg"
              >
                <Plus className="h-4 w-4" />
                <span className="font-medium">Sell Item</span>
              </button>

              <div className="border-t border-gray-200 pt-4 mt-4">
                <div className="flex items-center space-x-3 px-4 py-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center">
                    <User className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-800">{currentUser?.name}</div>
                    <div className="text-xs text-gray-500">{currentUser?.email}</div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    onNavigate('profile');
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors"
                >
                  Profile
                </button>
                <button
                  onClick={() => {
                    logout();
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-red-50 hover:text-red-700 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;