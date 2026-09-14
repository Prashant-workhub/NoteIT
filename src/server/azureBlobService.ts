import { 
  BlobServiceClient, 
  StorageSharedKeyCredential, 
  generateBlobSASQueryParameters, 
  BlobSASPermissions 
} from '@azure/storage-blob';
import dotenv from 'dotenv';

dotenv.config();

function cleanEnvVar(val: string | undefined): string {
  if (!val) return '';
  let cleaned = val.trim();
  if ((cleaned.startsWith('"') && cleaned.endsWith('"')) || (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
    cleaned = cleaned.slice(1, -1).trim();
  }
  return cleaned;
}

export function getAzureConfig() {
  const containerName = cleanEnvVar(
    process.env.AZURE_STORAGE_CONTAINER_NAME || 
    process.env.AZURE_CONTAINER_NAME || 
    process.env.AZURE_BLOB_CONTAINER_NAME
  ) || 'noteit-transcripts';

  const connectionString = cleanEnvVar(
    process.env.AZURE_STORAGE_CONNECTION_STRING || 
    process.env.AZURE_CONNECTION_STRING || 
    process.env.AZURE_BLOB_CONNECTION_STRING ||
    process.env.AZURE_STORAGE_CONNECTION_STR
  );

  const accountName = cleanEnvVar(
    process.env.AZURE_STORAGE_ACCOUNT_NAME || 
    process.env.AZURE_ACCOUNT_NAME || 
    process.env.AZURE_BLOB_ACCOUNT_NAME
  );

  const accountKey = cleanEnvVar(
    process.env.AZURE_STORAGE_ACCOUNT_KEY || 
    process.env.AZURE_ACCOUNT_KEY || 
    process.env.AZURE_BLOB_ACCOUNT_KEY
  );

  return {
    containerName,
    connectionString,
    accountName,
    accountKey
  };
}

let cachedClient: BlobServiceClient | null = null;
let lastConnectionStringHash = '';

export function isAzureBlobConfigured(): boolean {
  const { connectionString, accountName, accountKey } = getAzureConfig();
  return Boolean(connectionString || (accountName && accountKey));
}

function getServiceClient(): BlobServiceClient | null {
  if (!isAzureBlobConfigured()) return null;

  const { connectionString, accountName, accountKey } = getAzureConfig();
  const currentHash = `${connectionString}:${accountName}:${accountKey}`;

  if (cachedClient && lastConnectionStringHash === currentHash) {
    return cachedClient;
  }

  try {
    if (connectionString) {
      cachedClient = BlobServiceClient.fromConnectionString(connectionString);
    } else if (accountName && accountKey) {
      const credential = new StorageSharedKeyCredential(accountName, accountKey);
      cachedClient = new BlobServiceClient(
        `https://${accountName}.blob.core.windows.net`,
        credential
      );
    }
    lastConnectionStringHash = currentHash;
    return cachedClient;
  } catch (err: any) {
    console.warn('[AzureBlobService] Initialization failed:', err?.message || err);
    cachedClient = null;
    return null;
  }
}

async function getContainerClient() {
  const client = getServiceClient();
  if (!client) return null;
  const { containerName } = getAzureConfig();
  const containerClient = client.getContainerClient(containerName);
  try {
    // Create container without explicit access control so private container creation
    // succeeds on modern Azure accounts where Public Blob Access is disabled.
    await containerClient.createIfNotExists();
  } catch (e: any) {
    console.warn(`[AzureBlobService] Note on container '${containerName}':`, e?.message || e);
  }
  return containerClient;
}

/**
 * Diagnostic test for Azure Blob Storage connection status.
 */
export async function getAzureBlobStatusDetails(): Promise<{
  configured: boolean;
  connected: boolean;
  container: string;
  error?: string;
}> {
  const { containerName } = getAzureConfig();
  const configured = isAzureBlobConfigured();
  if (!configured) {
    return {
      configured: false,
      connected: false,
      container: containerName,
      error: 'Azure environment variables (AZURE_STORAGE_CONNECTION_STRING or AZURE_STORAGE_ACCOUNT_NAME + KEY) are not set.'
    };
  }

  try {
    const container = await getContainerClient();
    if (!container) {
      return {
        configured: true,
        connected: false,
        container: containerName,
        error: 'Failed to obtain container client.'
      };
    }

    const exists = await container.exists();
    return {
      configured: true,
      connected: exists,
      container: containerName,
      error: exists ? undefined : 'Container does not exist and auto-creation was skipped.'
    };
  } catch (err: any) {
    return {
      configured: true,
      connected: false,
      container: containerName,
      error: err?.message || String(err)
    };
  }
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
    throw new Error('Azure Blob Storage is not configured or client initialization failed.');
  }

  const blobPath = `users/${userId}/transcripts/${lectureId}.json`;
  const blockBlobClient = container.getBlockBlobClient(blobPath);
  
  const { notes, notesMarkdown, academicNotes, ...cleanData } = transcriptData as any;

  const content = JSON.stringify({
    userId,
    lectureId,
    timestamp: new Date().toISOString(),
    ...cleanData
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
    throw new Error('Azure Blob Storage is not configured or client initialization failed.');
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
    throw new Error('Azure Blob Storage is not configured or client initialization failed.');
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

    const { accountName, accountKey, containerName } = getAzureConfig();
    const blobPath = `users/${userId}/blobs/${fileName}`;
    const blockBlobClient = container.getBlockBlobClient(blobPath);

    let sasUrl = blockBlobClient.url;

    if (accountName && accountKey) {
      const credential = new StorageSharedKeyCredential(accountName, accountKey);
      const sasOptions = {
        containerName: containerName,
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
