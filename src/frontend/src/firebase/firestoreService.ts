import {
  type DocumentData,
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "./firebaseConfig";

export interface UserProfileData {
  uid: string;
  name: string;
  email: string;
  role: "owner" | "renter";
  createdAt: string;
}

export interface PropertyData {
  id?: string;
  title: string;
  rent: number;
  deposit: number;
  area: string;
  bhkType: string;
  landmark: string;
  description: string;
  imageUrl: string;
  contactNumber: string;
  bestFor: string;
  ownerId: string;
  createdAt?: DocumentData;
  propertyType?: string;
  bedrooms?: number;
  bathrooms?: number;
  amenities?: string[];
  address?: string;
  available?: boolean;
}

export async function createUserProfile(
  uid: string,
  data: UserProfileData,
): Promise<void> {
  await addDoc(collection(db, "users"), { ...data, uid });
}

export async function getUserProfile(
  uid: string,
): Promise<UserProfileData | null> {
  const q = query(collection(db, "users"), where("uid", "==", uid));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return snap.docs[0].data() as UserProfileData;
}

export async function addProperty(
  data: Omit<PropertyData, "id" | "createdAt">,
): Promise<string> {
  const ref = await addDoc(collection(db, "properties"), {
    ...data,
    createdAt: serverTimestamp(),
    available: true,
  });
  return ref.id;
}

export async function getAllProperties(): Promise<PropertyData[]> {
  const snap = await getDocs(
    query(collection(db, "properties"), orderBy("createdAt", "desc")),
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as PropertyData);
}

export async function getPropertyById(
  id: string,
): Promise<PropertyData | null> {
  const snap = await getDoc(doc(db, "properties", id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as PropertyData;
}

export async function getPropertiesByOwner(
  ownerId: string,
): Promise<PropertyData[]> {
  const q = query(
    collection(db, "properties"),
    where("ownerId", "==", ownerId),
    orderBy("createdAt", "desc"),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as PropertyData);
}

export async function deleteProperty(id: string): Promise<void> {
  await deleteDoc(doc(db, "properties", id));
}

export async function updateProperty(
  id: string,
  data: Partial<Omit<PropertyData, "id" | "createdAt" | "ownerId">>,
): Promise<void> {
  await updateDoc(doc(db, "properties", id), data);
}

export async function searchProperties(
  area: string,
  minRent: number | null,
  maxRent: number | null,
): Promise<PropertyData[]> {
  // Fetch all and filter client-side (Firestore compound queries require composite indexes)
  const all = await getAllProperties();
  let result = all;
  if (area.trim()) {
    const a = area.trim().toLowerCase();
    result = result.filter(
      (p) =>
        p.area?.toLowerCase().includes(a) ||
        p.address?.toLowerCase().includes(a) ||
        p.landmark?.toLowerCase().includes(a),
    );
  }
  if (minRent !== null) result = result.filter((p) => p.rent >= minRent);
  if (maxRent !== null) result = result.filter((p) => p.rent <= maxRent);
  return result;
}
