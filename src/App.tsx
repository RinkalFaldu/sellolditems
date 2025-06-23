import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { MarketplaceProvider } from './context/MarketplaceContext';
import Header from './components/Header';
import Login from './pages/Login';
import Marketplace from './pages/Marketplace';
import ItemDetail from './pages/ItemDetail';
import AddItem from './pages/AddItem';
import Messages from './pages/Messages';
import MyListings from './pages/MyListings';
import Profile from './pages/Profile';

type Page = 'marketplace' | 'item-detail' | 'add-item' | 'messages' | 'my-listings' | 'profile';

function AppContent() {
  const { currentUser, isLoading } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>('marketplace');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-white font-bold text-xl">UW</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading HuskyMarket...</h2>
          <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  // Show login if not authenticated
  if (!currentUser) {
    return <Login />;
  }

  const handleNavigate = (page: Page) => {
    setCurrentPage(page);
    setSelectedItemId(null);
    setSelectedConversationId(null);
  };

  const handleItemClick = (itemId: string) => {
    setSelectedItemId(itemId);
    setCurrentPage('item-detail');
  };

  const handleStartChat = (conversationId: string) => {
    setSelectedConversationId(conversationId);
    setCurrentPage('messages');
  };

  const handleBackToMarketplace = () => {
    setCurrentPage('marketplace');
    setSelectedItemId(null);
  };

  const handleAddItemSuccess = () => {
    setCurrentPage('marketplace');
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'marketplace':
        return <Marketplace onItemClick={handleItemClick} />;
      
      case 'item-detail':
        return selectedItemId ? (
          <ItemDetail
            itemId={selectedItemId}
            onBack={handleBackToMarketplace}
            onStartChat={handleStartChat}
          />
        ) : (
          <Marketplace onItemClick={handleItemClick} />
        );
      
      case 'add-item':
        return (
          <AddItem
            onBack={handleBackToMarketplace}
            onSuccess={handleAddItemSuccess}
          />
        );
      
      case 'messages':
        return (
          <Messages
            selectedConversationId={selectedConversationId}
            onBack={() => setCurrentPage('marketplace')}
          />
        );
      
      case 'my-listings':
        return <MyListings onItemClick={handleItemClick} />;
      
      case 'profile':
        return <Profile />;
      
      default:
        return <Marketplace onItemClick={handleItemClick} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header currentPage={currentPage} onNavigate={handleNavigate} />
      {renderCurrentPage()}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <MarketplaceProvider>
        <AppContent />
      </MarketplaceProvider>
    </AuthProvider>
  );
}

export default App;