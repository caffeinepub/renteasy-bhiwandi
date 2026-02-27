# RentEasy Bhiwandi

## Current State
A full-stack property rental app built on Internet Computer (Motoko backend + React frontend). Auth is via Internet Identity (II), data stored in Motoko canisters, images via a custom blob storage canister. The UI has 4 pages (Browse, PropertyDetail, Dashboard, RoleSelection) with a clean card-based design using Tailwind + shadcn components.

Data flow:
- Authentication: `useInternetIdentity` (II/AuthClient)
- Backend calls: `useActor` → Motoko actor via `@dfinity` agents
- Image upload/fetch: `useBlobStorage` + `useStorageConfig` → custom StorageClient
- Queries/mutations: `useQueries.ts` wrapping actor calls in React Query

## Requested Changes (Diff)

### Add
- `src/firebase/firebaseConfig.ts` — Firebase app init (v9 modular SDK), clear setup comment block at top
- `src/firebase/firebaseAuth.ts` — Email/password register, login, logout functions + `onAuthStateChanged` listener wrapper
- `src/firebase/firestoreService.ts` — CRUD for `users` and `properties` Firestore collections; search/filter queries using composite Firestore queries
- `src/firebase/storageService.ts` — Upload up to 5 images to Firebase Storage, get download URLs, delete images by URL when property is deleted
- `src/hooks/useFirebaseAuth.ts` — React context + hook exposing `currentUser`, `userProfile` (name+role from Firestore), `loginWithEmail`, `registerWithEmail`, `logout`, `isLoading`
- `src/pages/LoginPage.tsx` — Email/password login form (reuse existing UI style)
- `src/pages/RegisterPage.tsx` — Register form: name, email, password, role selector (owner/renter)
- Routes `/login` and `/register` in `App.tsx`

### Modify
- `App.tsx` — Replace `useInternetIdentity` auth with `useFirebaseAuth`; replace role/guard logic with Firebase user role; add `/login`, `/register` routes; keep existing page components and routing structure
- `Header.tsx` — Use `useFirebaseAuth` instead of `useInternetIdentity`; show user name from Firestore profile; keep all existing nav and styling
- `BrowsePage.tsx` — Replace `useGetAllListings` / `useGetTotalListingsCount` with Firebase Firestore queries (`getDocs` from `properties` collection); keep all existing UI, filters, and layout
- `PropertyDetailPage.tsx` — Replace `useGetListingById` with Firestore `getDoc`; display Firebase Storage image URLs directly; keep all existing UI
- `DashboardPage.tsx` — Replace `useGetAllListings` / `useDeleteListingMutation` with Firestore queries filtered by `ownerId == currentUser.uid`; delete images from Storage on property delete; keep all existing UI
- `RoleSelectionPage.tsx` — Replace `useAssignRoleMutation` / `useInternetIdentity` with `useFirebaseAuth` register-role flow; save role to Firestore `users` collection
- `AddPropertyModal.tsx` — Replace `useBlobStorage` / `useCreateListingMutation` with Firebase Storage upload + Firestore `addDoc`; keep all existing form UI and validation
- `package.json` (frontend) — Add `firebase` dependency
- `main.tsx` — Wrap app in `FirebaseAuthProvider` instead of `InternetIdentityProvider`

### Remove
- Dependency on `useInternetIdentity` from auth flow (file kept but no longer used as primary auth)
- Dependency on `useActor` / Motoko actor for data operations (file kept, backend still exists)
- Dependency on `useBlobStorage` / `useStorageConfig` for image operations (replaced by Firebase Storage)
- Dependency on `useQueries.ts` hooks that call Motoko actor (replaced by Firebase direct calls)

## Implementation Plan

1. Add `firebase` npm package to frontend `package.json`
2. Create `src/firebase/firebaseConfig.ts` with setup instructions comment block and Firebase app initialization using placeholder config keys (user will replace with their own)
3. Create `src/firebase/firebaseAuth.ts` — `registerUser(name, email, password, role)`, `loginUser(email, password)`, `logoutUser()`, `subscribeToAuthState(callback)` using Firebase Auth v9 modular SDK
4. Create `src/firebase/firestoreService.ts` — `getUserProfile(uid)`, `createUserProfile(uid, data)`, `addProperty(data)`, `getAllProperties()`, `getPropertyById(id)`, `getPropertiesByOwner(uid)`, `deleteProperty(id)`, `searchProperties(area, minRent, maxRent)` using Firestore v9
5. Create `src/firebase/storageService.ts` — `uploadImages(files, uid)` returns array of download URLs, `deleteImageByUrl(url)` removes from Storage
6. Create `src/hooks/useFirebaseAuth.ts` — React context provider + hook with `currentUser`, `userProfile`, `loginWithEmail`, `registerWithEmail`, `logout`, `loading` state
7. Create `src/pages/LoginPage.tsx` — Email/password login form matching existing design
8. Create `src/pages/RegisterPage.tsx` — Register form with name, email, password, role selection matching existing design
9. Update `App.tsx` — Replace II auth logic with `useFirebaseAuth`, add login/register routes, update `DashboardGuard` to use Firebase user role
10. Update `Header.tsx` — Use `useFirebaseAuth` hook
11. Update `BrowsePage.tsx` — Replace all ICP hooks with direct Firebase calls using `useEffect`/`useState`
12. Update `PropertyDetailPage.tsx` — Replace ICP hooks with Firestore `getDoc`
13. Update `DashboardPage.tsx` — Replace ICP hooks with Firebase owner-filtered queries and Storage delete
14. Update `RoleSelectionPage.tsx` — Use `useFirebaseAuth` for role assignment to Firestore
15. Update `AddPropertyModal.tsx` — Replace blob storage with Firebase Storage upload + Firestore `addDoc`
16. Update `main.tsx` — Wrap with `FirebaseAuthProvider`
