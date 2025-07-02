import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Send, User, Video, MoreVertical, Paperclip, Smile, Search, Star, Clock, CheckCheck, Check, Image, Plus, Mic, Camera, MapPin, Heart, ShoppingBag, X } from 'lucide-react';
import { useMarketplace } from '../context/MarketplaceContext';
import { useAuth } from '../context/AuthContext';
import { getConversationMessages, subscribeToMessages } from '../services/messageService';
import { Message } from '../types';

interface MessagesProps {
  selectedConversationId?: string;
  onBack?: () => void;
}

const Messages: React.FC<MessagesProps> = ({ selectedConversationId, onBack }) => {
  const { conversations, sendMessage } = useMarketplace();
  const { currentUser } = useAuth();
  const [selectedConversation, setSelectedConversation] = useState(
    selectedConversationId || (conversations.length > 0 ? conversations[0].id : null)
  );
  const [messageText, setMessageText] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'archived'>('all');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [messageText]);

  // Load messages when conversation changes
  useEffect(() => {
    if (selectedConversation) {
      loadMessages();
      
      // Subscribe to real-time messages
      const unsubscribe = subscribeToMessages(selectedConversation, (newMessages) => {
        setMessages(newMessages);
      });

      return unsubscribe;
    }
  }, [selectedConversation]);

  const loadMessages = async () => {
    if (!selectedConversation) return;

    try {
      setIsLoading(true);
      const conversationMessages = await getConversationMessages(selectedConversation);
      setMessages(conversationMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedConversation || !currentUser || isSending) return;

    try {
      setIsSending(true);
      await sendMessage(selectedConversation, messageText);
      setMessageText('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleAttachment = () => {
    // Create file input and trigger click
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,video/*,application/pdf';
    input.multiple = true;
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (files) {
        console.log('Files selected:', files);
        // Handle file upload logic here
      }
    };
    input.click();
  };

  const handleCamera = () => {
    // Handle camera functionality
    console.log('Camera clicked');
  };

  const handleLocation = () => {
    // Handle location sharing
    console.log('Location sharing clicked');
  };

  const handleMakeOffer = () => {
    // Handle make offer functionality
    console.log('Make offer clicked');
  };

  const handleVoiceMessage = () => {
    // Handle voice message recording
    console.log('Voice message clicked');
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const currentConversation = conversations.find(c => c.id === selectedConversation);

  const filteredConversations = conversations.filter(conversation => {
    if (!searchQuery) return true;
    const otherParticipant = conversation.participants.find(p => p.id !== currentUser?.id);
    return (
      otherParticipant?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conversation.item.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const groupMessagesByDate = (messages: Message[]) => {
    const groups: { [key: string]: Message[] } = {};
    
    messages.forEach(message => {
      const date = new Date(message.timestamp).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });
    
    return groups;
  };

  const formatDateHeader = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    
    if (dateString === today) return 'Today';
    if (dateString === yesterday) return 'Yesterday';
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const emojis = ['😊', '😂', '❤️', '👍', '👎', '😢', '😮', '😡', '🎉', '🔥', '💯', '✨'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {selectedConversationId && onBack && (
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 mb-6 transition-colors lg:hidden group"
          >
            <div className="w-8 h-8 bg-white/80 backdrop-blur-sm rounded-xl flex items-center justify-center group-hover:bg-white transition-all duration-200 shadow-sm">
              <ArrowLeft className="h-4 w-4" />
            </div>
            <span className="font-medium">Back</span>
          </button>
        )}

        <div className="bg-white/70 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/30 overflow-hidden h-[calc(100vh-8rem)]">
          <div className="flex h-full">
            {/* Conversations Sidebar - Made Smaller */}
            <div className={`w-full lg:w-80 border-r border-white/20 flex flex-col bg-gradient-to-b from-white/60 to-white/40 backdrop-blur-xl ${
              selectedConversation && selectedConversationId ? 'hidden lg:flex' : ''
            }`}>
              {/* Sidebar Header - Compact */}
              <div className="p-4 border-b border-white/20 bg-gradient-to-r from-indigo-50/80 to-purple-50/80 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                      <ShoppingBag className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        Messages
                      </h2>
                      <p className="text-xs text-gray-600 font-medium">{conversations.length} conversations</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button 
                      onClick={() => console.log('New conversation')}
                      className="w-8 h-8 bg-white/60 backdrop-blur-sm rounded-lg flex items-center justify-center hover:bg-white/80 transition-all duration-200 shadow-sm"
                    >
                      <Plus className="h-4 w-4 text-gray-600" />
                    </button>
                    <button 
                      onClick={() => console.log('More options')}
                      className="w-8 h-8 bg-white/60 backdrop-blur-sm rounded-lg flex items-center justify-center hover:bg-white/80 transition-all duration-200 shadow-sm"
                    >
                      <MoreVertical className="h-4 w-4 text-gray-600" />
                    </button>
                  </div>
                </div>
                
                {/* Compact Search Bar */}
                <div className="relative group mb-3">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors duration-200" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search..."
                    className="w-full pl-9 pr-3 py-2.5 bg-white/60 backdrop-blur-sm border border-white/30 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 transition-all duration-200 text-gray-900 placeholder-gray-500 shadow-sm hover:bg-white/70 text-sm"
                  />
                </div>

                {/* Compact Message Tabs */}
                <div className="flex bg-white/40 backdrop-blur-sm rounded-xl p-1 border border-white/30">
                  {[
                    { key: 'all', label: 'All', count: conversations.length },
                    { key: 'unread', label: 'Unread', count: 3 },
                    { key: 'archived', label: 'Archived', count: 0 }
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key as any)}
                      className={`flex-1 px-2 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                        activeTab === tab.key
                          ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg'
                          : 'text-gray-600 hover:text-indigo-600 hover:bg-white/50'
                      }`}
                    >
                      {tab.label}
                      {tab.count > 0 && (
                        <span className={`ml-1 px-1.5 py-0.5 rounded-full text-xs ${
                          activeTab === tab.key
                            ? 'bg-white/20 text-white'
                            : 'bg-indigo-100 text-indigo-600'
                        }`}>
                          {tab.count}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Conversations List - Compact */}
              <div className="flex-1 overflow-y-auto scrollbar-hide">
                {filteredConversations.length === 0 ? (
                  <div className="p-6 text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <User className="h-8 w-8 text-indigo-500" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      {searchQuery ? 'No conversations found' : 'No messages yet'}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {searchQuery 
                        ? 'Try adjusting your search terms'
                        : 'Start a conversation by contacting a seller.'
                      }
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1 p-3">
                    {filteredConversations.map((conversation, index) => {
                      const otherParticipant = conversation.participants.find(
                        p => p.id !== currentUser?.id
                      );
                      const isSelected = selectedConversation === conversation.id;
                      
                      return (
                        <button
                          key={conversation.id}
                          onClick={() => setSelectedConversation(conversation.id)}
                          className={`w-full text-left p-3 rounded-xl transition-all duration-300 group relative overflow-hidden ${
                            isSelected 
                              ? 'bg-gradient-to-r from-indigo-500/10 to-purple-500/10 shadow-lg ring-2 ring-indigo-200/50' 
                              : 'hover:bg-white/60 hover:shadow-md'
                          }`}
                        >
                          <div className="relative flex items-start space-x-3">
                            {/* Compact Avatar */}
                            <div className="relative flex-shrink-0">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transition-all duration-300 ${
                                isSelected 
                                  ? 'bg-gradient-to-br from-indigo-500 to-purple-600' 
                                  : 'bg-gradient-to-br from-indigo-100 to-purple-100'
                              }`}>
                                <User className={`h-5 w-5 transition-colors duration-300 ${
                                  isSelected ? 'text-white' : 'text-indigo-600'
                                }`} />
                              </div>
                              {/* Online Status */}
                              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white shadow-lg"></div>
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <p className={`font-bold truncate text-sm transition-colors duration-300 ${
                                  isSelected ? 'text-indigo-900' : 'text-gray-900'
                                }`}>
                                  {otherParticipant?.name || 'Unknown User'}
                                </p>
                                <span className={`text-xs font-medium transition-colors duration-300 ${
                                  isSelected ? 'text-indigo-600' : 'text-gray-500'
                                }`}>
                                  {formatTime(conversation.updatedAt)}
                                </span>
                              </div>
                              
                              <p className={`text-xs truncate mb-2 transition-colors duration-300 ${
                                isSelected ? 'text-indigo-700' : 'text-gray-600'
                              }`}>
                                {conversation.lastMessage?.content || 'Start the conversation...'}
                              </p>
                              
                              {/* Compact Item Info */}
                              <div className="flex items-center space-x-2">
                                <div className="text-xs font-bold text-indigo-600 truncate flex-1">
                                  {conversation.item.title}
                                </div>
                                <div className="text-xs font-bold text-purple-600">
                                  {formatPrice(conversation.item.price)}
                                </div>
                              </div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Chat Area - Now Much Bigger */}
            {currentConversation ? (
              <div className={`flex-1 flex flex-col ${
                selectedConversationId ? '' : 'hidden lg:flex'
              }`}>
                {/* Chat Header - Streamlined */}
                <div className="p-4 border-b border-white/20 bg-gradient-to-r from-white/80 to-indigo-50/80 backdrop-blur-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {selectedConversationId && (
                        <button
                          onClick={() => setSelectedConversation(null)}
                          className="lg:hidden w-8 h-8 bg-white/80 rounded-lg flex items-center justify-center hover:bg-white transition-all duration-200 shadow-sm"
                        >
                          <ArrowLeft className="h-4 w-4 text-gray-600" />
                        </button>
                      )}
                      
                      <div className="relative">
                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                          <User className="h-6 w-6 text-white" />
                        </div>
                        <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white shadow-lg">
                          <div className="w-full h-full bg-emerald-400 rounded-full animate-pulse"></div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg">
                          {currentConversation.participants.find(p => p.id !== currentUser?.id)?.name}
                        </h3>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                          <span className="text-sm text-emerald-600 font-semibold">Active now</span>
                          {isTyping && (
                            <>
                              <span className="text-gray-400">•</span>
                              <span className="text-sm text-gray-500 italic">typing...</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => console.log('Video call')}
                        className="w-10 h-10 bg-white/60 backdrop-blur-sm rounded-xl flex items-center justify-center hover:bg-white/80 transition-all duration-200 shadow-sm hover:shadow-md hover:scale-105"
                      >
                        <Video className="h-5 w-5 text-gray-600" />
                      </button>
                      <button 
                        onClick={() => console.log('More options')}
                        className="w-10 h-10 bg-white/60 backdrop-blur-sm rounded-xl flex items-center justify-center hover:bg-white/80 transition-all duration-200 shadow-sm hover:shadow-md hover:scale-105"
                      >
                        <MoreVertical className="h-5 w-5 text-gray-600" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Messages Area - Much Bigger Now */}
                <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-gradient-to-b from-slate-50/30 to-white/30 scrollbar-hide">
                  {isLoading ? (
                    <div className="text-center py-20">
                      <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
                        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                      </div>
                      <p className="text-gray-600 font-semibold text-xl">Loading messages...</p>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="text-center py-20">
                      <div className="w-32 h-32 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-10 shadow-xl">
                        <Star className="h-16 w-16 text-indigo-500" />
                      </div>
                      <h3 className="text-3xl font-bold text-gray-900 mb-6">Start the conversation!</h3>
                      <p className="text-gray-600 mb-10 text-xl leading-relaxed max-w-lg mx-auto">
                        Send your first message to get things started. Be friendly and ask any questions about the item.
                      </p>
                      <div className="flex justify-center space-x-4">
                        {['👋', '💬', '❓'].map((emoji, index) => (
                          <div key={index} className="w-16 h-16 bg-white/80 rounded-full flex items-center justify-center shadow-lg animate-bounce" style={{ animationDelay: `${index * 200}ms` }}>
                            <span className="text-2xl">{emoji}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    Object.entries(groupMessagesByDate(messages)).map(([date, dayMessages]) => (
                      <div key={date}>
                        {/* Date Header */}
                        <div className="flex items-center justify-center mb-10">
                          <div className="bg-white/80 backdrop-blur-sm px-8 py-4 rounded-full border border-white/30 shadow-lg">
                            <span className="text-sm font-bold text-gray-700">
                              {formatDateHeader(date)}
                            </span>
                          </div>
                        </div>
                        
                        {/* Messages */}
                        <div className="space-y-8">
                          {dayMessages.map((message, index) => {
                            const isOwn = message.senderId === currentUser?.id;
                            const showAvatar = index === 0 || dayMessages[index - 1].senderId !== message.senderId;
                            
                            return (
                              <div
                                key={message.id}
                                className={`flex items-end space-x-4 ${isOwn ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-4 duration-500`}
                                style={{ animationDelay: `${index * 100}ms` }}
                              >
                                {!isOwn && (
                                  <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                                    showAvatar ? 'bg-gradient-to-br from-indigo-100 to-purple-100 shadow-lg scale-100' : 'invisible scale-0'
                                  }`}>
                                    {showAvatar && <User className="h-6 w-6 text-indigo-600" />}
                                  </div>
                                )}
                                
                                <div className={`group max-w-md lg:max-w-lg ${isOwn ? 'order-1' : ''}`}>
                                  <div
                                    className={`px-8 py-5 rounded-3xl shadow-lg backdrop-blur-sm border transition-all duration-300 hover:shadow-xl hover:scale-[1.02] ${
                                      isOwn
                                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-indigo-200/50 rounded-br-lg'
                                        : 'bg-white/90 text-gray-900 border-white/50 rounded-bl-lg hover:bg-white'
                                    }`}
                                  >
                                    <p className="leading-relaxed font-medium text-lg">{message.content}</p>
                                  </div>
                                  
                                  <div className={`flex items-center mt-3 space-x-2 ${
                                    isOwn ? 'justify-end' : 'justify-start'
                                  }`}>
                                    <span className="text-sm text-gray-500 font-medium">
                                      {formatTime(message.timestamp)}
                                    </span>
                                    {isOwn && (
                                      <Check className="h-4 w-4 text-emerald-500" />
                                    )}
                                  </div>
                                </div>
                                
                                {isOwn && (
                                  <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                                    showAvatar ? 'bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg scale-100' : 'invisible scale-0'
                                  }`}>
                                    {showAvatar && <User className="h-6 w-6 text-white" />}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input - Enhanced */}
                <div className="p-6 border-t border-white/20 bg-gradient-to-r from-white/80 to-indigo-50/80 backdrop-blur-xl">
                  {/* Quick Actions */}
                  <div className="flex items-center space-x-3 mb-4">
                    <button 
                      onClick={handleCamera}
                      className="flex items-center space-x-2 px-4 py-2 bg-white/60 hover:bg-white/80 rounded-xl transition-all duration-200 text-sm font-medium text-gray-700 shadow-sm hover:shadow-md"
                    >
                      <Camera className="h-4 w-4" />
                      <span>Photo</span>
                    </button>
                    <button 
                      onClick={handleLocation}
                      className="flex items-center space-x-2 px-4 py-2 bg-white/60 hover:bg-white/80 rounded-xl transition-all duration-200 text-sm font-medium text-gray-700 shadow-sm hover:shadow-md"
                    >
                      <MapPin className="h-4 w-4" />
                      <span>Location</span>
                    </button>
                    <button 
                      onClick={handleMakeOffer}
                      className="flex items-center space-x-2 px-4 py-2 bg-white/60 hover:bg-white/80 rounded-xl transition-all duration-200 text-sm font-medium text-gray-700 shadow-sm hover:shadow-md"
                    >
                      <Heart className="h-4 w-4" />
                      <span>Make Offer</span>
                    </button>
                  </div>

                  <div className="flex items-end space-x-4">
                    <button 
                      onClick={handleAttachment}
                      className="w-14 h-14 bg-white/60 hover:bg-white/80 rounded-2xl flex items-center justify-center transition-all duration-200 shadow-sm hover:shadow-md hover:scale-105"
                    >
                      <Paperclip className="h-6 w-6 text-gray-600" />
                    </button>
                    
                    <div className="flex-1 relative">
                      <textarea
                        ref={textareaRef}
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type your message..."
                        rows={1}
                        className="w-full px-8 py-5 pr-20 border-2 border-white/30 rounded-3xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 bg-white/70 backdrop-blur-sm transition-all duration-200 resize-none text-gray-900 placeholder-gray-500 shadow-sm hover:bg-white/80 font-medium text-lg"
                        style={{ minHeight: '64px', maxHeight: '140px' }}
                      />
                      <div className="absolute right-6 bottom-5 flex items-center space-x-3">
                        <button 
                          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                          className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center justify-center transition-colors"
                        >
                          <Smile className="h-5 w-5 text-gray-600" />
                        </button>
                        <button 
                          onClick={handleVoiceMessage}
                          className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center justify-center transition-colors"
                        >
                          <Mic className="h-5 w-5 text-gray-600" />
                        </button>
                      </div>

                      {/* Emoji Picker */}
                      {showEmojiPicker && (
                        <div className="absolute bottom-20 right-6 bg-white/90 backdrop-blur-sm border border-white/30 rounded-2xl p-4 shadow-xl z-50">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-semibold text-gray-700">Emojis</span>
                            <button
                              onClick={() => setShowEmojiPicker(false)}
                              className="w-6 h-6 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors"
                            >
                              <X className="h-3 w-3 text-gray-600" />
                            </button>
                          </div>
                          <div className="grid grid-cols-6 gap-2">
                            {emojis.map((emoji, index) => (
                              <button
                                key={index}
                                onClick={() => {
                                  setMessageText(prev => prev + emoji);
                                  setShowEmojiPicker(false);
                                }}
                                className="w-8 h-8 hover:bg-gray-100 rounded-lg flex items-center justify-center transition-colors text-lg hover:scale-110"
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <button
                      onClick={handleSendMessage}
                      disabled={!messageText.trim() || isSending}
                      className="w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
                    >
                      {isSending ? (
                        <div className="w-7 h-7 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Send className="h-7 w-7" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center hidden lg:flex bg-gradient-to-br from-indigo-50/30 to-purple-50/30">
                <div className="text-center max-w-md">
                  <div className="w-40 h-40 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-10 shadow-2xl">
                    <ShoppingBag className="h-20 w-20 text-indigo-500" />
                  </div>
                  <h3 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-8">
                    Select a conversation
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-xl">
                    Choose a conversation from the sidebar to start messaging with other students about their items.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;