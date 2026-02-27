# RentEasy Bhiwandi

A full-stack rental property platform for Bhiwandi, built on React + TypeScript (frontend) and Firebase (Auth, Firestore) as the backend.

---

## Getting Started

The app is deployed and accessible via the Caffeine platform. All Firebase credentials are configured in `src/frontend/src/firebase/firebaseConfig.ts`.

### Firebase Console Setup

1. Enable **Authentication → Sign-in method → Email/Password**
2. Enable **Firestore Database** (start in production or test mode)
3. Apply the security rules below to Firestore

---

## Features

- **Email/Password Authentication** with email verification (users must verify before logging in)
- **Role-based access** — Owner and Renter roles, stored in Firestore
- **Property listings** — Add, Edit, Delete (owners only), Browse (everyone)
- **Search & filter** — by area, minimum rent, maximum rent
- **Owner Dashboard** — analytics section with per-area breakdowns, average rent, property count
- **Contact Owner** — Call and WhatsApp buttons on property detail pages

---

## Security Architecture

### Firestore Security Rules

Recommended Firestore rules for production:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Users collection — only the owning user can write their profile
    match /users/{userId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null
                    && request.auth.uid == request.resource.data.uid;
      allow update, delete: if request.auth != null
                            && request.auth.uid == resource.data.uid;
    }

    // Properties collection
    match /properties/{propertyId} {
      // Any authenticated user can read listings
      allow read: if true;

      // Only authenticated owners can create a property
      allow create: if request.auth != null
                    && request.resource.data.ownerId == request.auth.uid;

      // Only the original owner can update or delete their property
      allow update, delete: if request.auth != null
                            && resource.data.ownerId == request.auth.uid;
    }
  }
}
```

**Key principles:**
- The `users` collection is write-protected by `uid` match, preventing one user from overwriting another's profile.
- The `properties` collection allows public reads (unauthenticated browsing), but all writes are gated behind Firebase Auth.
- `update` and `delete` on properties check `resource.data.ownerId == request.auth.uid`, so even a valid logged-in user cannot modify another owner's listing.

---

### Role-Based Logic

Roles (`owner` / `renter`) are stored as a field in the Firestore `users` collection when a user registers:

```
users/{uid}:
  uid: string
  name: string
  email: string
  role: "owner" | "renter"
  createdAt: ISO string
```

The role is loaded into the `FirebaseAuthProvider` context (`userProfile.role`) via `getUserProfile(uid)` on every auth state change.

**UI enforcement:**
- The **Owner Dashboard** route (`/dashboard`) is only shown in the navigation when `userProfile.role === "owner"`.
- The **Add Property** and **Edit Property** buttons are only rendered when the logged-in user is the owner.
- The **Delete** button compares `property.ownerId === currentUser.uid` before calling `deleteProperty`.

> Note: UI-only role checks are a usability guard. True security is enforced by Firestore rules (see above), which prevent unauthorized writes at the database level regardless of client-side logic.

---

### Auth State Management

Authentication state is managed centrally by `FirebaseAuthProvider` in `src/frontend/src/hooks/useFirebaseAuth.tsx`.

**How it works:**

1. `onAuthStateChanged` (Firebase SDK) fires whenever the auth state changes (login, logout, token refresh, page reload).
2. On every auth change, if a user is present, `getUserProfile(user.uid)` fetches the Firestore user document to load `name`, `role`, and other metadata into context.
3. The context exposes `currentUser` (Firebase `User` object), `userProfile` (Firestore data), and `loading` (true while initializing).
4. All pages that need auth state consume the context via the `useFirebaseAuth()` hook.

**Email verification flow:**
- On registration, `sendEmailVerification()` is called immediately after account creation.
- On login, if `user.emailVerified === false`, the user is signed out and an `"email-not-verified"` error is thrown, which the Login page displays as: *"Please verify your email before logging in."*

---

### Why Serverless Architecture

RentEasy Bhiwandi uses Firebase (serverless) instead of a traditional Node.js/Express server for these reasons:

1. **No server maintenance** — Firebase manages infrastructure, scaling, uptime, and security patches automatically. There is no server process to restart or monitor.

2. **Instant scaling** — Firestore and Firebase Auth scale horizontally without configuration. A sudden spike in traffic (e.g., viral listing) is handled transparently.

3. **Built-in security** — Firebase Auth handles password hashing, token generation, refresh cycles, and brute-force protection out of the box. Firestore rules enforce data access without custom middleware.

4. **Cost-effective** — The Firebase free tier (Spark plan) is sufficient for small-to-medium apps. Costs scale with actual usage rather than requiring a always-on server.

5. **Faster development** — No need to write and maintain REST API endpoints for CRUD operations — Firestore's SDK provides direct, real-time database access from the frontend with strong TypeScript support.

6. **Focus on product** — With infrastructure concerns handled by Firebase, the development team can focus entirely on features and user experience.

---

## Project Structure

```
src/frontend/src/
├── firebase/
│   ├── firebaseConfig.ts      # Firebase app initialization & config
│   ├── firebaseAuth.ts        # Auth functions (register, login, logout, email verification)
│   ├── firestoreService.ts    # Firestore CRUD (users, properties, updateProperty)
│   └── storageService.ts      # (unused — Storage removed in favor of imageUrl)
├── hooks/
│   └── useFirebaseAuth.tsx    # FirebaseAuthProvider + useFirebaseAuth context hook
├── components/
│   ├── AddPropertyModal.tsx   # Modal form to create a new property listing
│   ├── EditPropertyModal.tsx  # Modal form to edit an existing property (owner only)
│   └── ui/                    # shadcn/ui components (auto-generated, read-only)
├── pages/
│   ├── HomePage.tsx           # Browse listings with search/filter
│   ├── PropertyDetailPage.tsx # Full property details + Contact Owner buttons
│   ├── DashboardPage.tsx      # Owner dashboard with analytics + property management
│   ├── LoginPage.tsx          # Email/password login with verification error handling
│   └── RegisterPage.tsx       # Registration form + email verification sent screen
└── App.tsx                    # Router setup + providers
```

---

## Environment

Firebase configuration is embedded in `firebaseConfig.ts`. For a new environment, replace the `firebaseConfig` object with your own project's credentials from the Firebase Console (Project Settings → Your apps → SDK setup).
