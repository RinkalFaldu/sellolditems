# Firebase Storage CORS Configuration

## Problem
Your deployed app is experiencing CORS errors when uploading images to Firebase Storage. This happens because Firebase Storage doesn't allow cross-origin requests from your deployed domain by default.

## Solution Steps

### 1. Install Google Cloud SDK (if not already installed)
```bash
# On macOS
brew install google-cloud-sdk

# On Windows
# Download from: https://cloud.google.com/sdk/docs/install

# On Linux
curl https://sdk.cloud.google.com | bash
```

### 2. Authenticate with Google Cloud
```bash
gcloud auth login
gcloud config set project css480uwmarketplace
```

### 3. Apply CORS Configuration
Run this command in your project root directory (where cors.json is located):

```bash
gsutil cors set cors.json gs://css480uwmarketplace.appspot.com
```

### 4. Verify CORS Configuration
```bash
gsutil cors get gs://css480uwmarketplace.appspot.com
```

### 5. Alternative: Use Firebase CLI
If you prefer using Firebase CLI:

```bash
# Install Firebase CLI if not already installed
npm install -g firebase-tools

# Login to Firebase
firebase login

# Deploy storage rules
firebase deploy --only storage
```

## Additional Fixes Applied

1. **Updated Storage Rules**: Made item images publicly readable while keeping write access for authenticated users only.

2. **Improved Upload Logic**: 
   - Added retry mechanism with exponential backoff
   - Sequential uploads to prevent rate limiting
   - Better error handling and timeout management
   - Added delays between uploads

3. **Enhanced Error Messages**: More specific error messages for different failure scenarios.

## Testing
After applying the CORS configuration:

1. Try uploading an image from your deployed app
2. Check the browser console for any remaining errors
3. Verify that images are successfully stored in Firebase Storage

## Troubleshooting

If you still experience issues:

1. **Check Firebase Storage Rules**: Ensure the rules allow your operations
2. **Verify Project ID**: Make sure you're using the correct Firebase project
3. **Check Network**: Some corporate networks block certain requests
4. **Browser Cache**: Clear browser cache and try again

## Important Notes

- CORS changes may take a few minutes to propagate
- The wildcard (*) origin is used for simplicity but consider restricting to specific domains in production
- Monitor your Firebase Storage usage to avoid quota limits