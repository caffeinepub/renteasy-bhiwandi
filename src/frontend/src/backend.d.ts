import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Time = bigint;
export interface ExtendedPropertyListing {
    id: bigint;
    title: string;
    propertyType: PropertyType;
    imageBlobIds: Array<string>;
    bedrooms: bigint;
    owner: Principal;
    createdAt: Time;
    ownerPhone: string;
    bhkType?: string;
    description: string;
    deposit?: bigint;
    amenities: Array<string>;
    available: boolean;
    address: string;
    landmark?: string;
    monthlyRent: bigint;
    bathrooms: bigint;
    bestFor?: string;
}
export interface UserProfile {
    name: string;
}
export enum PropertyType {
    pg = "pg",
    house = "house",
    room = "room",
    apartment = "apartment"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createPropertyListing(title: string, description: string, address: string, ownerPhone: string, monthlyRent: bigint, propertyType: PropertyType, bedrooms: bigint, bathrooms: bigint, amenities: Array<string>, imageBlobIds: Array<string>, deposit: bigint | null, bhkType: string | null, landmark: string | null, bestFor: string | null): Promise<bigint>;
    deletePropertyListing(id: bigint): Promise<void>;
    getAllAvailableListings(): Promise<Array<ExtendedPropertyListing>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getListingById(id: bigint): Promise<ExtendedPropertyListing | null>;
    getTotalListingsCount(): Promise<bigint>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    searchListingsAdvanced(area: string, minRent: bigint, maxRent: bigint, propertyType: PropertyType | null): Promise<Array<ExtendedPropertyListing>>;
    searchListingsByArea(area: string): Promise<Array<ExtendedPropertyListing>>;
    searchListingsByMaxRent(maxRent: bigint): Promise<Array<ExtendedPropertyListing>>;
    searchListingsByType(propertyType: PropertyType): Promise<Array<ExtendedPropertyListing>>;
    searchListingsByTypeAndMaxRent(propertyType: PropertyType, maxRent: bigint): Promise<Array<ExtendedPropertyListing>>;
}
