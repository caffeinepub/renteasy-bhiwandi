import type { Principal } from "@icp-sdk/core/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  type ExtendedPropertyListing,
  type PropertyType,
  UserRole,
} from "../backend.d";
import { useActor } from "./useActor";
import { useInternetIdentity } from "./useInternetIdentity";

export function useGetAllListings() {
  const { actor, isFetching } = useActor();
  return useQuery<ExtendedPropertyListing[]>({
    queryKey: ["listings"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllAvailableListings();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetListingById(id: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<ExtendedPropertyListing | null>({
    queryKey: ["listing", id?.toString()],
    queryFn: async () => {
      if (!actor || id === null) return null;
      return actor.getListingById(id);
    },
    enabled: !!actor && !isFetching && id !== null,
  });
}

export function useSearchByMaxRent(maxRent: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<ExtendedPropertyListing[]>({
    queryKey: ["listings", "maxRent", maxRent?.toString()],
    queryFn: async () => {
      if (!actor || maxRent === null) return [];
      return actor.searchListingsByMaxRent(maxRent);
    },
    enabled: !!actor && !isFetching && maxRent !== null,
  });
}

export function useSearchByType(propertyType: PropertyType | null) {
  const { actor, isFetching } = useActor();
  return useQuery<ExtendedPropertyListing[]>({
    queryKey: ["listings", "type", propertyType],
    queryFn: async () => {
      if (!actor || propertyType === null) return [];
      return actor.searchListingsByType(propertyType);
    },
    enabled: !!actor && !isFetching && propertyType !== null,
  });
}

export function useSearchByTypeAndMaxRent(
  propertyType: PropertyType | null,
  maxRent: bigint | null,
) {
  const { actor, isFetching } = useActor();
  return useQuery<ExtendedPropertyListing[]>({
    queryKey: ["listings", "typeAndRent", propertyType, maxRent?.toString()],
    queryFn: async () => {
      if (!actor || propertyType === null || maxRent === null) return [];
      return actor.searchListingsByTypeAndMaxRent(propertyType, maxRent);
    },
    enabled:
      !!actor && !isFetching && propertyType !== null && maxRent !== null,
  });
}

export function useGetCallerRole() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  return useQuery<UserRole>({
    queryKey: ["callerRole", identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor) return UserRole.guest;
      return actor.getCallerUserRole();
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useAssignRoleMutation() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      user,
      role,
    }: {
      user: Principal;
      role: UserRole;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.assignCallerUserRole(user, role);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["callerRole"] });
    },
  });
}

export function useCreateListingMutation() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      title: string;
      description: string;
      address: string;
      ownerPhone: string;
      monthlyRent: bigint;
      propertyType: PropertyType;
      bedrooms: bigint;
      bathrooms: bigint;
      amenities: string[];
      imageBlobIds: string[];
      deposit: bigint | null;
      bhkType: string | null;
      landmark: string | null;
      bestFor: string | null;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.createPropertyListing(
        params.title,
        params.description,
        params.address,
        params.ownerPhone,
        params.monthlyRent,
        params.propertyType,
        params.bedrooms,
        params.bathrooms,
        params.amenities,
        params.imageBlobIds,
        params.deposit,
        params.bhkType,
        params.landmark,
        params.bestFor,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["listings"] });
      queryClient.invalidateQueries({ queryKey: ["totalListingsCount"] });
    },
  });
}

export function useGetTotalListingsCount() {
  const { actor, isFetching } = useActor();
  return useQuery<bigint>({
    queryKey: ["totalListingsCount"],
    queryFn: async () => {
      if (!actor) return BigInt(0);
      return actor.getTotalListingsCount();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useDeleteListingMutation() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Actor not available");
      return actor.deletePropertyListing(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["listings"] });
      queryClient.invalidateQueries({ queryKey: ["totalListingsCount"] });
    },
  });
}
