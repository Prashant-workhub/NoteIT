import { 
  BlobServiceClient, 
  StorageSharedKeyCredential, 
  generateBlobSASQueryParameters, 
  BlobSASPermissions 
} from '@azure/storage-blob';
import dotenv from 'dotenv';

dotenv.config();

const CONTAINER_NAME = process.env.AZURE_STORAGE_CONTAINER_NAME || 'noteit-transcripts';
const CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING || '';
const ACCOUNT_NAME = process.env.AZURE_STORAGE_ACCOUNT_NAME || '';
const ACCOUNT_KEY = process.env.AZURE_STORAGE_ACCOUNT_KEY || '';

let blobServiceClient: BlobServiceClient | null = null;

export function isAzureBlobConfigured(): boolean {
  return Boolean(CONNECTION_STRING || (ACCOUNT_NAME && ACCOUNT_KEY));
}

function getServiceClient(): BlobServiceClient | null {
  if (!isAzureBlobConfigured()) return null;
  if (blobServiceClient) return blobServiceClient;

  try {
    if (CONNECTION_STRING) {
      blobServiceClient = BlobServiceClient.fromConnectionString(CONNECTION_STRING);
    } else if (ACCOUNT_NAME && ACCOUNT_KEY) {
      const credential = new StorageSharedKeyCredential(ACCOUNT_NAME, ACCOUNT_KEY);
      blobServiceClient = new BlobServiceClient(
        `https://${ACCOUNT_NAME}.blob.core.windows.net`,
        credential
      );
    }
    return blobServiceClient;
  } catch (err) {
    console.warn('[AzureBlobService] Initialization failed:', err);
    return null;
  }
}

async function getContainerClient() {
  const client = getServiceClient();
  if (!client) return null;
  const containerClient = client.getContainerClient(CONTAINER_NAME);
  try {
    await containerClient.createIfNotExists({ access: 'blob' });
  } catch (e) {
    // Container creation may fail if permissions are restricted; continue using container client
  }
  return containerClient;
}

/**
 * Uploads transcript content to Azure Blob Storage for a specific user.
 * Path: users/{userId}/transcripts/{lectureId}.json
 */
export async function uploadTranscriptToAzure(
  userId: string,
  lectureId: string,
  transcriptData: {
    cleanTranscript?: string;
    transcript?: string;
    sections?: any[];
    summary?: string;
    updatedAt?: string;
  }
): Promise<{ success: boolean; blobPath: string; blobUrl: string }> {
  const container = await getContainerClient();
  if (!container) {
    throw new Error('Azure Blob Storage is not configured or unavailable.');
  }

  const blobPath = `users/${userId}/transcripts/${lectureId}.json`;
  const blockBlobClient = container.getBlockBlobClient(blobPath);
  
  const content = JSON.stringify({
    userId,
    lectureId,
    timestamp: new Date().toISOString(),
    ...transcriptData
  });

  const uploadOptions = {
    blobHTTPHeaders: { blobContentType: 'application/json' }
  };

  await blockBlobClient.upload(content, Buffer.byteLength(content), uploadOptions);

  return {
    success: true,
    blobPath,
    blobUrl: blockBlobClient.url
  };
}

/**
 * Downloads transcript content from Azure Blob Storage.
 */
export async function downloadTranscriptFromAzure(
  userId: string,
  lectureId: string
): Promise<any> {
  const container = await getContainerClient();
  if (!container) {
    throw new Error('Azure Blob Storage is not configured or unavailable.');
  }

  const blobPath = `users/${userId}/transcripts/${lectureId}.json`;
  const blockBlobClient = container.getBlockBlobClient(blobPath);

  const exists = await blockBlobClient.exists();
  if (!exists) {
    throw new Error(`Transcript blob not found in Azure: ${blobPath}`);
  }

  const downloadResponse = await blockBlobClient.download(0);
  const bodyString = await streamToString(downloadResponse.readableStreamBody);
  return JSON.parse(bodyString);
}

/**
 * Uploads generic binary data (audio recording, document) to Azure Blob Storage for a specific user.
 * Path: users/{userId}/blobs/{fileName}
 */
export async function uploadBinaryBlobToAzure(
  userId: string,
  fileName: string,
  buffer: Buffer,
  contentType: string = 'application/octet-stream'
): Promise<{ success: boolean; blobPath: string; blobUrl: string }> {
  const container = await getContainerClient();
  if (!container) {
    throw new Error('Azure Blob Storage is not configured or unavailable.');
  }

  const blobPath = `users/${userId}/blobs/${fileName}`;
  const blockBlobClient = container.getBlockBlobClient(blobPath);

  await blockBlobClient.upload(buffer, buffer.length, {
    blobHTTPHeaders: { blobContentType: contentType }
  });

  return {
    success: true,
    blobPath,
    blobUrl: blockBlobClient.url
  };
}

/**
 * Generates an Azure Blob SAS Upload URL for direct client uploads.
 */
export async function generateAzureUploadSasUrl(
  userId: string,
  fileName: string
): Promise<{ uploadUrl: string; audioUrl: string; blobPath: string } | null> {
  if (!isAzureBlobConfigured()) return null;

  try {
    const container = await getContainerClient();
    if (!container) return null;

    const blobPath = `users/${userId}/blobs/${fileName}`;
    const blockBlobClient = container.getBlockBlobClient(blobPath);

    let sasUrl = blockBlobClient.url;

    if (ACCOUNT_NAME && ACCOUNT_KEY) {
      const credential = new StorageSharedKeyCredential(ACCOUNT_NAME, ACCOUNT_KEY);
      const sasOptions = {
        containerName: CONTAINER_NAME,
        blobName: blobPath,
        permissions: BlobSASPermissions.parse('cw'), // create, write
        startsOn: new Date(),
        expiresOn: new Date(Date.now() + 3600 * 1000) // 1 hour validity
      };

      const sasToken = generateBlobSASQueryParameters(sasOptions, credential).toString();
      sasUrl = `${blockBlobClient.url}?${sasToken}`;
    }

    return {
      uploadUrl: sasUrl,
      audioUrl: blockBlobClient.url,
      blobPath
    };
  } catch (err) {
    console.warn('[AzureBlobService] SAS URL generation failed:', err);
    return null;
  }
}

/**
 * Helper to convert readable stream to string
 */
async function streamToString(readableStream?: NodeJS.ReadableStream | null): Promise<string> {
  if (!readableStream) return '';
  return new Promise((resolve, reject) => {
    const chunks: any[] = [];
    readableStream.on('data', (data) => {
      chunks.push(data.toString('utf8'));
    });
    readableStream.on('end', () => {
      resolve(chunks.join(''));
    });
    readableStream.on('error', reject);
  });
}
