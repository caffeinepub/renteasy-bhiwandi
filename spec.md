# RentEasy Bhiwandi

## Current State

Full-stack Firebase-integrated rental app. Frontend: React + TypeScript + TailwindCSS. Backend: Motoko (IC). Firebase Auth (email/password), Firestore (users + properties collections), Firebase Storage removed (imageUrl string field only).

Key files:
- `src/firebase/firebaseConfig.ts` — Firebase init with real credentials
- `src/firebase/firebaseAuth.ts` — register, login, logout, subscribeToAuthState
- `src/firebase/firestoreService.ts` — addProperty, getAllProperties, getPropertyById, getPropertiesByOwner, deleteProperty, searchProperties, createUserProfile, getUserProfile
- `src/hooks/useFirebaseAuth.tsx` — context with currentUser, userProfile, loginWithEmail, registerWithEmail, logout
- `src/components/AddPropertyModal.tsx` — add property form with basic validation
- `src/pages/DashboardPage.tsx` — owner dashboard with stats cards (total listings, available count, total rent potential)
- `src/pages/LoginPage.tsx` — email/password login
- `src/pages/RegisterPage.tsx` — register with role selection (owner/renter)
- `src/pages/BrowsePage.tsx` — property listing with area/rent filter
- `src/pages/PropertyDetailPage.tsx` — property detail with Call/WhatsApp buttons

## Requested Changes (Diff)

### Add
1. **Edit Property Modal** (`src/components/EditPropertyModal.tsx`): New modal component that pre-fills all property fields (title, rent, deposit, area, bhkType, landmark, description, bestFor, contactNumber, imageUrl). Calls `updateProperty()` Firestore function. Only shown to the property owner.
2. **updateProperty function** in `firestoreService.ts`: Uses `updateDoc` with the property's Firestore doc ID.
3. **Dashboard Analytics Section** in `DashboardPage.tsx`: Below existing stats cards, add an "Analytics" section showing: (a) overall average rent, (b) table/blocks of properties grouped by area with count and average rent per area, (c) simple visual bar representation (CSS width % bars, no chart library).
4. **Email Verification** in `firebaseAuth.ts`: After `createUserWithEmailAndPassword`, call `sendEmailVerification(cred.user)`. In `loginUser`, after sign-in check `user.emailVerified` — if false, call `signOut`, throw error with message "email-not-verified".
5. **Enhanced Form Validation** in `AddPropertyModal.tsx` and `EditPropertyModal.tsx`: Validate rent (numeric, positive), deposit (numeric, non-negative), area (required, min 3 chars), contactNumber (required, 10 digits), imageUrl (valid URL format if provided). Show inline red error messages.
6. **README.md**: Create/update with security documentation section covering Firestore rules, role-based logic, auth state management, serverless architecture rationale.

### Modify
1. **`firestoreService.ts`**: Add `updateProperty(id: string, data: Partial<PropertyData>): Promise<void>` using `updateDoc`.
2. **`DashboardPage.tsx`**: Add Edit button alongside each property's Delete/View buttons. Add analytics section between stats cards and the properties list. Wire Edit button to open `EditPropertyModal` with the selected property.
3. **`RegisterPage.tsx`**: After successful registration, do NOT navigate immediately. Show a success state: "Verification email sent! Please check your inbox and verify your email before logging in." Show a "Go to Login" link. Do not auto-navigate to dashboard.
4. **`LoginPage.tsx`**: Handle `email-not-verified` error code — display: "Please verify your email before logging in."
5. **`AddPropertyModal.tsx`**: Strengthen existing validation — add area required check (currently maps `address` to `area`), make contactNumber required with 10-digit validation, add URL format check for imageUrl if provided.

### Remove
- Nothing removed. All existing functionality preserved.

## Implementation Plan

1. **`firestoreService.ts`**: Import `updateDoc` from firebase/firestore. Add `updateProperty(id, data)` function.
2. **`firebaseAuth.ts`**: Import `sendEmailVerification` and `signOut`. In `registerUser`, after creating account call `sendEmailVerification`. In `loginUser`, after sign-in check `cred.user.emailVerified`; if false, `await signOut(auth)` then throw `new Error("email-not-verified")`.
3. **`EditPropertyModal.tsx`**: New component accepting `property: PropertyData` and `onClose: () => void`. Pre-fill form state from property. On submit call `updateProperty`. Include full validation matching AddPropertyModal but with area and contactNumber required.
4. **`AddPropertyModal.tsx`**: Tighten validation — area (address) required min 3 chars, contactNumber required 10 digits, imageUrl URL format check (if non-empty).
5. **`DashboardPage.tsx`**: Import `EditPropertyModal`. Add `editProperty: PropertyData | null` state and `editModalOpen` state. Add Edit button per property row. After stats cards, add `<AnalyticsSection properties={myProperties} />` inline or as a sub-component that computes: overall avg rent, group by area (count + avg rent), CSS bar chart.
6. **`RegisterPage.tsx`**: After successful `registerWithEmail`, set a local `verificationSent` state to true. Show verification pending UI instead of navigating.
7. **`LoginPage.tsx`**: In catch block, check for `email-not-verified` in error message, show specific message.
8. **`README.md`**: Add security documentation section.
