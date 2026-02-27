import { loadConfig } from "../config";

let cachedConfig: {
  storageGatewayUrl: string;
  backendCanisterId: string;
  projectId: string;
} | null = null;

async function getStorageConfig() {
  if (cachedConfig) return cachedConfig;
  const config = await loadConfig();
  cachedConfig = {
    storageGatewayUrl: config.storage_gateway_url,
    backendCanisterId: config.backend_canister_id,
    projectId: config.project_id,
  };
  return cachedConfig;
}

/**
 * Builds a direct blob URL synchronously using cached config.
 * Returns placeholder if blobId is empty or config not loaded yet.
 */
export function getBlobUrlSync(
  blobId: string,
  storageGatewayUrl: string,
  backendCanisterId: string,
  projectId: string,
): string {
  if (!blobId) return "https://placehold.co/600x400?text=No+Image";
  return `${storageGatewayUrl}/v1/blob/?blob_hash=${encodeURIComponent(blobId)}&owner_id=${encodeURIComponent(backendCanisterId)}&project_id=${encodeURIComponent(projectId)}`;
}

export { getStorageConfig };
