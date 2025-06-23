import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  getDoc,
  query, 
  where, 
  orderBy,
  onSnapshot,
  Timestamp,
  updateDoc,
  limit
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Message, Conversation, User, Item } from '../types';

export const createConversation = async (
  itemId: string,
  buyerId: string,
  sellerId: string
): Promise<string> => {
  try {
    // Check if conversation already exists
    const conversationsRef = collection(db, 'conversations');
    const q = query(
      conversationsRef,
      where('itemId', '==', itemId),
      where('participants', 'array-contains', buyerId)
    );
    
    const existingConversations = await getDocs(q);
    
    // Check if any existing conversation has both participants
    for (const docSnap of existingConversations.docs) {
      const data = docSnap.data();
      if (data.participants.includes(sellerId)) {
        return docSnap.id;
      }
    }

    // Create new conversation
    const conversationData = {
      itemId,
      participants: [buyerId, sellerId],
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const docRef = await addDoc(conversationsRef, conversationData);
    return docRef.id;
  } catch (error) {
    console.error('Error creating conversation:', error);
    throw new Error('Failed to create conversation');
  }
};

export const sendMessage = async (
  conversationId: string,
  senderId: string,
  content: string
): Promise<void> => {
  try {
    // Add message to messages collection
    const messagesRef = collection(db, 'messages');
    await addDoc(messagesRef, {
      conversationId,
      senderId,
      content,
      timestamp: Timestamp.now(),
      isRead: false,
    });

    // Update conversation's last activity
    const conversationRef = doc(db, 'conversations', conversationId);
    await updateDoc(conversationRef, {
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error sending message:', error);
    throw new Error('Failed to send message');
  }
};

export const getConversationMessages = async (conversationId: string): Promise<Message[]> => {
  try {
    const messagesRef = collection(db, 'messages');
    // Simple query without ordering to avoid index requirement
    const q = query(
      messagesRef,
      where('conversationId', '==', conversationId)
    );

    const querySnapshot = await getDocs(q);
    
    const messages = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp.toDate().toISOString(),
    })) as Message[];

    // Sort messages by timestamp in JavaScript instead of Firestore
    return messages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  } catch (error) {
    console.error('Error getting messages:', error);
    throw new Error('Failed to fetch messages');
  }
};

export const getUserConversations = async (userId: string): Promise<Conversation[]> => {
  try {
    const conversationsRef = collection(db, 'conversations');
    // Simple query without ordering to avoid index requirement
    const q = query(
      conversationsRef,
      where('participants', 'array-contains', userId)
    );

    const querySnapshot = await getDocs(q);
    const conversations: Conversation[] = [];

    for (const docSnap of querySnapshot.docs) {
      const conversationData = docSnap.data();
      
      // Get item information
      const itemDoc = await getDoc(doc(db, 'items', conversationData.itemId));
      if (!itemDoc.exists()) continue;
      
      const itemData = itemDoc.data();
      
      // Get seller information
      const sellerDoc = await getDoc(doc(db, 'users', itemData.sellerId));
      if (!sellerDoc.exists()) continue;
      
      const sellerData = sellerDoc.data() as User;
      
      // Get all participants
      const participantPromises = conversationData.participants.map(async (participantId: string) => {
        const userDoc = await getDoc(doc(db, 'users', participantId));
        return userDoc.exists() ? userDoc.data() as User : null;
      });
      
      const participants = (await Promise.all(participantPromises)).filter(Boolean) as User[];
      
      // Get last message with simple query
      const messagesRef = collection(db, 'messages');
      const lastMessageQuery = query(
        messagesRef,
        where('conversationId', '==', docSnap.id)
      );
      
      const lastMessageSnapshot = await getDocs(lastMessageQuery);
      let lastMessage = undefined;
      
      if (!lastMessageSnapshot.empty) {
        // Sort messages by timestamp and get the last one
        const messages = lastMessageSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp.toDate(),
        }));
        
        messages.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        
        if (messages.length > 0) {
          lastMessage = {
            ...messages[0],
            timestamp: messages[0].timestamp.toISOString(),
          } as Message;
        }
      }

      const item: Item = {
        id: itemDoc.id,
        ...itemData,
        createdAt: itemData.createdAt.toDate().toISOString(),
        seller: sellerData,
      } as Item;

      conversations.push({
        id: docSnap.id,
        participants,
        item,
        lastMessage,
        updatedAt: conversationData.updatedAt.toDate().toISOString(),
      });
    }

    // Sort conversations by updatedAt in JavaScript
    return conversations.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  } catch (error) {
    console.error('Error getting conversations:', error);
    throw new Error('Failed to fetch conversations');
  }
};

export const subscribeToMessages = (
  conversationId: string,
  callback: (messages: Message[]) => void
) => {
  const messagesRef = collection(db, 'messages');
  // Simple query without ordering to avoid index requirement
  const q = query(
    messagesRef,
    where('conversationId', '==', conversationId)
  );

  return onSnapshot(q, (querySnapshot) => {
    const messages = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp.toDate().toISOString(),
    })) as Message[];
    
    // Sort messages by timestamp in JavaScript
    const sortedMessages = messages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    callback(sortedMessages);
  });
};