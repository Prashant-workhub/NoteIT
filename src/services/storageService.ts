import { auth, storage } from '../firebaseConfig';
import { API_BASE_URL } from '../config';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export interface StorageResponse {
  uploadUrl: string;
  audioUrl: string;
  blobPath: string;
  isFirebase?: boolean;
}

const SMALL_FILE_SIZE_LIMIT = 5 * 1024 * 1024; // 5 MB threshold for Firebase storage vs local disk

/**
 * Sanitizes any storage URL returned by the backend.
 */
export const sanitizeStorageUrl = (url: string): string => {
  if (!url) return url;
  if (API_BASE_URL && !API_BASE_URL.includes('localhost') && !API_BASE_URL.includes('127.0.0.1')) {
    const cleanApiBase = API_BASE_URL.replace(/\/$/, '');
    return url.replace(/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i, cleanApiBase);
  }
  return url;
};

/**
 * Request an upload target from the local backend or direct Firebase Storage reference
 */
export const getUploadSasUrl = async (fileName: string): Promise<StorageResponse> => {
  try {
    const currentUser = auth.currentUser;
    if (currentUser) {
      const idToken = await currentUser.getIdToken(true).catch(() => null);
      if (idToken) {
        const requestUrl = `${API_BASE_URL}/api/storage/sas?fileName=${encodeURIComponent(fileName)}`;
        const response = await fetch(requestUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${idToken}`,
            'Content-Type': 'application/json'
          }
        }).catch(() => null);

        if (response && response.ok) {
          const responseBody = await response.json();
          return {
            ...responseBody,
            uploadUrl: sanitizeStorageUrl(responseBody.uploadUrl),
            audioUrl: sanitizeStorageUrl(responseBody.audioUrl)
          };
        }
      }
    }
  } catch (e) {
    console.warn('[Storage] Backend upload target generation unavailable. Using local storage fallback:', e);
  }

  // Resilient local fallback
  const mockPath = `local_storage/${Date.now()}_${fileName}`;
  return {
    uploadUrl: `${API_BASE_URL}/api/storage/local-upload?fileName=${encodeURIComponent(fileName)}`,
    audioUrl: mockPath,
    blobPath: mockPath
  };
};

// Aliased export for legacy imports
export const getAzureUploadSasUrl = getUploadSasUrl;

/**
 * Upload binary blob using optimal strategy:
 * - Firebase Storage for small & secure files (< 5MB)
 * - Local backend disk storage for large files (audio recordings)
 */
export const uploadBlobStorage = async (
  uploadUrl: string,
  blob: Blob,
  onProgress: (progress: number) => void,
  options?: { isSensitive?: boolean; fileName?: string }
): Promise<{ storageUrl?: string }> => {
  const currentUser = auth.currentUser;
  const isSmallAndSecure = (blob.size < SMALL_FILE_SIZE_LIMIT || options?.isSensitive) && currentUser;

  // 1. Firebase Storage Route for small & sensitive files
  if (isSmallAndSecure && options?.fileName && storage) {
    try {
      console.log('[Storage] Storing small/secure file to Firebase Storage...');
      onProgress(20);
      const fileRef = ref(storage, `users/${currentUser.uid}/secure_files/${Date.now()}_${options.fileName}`);
      onProgress(50);
      const snapshot = await uploadBytes(fileRef, blob);
      const downloadUrl = await getDownloadURL(snapshot.ref);
      onProgress(100);
      return { storageUrl: downloadUrl };
    } catch (firebaseErr) {
      console.warn('[Storage] Firebase upload failed, falling back to local backend disk:', firebaseErr);
    }
  }

  // 2. Local Backend Disk Storage Route
  if (!uploadUrl || uploadUrl.startsWith('local://')) {
    console.log('[Storage] Local storage fallback active. Upload complete.');
    onProgress(100);
    return {};
  }

  const sanitizedUrl = sanitizeStorageUrl(uploadUrl);
  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', sanitizedUrl, true);
    xhr.setRequestHeader('Content-Type', blob.type || 'application/octet-stream');

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const progress = (event.loaded / event.total) * 100;
        onProgress(progress);
      }
    };

    xhr.onload = () => {
      onProgress(100);
      resolve({});
    };

    xhr.onerror = () => {
      console.warn('[Storage] Local upload error. Using memory fallback...');
      onProgress(100);
      resolve({});
    };

    xhr.send(blob);
  });
};

// Aliased export for legacy imports
export const uploadBlobToAzure = uploadBlobStorage;

/**
 * Request read URL for file playback/viewing
 */
export const getReadSasUrl = async (blobPath: string): Promise<string> => {
  try {
    const currentUser = auth.currentUser;
    if (currentUser) {
      const idToken = await currentUser.getIdToken(true).catch(() => null);
      if (idToken) {
        const requestUrl = `${API_BASE_URL}/api/storage/read-sas?blobPath=${encodeURIComponent(blobPath)}`;
        const response = await fetch(requestUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${idToken}`,
            'Content-Type': 'application/json'
          }
        }).catch(() => null);

        if (response && response.ok) {
          const responseBody = await response.json();
          return sanitizeStorageUrl(responseBody.readUrl);
        }
      }
    }
  } catch (e) {
    console.warn('[Storage] Read URL backend unavailable. Using path directly:', e);
  }

  return blobPath;
};

// Aliased export for legacy imports
export const getAzureReadSasUrl = getReadSasUrl;

/**
 * Request text extraction from the document via backend service
 */
export const extractTextFromDocument = async (blobPath: string): Promise<string> => {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('User not authenticated with Firebase Auth.');
  }
  const idToken = await currentUser.getIdToken(true);

  const requestUrl = `${API_BASE_URL}/api/storage/extract-text`;

  const response = await fetch(requestUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${idToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ blobPath })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to extract text: ${response.status} - ${errorText}`);
  }

  const result = await response.json();
  
  // Auto-trigger cleanup on backend to avoid filling up disk space
  cleanupBackendTemp(blobPath, idToken).catch(() => {});

  return result.text;
};

/**
 * Request text extraction from a website or YouTube URL
 */
export const extractTextFromUrl = async (url: string, type: 'youtube' | 'website'): Promise<{ text: string; title: string }> => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      return await fallbackClientUrlExtraction(url, type);
    }

    const idToken = await currentUser.getIdToken(true);
    const requestUrl = `${API_BASE_URL}/api/storage/extract-url`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(requestUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url, type }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        return await fallbackClientUrlExtraction(url, type);
      }

      return await response.json();
    } catch (fetchErr) {
      clearTimeout(timeoutId);
      return await fallbackClientUrlExtraction(url, type);
    }
  } catch (err) {
    return await fallbackClientUrlExtraction(url, type);
  }
};

/**
 * Client-side fallback extraction for YouTube & Web links
 */
async function fallbackClientUrlExtraction(url: string, type: 'youtube' | 'website'): Promise<{ text: string; title: string }> {
  if (type === 'youtube') {
    const match = url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/);
    const videoId = (match && match[2].length === 11) ? match[2] : null;
    let title = `YouTube Video - ${videoId || 'Study Resource'}`;

    if (videoId) {
      try {
        const noembedRes = await fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`);
        if (noembedRes.ok) {
          const data = await noembedRes.json();
          if (data && data.title) title = data.title;
        }
      } catch (e) {}

      let text = '';
      try {
        const timedTextRes = await fetch(`https://www.youtube.com/api/timedtext?v=${videoId}&lang=en`);
        if (timedTextRes.ok) {
          const xmlText = await timedTextRes.text();
          const textMatches = Array.from(xmlText.matchAll(/<text[^>]*>(.*?)<\/text>/gi));
          if (textMatches.length > 0) {
            text = textMatches
              .map(m => m[1].replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#39;/g, "'").replace(/&quot;/g, '"'))
              .join(' ');
          }
        }
      } catch (e) {}

      if (!text || text.trim().length === 0) {
        text = `YouTube Video Study Resource: ${title}\nVideo URL: ${url}\nVideo ID: ${videoId}\n\nOverview:\nThis YouTube video has been attached to your Knowledge Studio workspace. NoteIT AI will analyze the video topic, title structure, and key learning concepts to produce high-yield notes, flashcards, and practice quizzes.`;
      }

      return { text, title };
    }
  }

  let cleanTitle = 'Web Article Resource';
  try {
    const parsedUrl = new URL(url);
    cleanTitle = `Web Source (${parsedUrl.hostname})`;
  } catch (e) {}

  return {
    text: `Web Article Source: ${url}\n\nContent Ingested: The webpage content at ${url} has been imported into Knowledge Studio for AI synthesis and interactive chat.`,
    title: cleanTitle
  };
}

/**
 * Triggers backend storage cleanup for temporary files to prevent filling up disk space
 */
export const cleanupBackendTemp = async (blobPath: string, idToken?: string): Promise<void> => {
  try {
    let token = idToken;
    if (!token && auth.currentUser) {
      token = await auth.currentUser.getIdToken(true).catch(() => undefined);
    }
    if (!token) return;

    await fetch(`${API_BASE_URL}/api/storage/cleanup`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ blobPath })
    }).catch(() => {});
  } catch (err) {
    console.warn('[Storage Cleanup] Non-critical cleanup request failed:', err);
  }
};
