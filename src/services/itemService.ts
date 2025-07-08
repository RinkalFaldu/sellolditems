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
    const uploadPromises = images.map(async (image, index) => {
      // Create a unique filename with timestamp
      const timestamp = Date.now();
      const fileExtension = image.name.split('.').pop() || 'jpg';
      const fileName = `image_${index}_${timestamp}.${fileExtension}`;
      
      // Create storage reference
      const imageRef = ref(storage, `items/${itemId}/${fileName}`);
      
      // Upload the file
      const snapshot = await uploadBytes(imageRef, image);
      
      // Get download URL
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      return downloadURL;
    });

    // Wait for all uploads to complete
    const imageUrls = await Promise.all(uploadPromises);
    return imageUrls;
  } catch (error) {
    console.error('Error uploading images:', error);
    throw new Error('Failed to upload images. Please try again.');
  }
};

export const deleteItemImages = async (imageUrls: string[]): Promise<void> => {
  try {
    const deletePromises = imageUrls.map(async (imageUrl) => {
      try {
        // Extract the path from the download URL
        const url = new URL(imageUrl);
        const pathMatch = url.pathname.match(/\/o\/(.+)\?/);
        
        if (pathMatch) {
          const imagePath = decodeURIComponent(pathMatch[1]);
          const imageRef = ref(storage, imagePath);
          await deleteObject(imageRef);
        }
      } catch (error) {
        console.error('Error deleting individual image:', error);
        // Continue with other deletions even if one fails
      }
    });
    
    await Promise.all(deletePromises);
  } catch (error) {
    console.error('Error deleting images:', error);
    // Don't throw error here as it's cleanup - log and continue
  }
};

export const createItem = async (
  itemData: Omit<Item, 'id' | 'createdAt' | 'images'>,
  imageFiles: File[]
): Promise<string> => {
  try {
    // Validate image files
    if (imageFiles.length === 0) {
      throw new Error('At least one image is required');
    }

    // Validate file sizes (max 5MB each)
    const maxSize = 5 * 1024 * 1024; // 5MB
    for (const file of imageFiles) {
      if (file.size > maxSize) {
        throw new Error(`Image "${file.name}" is too large. Maximum size is 5MB.`);
      }
    }

    // Validate file types
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    for (const file of imageFiles) {
      if (!allowedTypes.includes(file.type)) {
        throw new Error(`Image "${file.name}" has an unsupported format. Please use JPG, PNG, GIF, or WebP.`);
      }
    }

    // Create item document first to get ID
    const itemsRef = collection(db, 'items');
    const docRef = await addDoc(itemsRef, {
      ...itemData,
      createdAt: Timestamp.now(),
      images: [], // Will be updated after image upload
    });

    try {
      // Upload images to Firebase Storage
      const imageUrls = await uploadItemImages(imageFiles, docRef.id);

      // Update item with image URLs
      await updateDoc(docRef, {
        images: imageUrls
      });

      return docRef.id;
    } catch (uploadError) {
      // If image upload fails, delete the created item document
      await deleteDoc(docRef);
      throw uploadError;
    }
  } catch (error) {
    console.error('Error creating item:', error);
    throw error instanceof Error ? error : new Error('Failed to create item');
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
      
      // Delete images from Firebase Storage
      if (itemData.images && itemData.images.length > 0) {
        await deleteItemImages(itemData.images);
      }
    }

    // Delete item document
    await deleteDoc(doc(db, 'items', itemId));
  } catch (error) {
    console.error('Error deleting item:', error);
    throw new Error('Failed to delete item');
  }
};