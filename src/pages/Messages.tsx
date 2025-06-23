import React, { useState, useEffect } from 'react';
import { ArrowLeft, Send, User } from 'lucide-react';
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
    if (!messageText.trim() || !selectedConversation || !currentUser) return;

    try {
      await sendMessage(selectedConversation, messageText);
      setMessageText('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const currentConversation = conversations.find(c => c.id === selectedConversation);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {selectedConversationId && onBack && (
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 mb-6 transition-colors lg:hidden"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back</span>
          </button>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-[calc(100vh-8rem)]">
          <div className="flex h-full">
            {/* Conversations List */}
            <div className={`w-full lg:w-80 border-r border-gray-200 flex flex-col ${
              selectedConversation && selectedConversationId ? 'hidden lg:flex' : ''
            }`}>
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
              </div>

              <div className="flex-1 overflow-y-auto">
                {conversations.length === 0 ? (
                  <div className="p-6 text-center">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                      <User className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="font-medium text-gray-900 mb-2">No messages yet</h3>
                    <p className="text-gray-600 text-sm">
                      Start a conversation by contacting a seller from an item page.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1 p-2">
                    {conversations.map((conversation) => {
                      const otherParticipant = conversation.participants.find(
                        p => p.id !== currentUser?.id
                      );
                      
                      return (
                        <button
                          key={conversation.id}
                          onClick={() => setSelectedConversation(conversation.id)}
                          className={`w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors ${
                            selectedConversation === conversation.id ? 'bg-purple-50 ring-2 ring-purple-200' : ''
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                              <User className="h-5 w-5 text-purple-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <p className="font-medium text-gray-900 truncate">
                                  {otherParticipant?.name || 'Unknown User'}
                                </p>
                                <span className="text-xs text-gray-500">
                                  {formatTime(conversation.updatedAt)}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 truncate">
                                {conversation.item.title}
                              </p>
                              <p className="text-sm font-medium text-purple-600">
                                {formatPrice(conversation.item.price)}
                              </p>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Chat Area */}
            {currentConversation ? (
              <div className={`flex-1 flex flex-col ${
                selectedConversationId ? '' : 'hidden lg:flex'
              }`}>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {selectedConversationId && (
                        <button
                          onClick={() => setSelectedConversation(null)}
                          className="lg:hidden text-gray-600 hover:text-gray-800"
                        >
                          <ArrowLeft className="h-5 w-5" />
                        </button>
                      )}
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {currentConversation.participants.find(p => p.id !== currentUser?.id)?.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          About: {currentConversation.item.title}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-purple-600">
                        {formatPrice(currentConversation.item.price)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {isLoading ? (
                    <div className="text-center py-8">
                      <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto"></div>
                      <p className="text-gray-600 mt-2">Loading messages...</p>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-600 mb-4">Start the conversation!</p>
                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 inline-block">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 rounded-lg overflow-hidden">
                            <img
                              src={currentConversation.item.images[0]}
                              alt={currentConversation.item.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {currentConversation.item.title}
                            </p>
                            <p className="text-purple-600 font-medium">
                              {formatPrice(currentConversation.item.price)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.senderId === currentUser?.id ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            message.senderId === currentUser?.id
                              ? 'bg-purple-600 text-white'
                              : 'bg-gray-200 text-gray-900'
                          }`}
                        >
                          <p>{message.content}</p>
                          <p
                            className={`text-xs mt-1 ${
                              message.senderId === currentUser?.id
                                ? 'text-purple-200'
                                : 'text-gray-500'
                            }`}
                          >
                            {formatTime(message.timestamp)}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-gray-200">
                  <div className="flex space-x-3">
                    <input
                      type="text"
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Type a message..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!messageText.trim()}
                      className="bg-purple-600 text-white p-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Send className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center hidden lg:flex">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="font-medium text-gray-900 mb-2">Select a conversation</h3>
                  <p className="text-gray-600 text-sm">
                    Choose a conversation from the sidebar to start messaging.
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