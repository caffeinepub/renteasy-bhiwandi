import { useQuery } from "@tanstack/react-query";
import { loadConfig } from "../config";
import { getBlobUrlSync } from "../utils/getBlobUrl";

export function useStorageConfig() {
  const { data } = useQuery({
    queryKey: ["storageConfig"],
    queryFn: async () => {
      const config = await loadConfig();
      return {
        storageGatewayUrl: config.storage_gateway_url,
        backendCanisterId: config.backend_canister_id,
        projectId: config.project_id,
      };
    },
    staleTime: Infinity,
  });

  const getImageUrl = (blobId: string): string => {
    if (!data || !blobId) return "https://placehold.co/600x400?text=No+Image";
    return getBlobUrlSync(
      blobId,
      data.storageGatewayUrl,
      data.backendCanisterId,
      data.projectId
    );
  };

  return { getImageUrl, storageConfig: data };
}
