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
export interface PropertyListing {
    id: bigint;
    title: string;
    propertyType: PropertyType;
    imageBlobIds: Array<string>;
    bedrooms: bigint;
    owner: Principal;
    createdAt: Time;
    ownerPhone: string;
    description: string;
    amenities: Array<string>;
    available: boolean;
    address: string;
    monthlyRent: bigint;
    bathrooms: bigint;
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
    createPropertyListing(title: string, description: string, address: string, ownerPhone: string, monthlyRent: bigint, propertyType: PropertyType, bedrooms: bigint, bathrooms: bigint, amenities: Array<string>, imageBlobIds: Array<string>): Promise<bigint>;
    deletePropertyListing(id: bigint): Promise<void>;
    getAllAvailableListings(): Promise<Array<PropertyListing>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getListingById(id: bigint): Promise<PropertyListing | null>;
    getTotalListingsCount(): Promise<bigint>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    searchListingsByMaxRent(maxRent: bigint): Promise<Array<PropertyListing>>;
    searchListingsByType(propertyType: PropertyType): Promise<Array<PropertyListing>>;
    searchListingsByTypeAndMaxRent(propertyType: PropertyType, maxRent: bigint): Promise<Array<PropertyListing>>;
}
