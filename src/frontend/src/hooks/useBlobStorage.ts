import { HttpAgent } from "@icp-sdk/core/agent";
import { useCallback, useState } from "react";
import { loadConfig } from "../config";
import { StorageClient } from "../utils/StorageClient";
import { useInternetIdentity } from "./useInternetIdentity";

export function useBlobStorage() {
  const { identity } = useInternetIdentity();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const uploadFile = useCallback(
    async (file: File): Promise<string> => {
      const config = await loadConfig();
      const agent = new HttpAgent({
        identity: identity ?? undefined,
        host: config.backend_host,
      });
      if (config.backend_host?.includes("localhost")) {
        await agent.fetchRootKey().catch(console.warn);
      }
      const storageClient = new StorageClient(
        config.bucket_name,
        config.storage_gateway_url,
        config.backend_canister_id,
        config.project_id,
        agent,
      );

      const bytes = new Uint8Array(await file.arrayBuffer());
      setUploading(true);
      setUploadProgress(0);
      try {
        const { hash } = await storageClient.putFile(bytes, (pct) => {
          setUploadProgress(pct);
        });
        return hash;
      } finally {
        setUploading(false);
      }
    },
    [identity],
  );

  const getBlobUrl = useCallback(
    async (blobId: string): Promise<string> => {
      const config = await loadConfig();
      const agent = new HttpAgent({
        identity: identity ?? undefined,
        host: config.backend_host,
      });
      const storageClient = new StorageClient(
        config.bucket_name,
        config.storage_gateway_url,
        config.backend_canister_id,
        config.project_id,
        agent,
      );
      return storageClient.getDirectURL(blobId);
    },
    [identity],
  );

  return { uploadFile, getBlobUrl, uploading, uploadProgress };
}
