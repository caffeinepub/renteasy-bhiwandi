import {
  type Unsubscribe,
  type User,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { auth } from "./firebaseConfig";
import { createUserProfile } from "./firestoreService";

export async function registerUser(
  name: string,
  email: string,
  password: string,
  role: "owner" | "renter",
): Promise<User> {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await createUserProfile(cred.user.uid, {
    uid: cred.user.uid,
    name,
    email,
    role,
    createdAt: new Date().toISOString(),
  });
  await sendEmailVerification(cred.user);
  return cred.user;
}

export async function loginUser(
  email: string,
  password: string,
): Promise<User> {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  if (!cred.user.emailVerified) {
    await signOut(auth);
    throw new Error("email-not-verified");
  }
  return cred.user;
}

export async function logoutUser(): Promise<void> {
  await signOut(auth);
}

export function subscribeToAuthState(
  callback: (user: User | null) => void,
): Unsubscribe {
  return onAuthStateChanged(auth, callback);
}
