import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getAllItems, createItem } from '../services/itemService';
import { getUserConversations, createConversation, sendMessage as sendMessageService } from '../services/messageService';
import { useAuth } from './AuthContext';
import { Item, Message, Conversation } from '../types';

interface MarketplaceContextType {
  items: Item[];
  conversations: Conversation[];
  searchQuery: string;
  selectedCategory: string;
  priceRange: [number, number];
  isLoading: boolean;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: string) => void;
  setPriceRange: (range: [number, number]) => void;
  addItem: (item: Omit<Item, 'id' | 'createdAt' | 'images'>, imageFiles: File[]) => Promise<void>;
  sendMessage: (conversationId: string, content: string) => Promise<void>;
  startConversation: (item: Item) => Promise<string>;
  refreshItems: () => Promise<void>;
  refreshConversations: () => Promise<void>;
}

const MarketplaceContext = createContext<MarketplaceContextType | undefined>(undefined);

export const useMarketplace = () => {
  const context = useContext(MarketplaceContext);
  if (context === undefined) {
    throw new Error('useMarketplace must be used within a MarketplaceProvider');
  }
  return context;
};

interface MarketplaceProviderProps {
  children: ReactNode;
}

export const MarketplaceProvider: React.FC<MarketplaceProviderProps> = ({ children }) => {
  const { currentUser } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [isLoading, setIsLoading] = useState(false);

  // Load items on component mount
  useEffect(() => {
    refreshItems();
  }, []);

  // Load conversations when user changes
  useEffect(() => {
    if (currentUser) {
      refreshConversations();
    } else {
      setConversations([]);
    }
  }, [currentUser]);

  const refreshItems = async () => {
    try {
      setIsLoading(true);
      const fetchedItems = await getAllItems();
      setItems(fetchedItems);
    } catch (error) {
      console.error('Error fetching items:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshConversations = async () => {
    if (!currentUser) return;

    try {
      const fetchedConversations = await getUserConversations(currentUser.id);
      setConversations(fetchedConversations);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  const addItem = async (newItem: Omit<Item, 'id' | 'createdAt' | 'images'>, imageFiles: File[]) => {
    if (!currentUser) throw new Error('User must be logged in to add items');

    try {
      setIsLoading(true);
      await createItem(newItem, imageFiles);
      await refreshItems(); // Refresh items list
    } catch (error) {
      console.error('Error adding item:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (conversationId: string, content: string) => {
    if (!currentUser) throw new Error('User must be logged in to send messages');

    try {
      await sendMessageService(conversationId, currentUser.id, content);
      await refreshConversations(); // Refresh conversations to update last message
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  };

  const startConversation = async (item: Item): Promise<string> => {
    if (!currentUser) throw new Error('User must be logged in to start conversations');
    if (item.sellerId === currentUser.id) throw new Error('Cannot start conversation with yourself');

    try {
      const conversationId = await createConversation(item.id, currentUser.id, item.sellerId);
      await refreshConversations(); // Refresh conversations list
      return conversationId;
    } catch (error) {
      console.error('Error starting conversation:', error);
      throw error;
    }
  };

  const value = {
    items,
    conversations,
    searchQuery,
    selectedCategory,
    priceRange,
    isLoading,
    setSearchQuery,
    setSelectedCategory,
    setPriceRange,
    addItem,
    sendMessage,
    startConversation,
    refreshItems,
    refreshConversations,
  };

  return <MarketplaceContext.Provider value={value}>{children}</MarketplaceContext.Provider>;
};