import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  getDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  Timestamp 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../config/firebase';
import { Item, User } from '../types';

export const uploadItemImages = async (images: File[], itemId: string): Promise<string[]> => {
  try {
    // For demo purposes, we'll use placeholder images to speed up the process
    // In production, you would upload to Firebase Storage
    const placeholderImages = [
      'https://images.pexels.com/photos/1029757/pexels-photo-1029757.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1029757/pexels-photo-1029757.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1029757/pexels-photo-1029757.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1029757/pexels-photo-1029757.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1029757/pexels-photo-1029757.jpeg?auto=compress&cs=tinysrgb&w=800',
    ];

    // Return placeholder images based on the number of uploaded files
    return placeholderImages.slice(0, images.length);

    // Uncomment below for actual Firebase Storage upload:
    /*
    const uploadPromises = images.map(async (image, index) => {
      const imageRef = ref(storage, `items/${itemId}/image_${index}_${Date.now()}`);
      const snapshot = await uploadBytes(imageRef, image);
      return getDownloadURL(snapshot.ref);
    });

    return Promise.all(uploadPromises);
    */
  } catch (error) {
    console.error('Error uploading images:', error);
    throw new Error('Failed to upload images');
  }
};

export const createItem = async (
  itemData: Omit<Item, 'id' | 'createdAt' | 'images'>,
  imageFiles: File[]
): Promise<string> => {
  try {
    // Create item document first to get ID
    const itemsRef = collection(db, 'items');
    const docRef = await addDoc(itemsRef, {
      ...itemData,
      createdAt: Timestamp.now(),
      images: [], // Will be updated after image upload
    });

    // Upload images (using placeholders for speed)
    const imageUrls = await uploadItemImages(imageFiles, docRef.id);

    // Update item with image URLs
    await updateDoc(docRef, {
      images: imageUrls
    });

    return docRef.id;
  } catch (error) {
    console.error('Error creating item:', error);
    throw new Error('Failed to create item');
  }
};

export const getAllItems = async (): Promise<Item[]> => {
  try {
    const itemsRef = collection(db, 'items');
    const q = query(itemsRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);

    const items: Item[] = [];
    
    for (const docSnap of querySnapshot.docs) {
      const itemData = docSnap.data();
      
      // Get seller information
      const sellerDoc = await getDoc(doc(db, 'users', itemData.sellerId));
      const sellerData = sellerDoc.exists() ? sellerDoc.data() as User : null;

      if (sellerData) {
        items.push({
          id: docSnap.id,
          ...itemData,
          createdAt: itemData.createdAt.toDate().toISOString(),
          seller: sellerData,
        } as Item);
      }
    }

    return items;
  } catch (error) {
    console.error('Error getting items:', error);
    throw new Error('Failed to fetch items');
  }
};

export const getItemById = async (itemId: string): Promise<Item | null> => {
  try {
    const itemDoc = await getDoc(doc(db, 'items', itemId));
    
    if (!itemDoc.exists()) {
      return null;
    }

    const itemData = itemDoc.data();
    
    // Get seller information
    const sellerDoc = await getDoc(doc(db, 'users', itemData.sellerId));
    const sellerData = sellerDoc.exists() ? sellerDoc.data() as User : null;

    if (!sellerData) {
      return null;
    }

    return {
      id: itemDoc.id,
      ...itemData,
      createdAt: itemData.createdAt.toDate().toISOString(),
      seller: sellerData,
    } as Item;
  } catch (error) {
    console.error('Error getting item:', error);
    return null;
  }
};

export const getUserItems = async (userId: string): Promise<Item[]> => {
  try {
    const itemsRef = collection(db, 'items');
    const q = query(
      itemsRef, 
      where('sellerId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);

    const items: Item[] = [];
    
    for (const docSnap of querySnapshot.docs) {
      const itemData = docSnap.data();
      
      // Get seller information
      const sellerDoc = await getDoc(doc(db, 'users', itemData.sellerId));
      const sellerData = sellerDoc.exists() ? sellerDoc.data() as User : null;

      if (sellerData) {
        items.push({
          id: docSnap.id,
          ...itemData,
          createdAt: itemData.createdAt.toDate().toISOString(),
          seller: sellerData,
        } as Item);
      }
    }

    return items;
  } catch (error) {
    console.error('Error getting user items:', error);
    throw new Error('Failed to fetch user items');
  }
};

export const updateItem = async (itemId: string, updates: Partial<Item>): Promise<void> => {
  try {
    const itemRef = doc(db, 'items', itemId);
    await updateDoc(itemRef, updates);
  } catch (error) {
    console.error('Error updating item:', error);
    throw new Error('Failed to update item');
  }
};

export const deleteItem = async (itemId: string): Promise<void> => {
  try {
    // Get item data to delete associated images
    const itemDoc = await getDoc(doc(db, 'items', itemId));
    
    if (itemDoc.exists()) {
      const itemData = itemDoc.data();
      
      // Delete images from storage
      if (itemData.images && itemData.images.length > 0) {
        const deletePromises = itemData.images.map(async (imageUrl: string) => {
          try {
            const imageRef = ref(storage, imageUrl);
            await deleteObject(imageRef);
          } catch (error) {
            console.error('Error deleting image:', error);
          }
        });
        
        await Promise.all(deletePromises);
      }
    }

    // Delete item document
    await deleteDoc(doc(db, 'items', itemId));
  } catch (error) {
    console.error('Error deleting item:', error);
    throw new Error('Failed to delete item');
  }
};