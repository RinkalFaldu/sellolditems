export interface User {
  id: string;
  email: string;
  name: string;
  uwNetId: string;
  avatar?: string;
  joinedDate: string;
  isVerified: boolean;
}

export interface Item {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  condition: 'new' | 'like-new' | 'good' | 'fair' | 'poor';
  images: string[];
  sellerId: string;
  seller: User;
  createdAt: string;
  isAvailable: boolean;
  location: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  timestamp: string;
  isRead: boolean;
}

export interface Conversation {
  id: string;
  participants: User[];
  item: Item;
  lastMessage?: Message;
  updatedAt: string;
}

export type Category = 'textbooks' | 'electronics' | 'furniture' | 'clothing' | 'sports' | 'misc';