// Image Compression & Cloud Storage Upload Service for ORVEXI
// Automatically compresses high-resolution photos on the client (down to ~80-140KB)
// and uploads to Firebase Storage with instant fallback to optimized base64.

import { storage, storageRef, uploadBytesResumable, getDownloadURL } from '../firebase.js';

/**
 * Resizes and compresses an image file using an HTML5 Canvas.
 * Produces an optimized JPEG data URL (typically 60KB - 140KB) that safely
 * fits into localStorage and Firestore document quotas.
 *
 * @param {File|Blob} file
 * @param {Object} options
 * @param {number} options.maxWidth
 * @param {number} options.maxHeight
 * @param {number} options.quality
 * @returns {Promise<string>} Data URL
 */
export async function compressAndOptimizeImage(file, { maxWidth = 1920, maxHeight = 1080, quality = 0.82 } = {}) {
  return new Promise((resolve, reject) => {
    if (!file) {
      return reject(new Error('No file provided for compression.'));
    }

    // Pass through SVGs or non-image types
    if (file.type === 'image/svg+xml' || !file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Proportional downscaling
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.max(1, Math.round(width * ratio));
          height = Math.max(1, Math.round(height * ratio));
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          // If canvas context unavailable, fallback to original DataURL
          return resolve(e.target.result);
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };

      img.onerror = () => {
        // Fallback to raw DataURL if decoding failed
        resolve(e.target.result);
      };

      img.src = e.target.result;
    };

    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Uploads an image to Firebase Storage, or falls back to an optimized
 * client-compressed Data URL if Storage is restricted or offline.
 *
 * @param {File} file
 * @param {string} folder e.g. 'slides' | 'portfolio' | 'about'
 * @param {Function} [onProgress]
 * @returns {Promise<{ url: string, isStorageUrl: boolean }>}
 */
export async function uploadImageToStorage(file, folder = 'slides', onProgress = null) {
  // 1. First compress the photo on the client
  const compressedDataUrl = await compressAndOptimizeImage(file);

  // 2. Try Firebase Storage if initialized
  if (storage) {
    try {
      const res = await fetch(compressedDataUrl);
      const blob = await res.blob();
      const cleanName = (file.name || 'image.jpg')
        .toLowerCase()
        .replace(/[^a-z0-9.-]/g, '_');
      const storagePath = `${folder}/${Date.now()}_${cleanName}`;
      const fileRef = storageRef(storage, storagePath);

      const uploadTask = uploadBytesResumable(fileRef, blob, {
        contentType: 'image/jpeg',
        customMetadata: {
          originalName: file.name,
          uploadedAt: new Date().toISOString()
        }
      });

      const downloadUrl = await new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            if (onProgress && snapshot.totalBytes > 0) {
              const pct = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              onProgress(Math.round(pct));
            }
          },
          (error) => reject(error),
          async () => {
            const url = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(url);
          }
        );
      });

      return downloadUrl;
    } catch (err) {
      console.warn('Firebase Storage upload unavailable, saving optimized photo locally:', err.message || err);
    }
  }

  // Fallback: return the compressed Data URL (~80-140KB)
  if (onProgress) onProgress(100);
  return compressedDataUrl;
}
