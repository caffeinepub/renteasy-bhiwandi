import type { User } from "firebase/auth";
import {
  type ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  loginUser,
  logoutUser,
  registerUser,
  subscribeToAuthState,
} from "../firebase/firebaseAuth";
import {
  type UserProfileData,
  getUserProfile,
} from "../firebase/firestoreService";

interface FirebaseAuthContextType {
  currentUser: User | null;
  userProfile: UserProfileData | null;
  loading: boolean;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (
    name: string,
    email: string,
    password: string,
    role: "owner" | "renter",
  ) => Promise<void>;
  logout: () => Promise<void>;
}

const FirebaseAuthContext = createContext<FirebaseAuthContextType | undefined>(
  undefined,
);

export function FirebaseAuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeToAuthState(async (user) => {
      setCurrentUser(user);
      if (user) {
        const profile = await getUserProfile(user.uid);
        setUserProfile(profile);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const loginWithEmail = async (email: string, password: string) => {
    const user = await loginUser(email, password);
    const profile = await getUserProfile(user.uid);
    setUserProfile(profile);
  };

  const registerWithEmail = async (
    name: string,
    email: string,
    password: string,
    role: "owner" | "renter",
  ) => {
    const user = await registerUser(name, email, password, role);
    const profile = await getUserProfile(user.uid);
    setUserProfile(profile);
  };

  const logout = async () => {
    await logoutUser();
    setCurrentUser(null);
    setUserProfile(null);
  };

  return (
    <FirebaseAuthContext.Provider
      value={{
        currentUser,
        userProfile,
        loading,
        loginWithEmail,
        registerWithEmail,
        logout,
      }}
    >
      {children}
    </FirebaseAuthContext.Provider>
  );
}

export function useFirebaseAuth(): FirebaseAuthContextType {
  const ctx = useContext(FirebaseAuthContext);
  if (!ctx)
    throw new Error("useFirebaseAuth must be used inside FirebaseAuthProvider");
  return ctx;
}
