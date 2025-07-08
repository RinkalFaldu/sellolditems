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

// Debug function to check storage configuration
const debugStorageConfig = () => {
  console.log('🔧 Storage Configuration Debug:');
  console.log('Storage bucket:', import.meta.env.VITE_FIREBASE_STORAGE_BUCKET);
  console.log('Storage instance:', storage);
  console.log('Storage app:', storage.app);
};

export const uploadItemImages = async (images: File[], itemId: string): Promise<string[]> => {
  try {
    // Debug storage configuration
    debugStorageConfig();
    
    console.log('📤 Starting image upload process...');
    console.log('Number of images to upload:', images.length);
    console.log('Item ID:', itemId);
    
    // Upload images with timeout and better error handling
    const uploadPromises = images.map(async (image, index) => {
      const uploadTimeout = 30000; // 30 second timeout per image
      
      return Promise.race([
        uploadSingleImage(image, index, itemId),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error(`Upload timeout for image ${index + 1}`)), uploadTimeout)
        )
      ]);
    });

    // Wait for all uploads to complete
    // Wait for all uploads to complete
   console.log('⏳ Waiting for all uploads to complete...');
   const imageUrls = await Promise.all(uploadPromises) as string[];

    console.log('🎉 All images uploaded successfully!');
    console.log('Image URLs:', imageUrls);
    
    return imageUrls;
  } catch (error) {
    console.error('❌ Error uploading images:', error);
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('timeout')) {
        throw new Error('Upload is taking too long. Please try with smaller images or check your internet connection.');
      } else if (error.message.includes('storage/unauthorized')) {
        throw new Error('Storage access denied. Please check Firebase Storage rules.');
      } else if (error.message.includes('storage/invalid-argument')) {
        throw new Error('Invalid file format or storage configuration.');
      } else if (error.message.includes('storage/quota-exceeded')) {
        throw new Error('Storage quota exceeded. Please contact support.');
      } else {
        throw new Error(`Upload failed: ${error.message}`);
      }
    }
    
    throw new Error('Failed to upload images. Please try again.');
  }
};

const uploadSingleImage = async (image: File, index: number, itemId: string): Promise<string> => {
  try {
    console.log(`📸 Processing image ${index + 1}:`, {
      name: image.name,
      size: image.size,
      type: image.type
    });
    
    // Compress image if it's too large
    const processedImage = await compressImageIfNeeded(image);
    
    // Create a unique filename with timestamp
    const timestamp = Date.now();
    const fileExtension = processedImage.name.split('.').pop() || 'jpg';
    const fileName = `image_${index}_${timestamp}.${fileExtension}`;
    const storagePath = `items/${itemId}/${fileName}`;
    
    console.log(`📁 Storage path: ${storagePath}`);
    
    // Create storage reference
    const imageRef = ref(storage, storagePath);
    
    console.log('📤 Uploading to Firebase Storage...');
    
    // Upload the file with metadata
    const metadata = {
      contentType: processedImage.type,
      customMetadata: {
        originalName: image.name,
        uploadedAt: new Date().toISOString()
      }
    };
    
    const snapshot = await uploadBytes(imageRef, processedImage, metadata);
    
    console.log('✅ Upload successful:', snapshot.metadata.fullPath);
    
    // Get download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    console.log('🔗 Download URL generated:', downloadURL);
    
    return downloadURL;
  } catch (error) {
    console.error(`❌ Error uploading image ${index + 1}:`, error);
    throw error;
  }
};

// Compress image if it's larger than 1MB
const compressImageIfNeeded = async (file: File): Promise<File> => {
  const maxSize = 1024 * 1024; // 1MB
  
  if (file.size <= maxSize) {
    return file;
  }
  
  console.log(`🗜️ Compressing image: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`);
  
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const img = new Image();
    
    img.onload = () => {
      // Calculate new dimensions (max 1920px width/height)
      const maxDimension = 1920;
      let { width, height } = img;
      
      if (width > height && width > maxDimension) {
        height = (height * maxDimension) / width;
        width = maxDimension;
      } else if (height > maxDimension) {
        width = (width * maxDimension) / height;
        height = maxDimension;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            console.log(`✅ Compressed to: ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`);
            resolve(compressedFile);
          } else {
            resolve(file);
          }
        },
        'image/jpeg',
        0.8 // 80% quality
      );
    };
    
    img.src = URL.createObjectURL(file);
  });
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
    console.log('🚀 Starting item creation process...');
    
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

    console.log('📝 Creating item document...');
    // Create item document first to get ID
    const itemsRef = collection(db, 'items');
    const docRef = await addDoc(itemsRef, {
      ...itemData,
      createdAt: Timestamp.now(),
      images: [], // Will be updated after image upload
    });
    
    console.log('✅ Item document created with ID:', docRef.id);

    try {
      console.log('📤 Starting image upload...');
      // Upload images to Firebase Storage
      const imageUrls = await uploadItemImages(imageFiles, docRef.id);

      console.log('💾 Updating item with image URLs...');
      // Update item with image URLs
      await updateDoc(docRef, {
        images: imageUrls
      });
      
      console.log('🎉 Item creation completed successfully!');

      return docRef.id;
    } catch (uploadError) {
      console.error('❌ Upload failed, cleaning up item document...');
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