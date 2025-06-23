import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface ImageUploadProps {
  images: File[];
  onImagesChange: (images: File[]) => void;
  maxImages?: number;
  error?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ 
  images, 
  onImagesChange, 
  maxImages = 5,
  error 
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const newImages: File[] = [];
    const newPreviewUrls: string[] = [];
    const remainingSlots = maxImages - images.length;
    const filesToProcess = Math.min(files.length, remainingSlots);

    for (let i = 0; i < filesToProcess; i++) {
      const file = files[i];
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        continue;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        continue;
      }

      newImages.push(file);
      
      // Create object URL for preview
      const previewUrl = URL.createObjectURL(file);
      newPreviewUrls.push(previewUrl);
    }

    onImagesChange([...images, ...newImages]);
    setPreviewUrls([...previewUrls, ...newPreviewUrls]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    const newPreviewUrls = previewUrls.filter((_, i) => i !== index);
    
    // Revoke the object URL to prevent memory leaks
    if (previewUrls[index]) {
      URL.revokeObjectURL(previewUrls[index]);
    }
    
    onImagesChange(newImages);
    setPreviewUrls(newPreviewUrls);
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  // Cleanup object URLs on unmount
  React.useEffect(() => {
    return () => {
      previewUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, []);

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={openFileDialog}
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${isDragging 
            ? 'border-purple-500 bg-purple-50' 
            : images.length >= maxImages
            ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
            : 'border-gray-300 hover:border-purple-400 hover:bg-purple-50'
          }
          ${error ? 'border-red-300 bg-red-50' : ''}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
          disabled={images.length >= maxImages}
        />

        <div className="space-y-2">
          <div className={`w-12 h-12 mx-auto rounded-lg flex items-center justify-center ${
            isDragging ? 'bg-purple-200' : 'bg-gray-200'
          }`}>
            <Upload className={`h-6 w-6 ${
              isDragging ? 'text-purple-600' : 'text-gray-500'
            }`} />
          </div>
          
          {images.length >= maxImages ? (
            <div>
              <p className="text-gray-500 font-medium">Maximum images reached</p>
              <p className="text-sm text-gray-400">Remove an image to add more</p>
            </div>
          ) : (
            <div>
              <p className="text-gray-700 font-medium">
                {isDragging ? 'Drop images here' : 'Click to upload or drag and drop'}
              </p>
              <p className="text-sm text-gray-500">
                PNG, JPG, GIF up to 5MB each • {images.length}/{maxImages} images
              </p>
            </div>
          )}
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      {/* Image Previews */}
      {previewUrls.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {previewUrls.map((previewUrl, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square rounded-lg overflow-hidden border-2 border-gray-200">
                <img
                  src={previewUrl}
                  alt={`Upload ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Remove Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeImage(index);
                }}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
              >
                <X className="h-3 w-3" />
              </button>

              {/* Image Number */}
              <div className="absolute top-2 left-2 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                {index + 1}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-2">
          <ImageIcon className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-blue-900">Photo Tips</h4>
            <ul className="text-sm text-blue-700 mt-1 space-y-1">
              <li>• Use good lighting and clear, high-quality images</li>
              <li>• Show the item from multiple angles</li>
              <li>• Include any defects or wear in the photos</li>
              <li>• The first image will be used as the main thumbnail</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageUpload;