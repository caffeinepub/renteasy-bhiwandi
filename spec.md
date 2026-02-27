# RentEasy Bhiwandi

## Current State
A fully functional rental property listing app with:
- **Header**: Glass-effect sticky navbar with logo, nav links, role badge, login/logout button, and mobile hamburger menu
- **BrowsePage**: Hero gradient section with search bar, filter bar (type, area, min/max rent), property grid with cards
- **PropertyDetailPage**: Image gallery with thumbnails, property details, amenities, call/WhatsApp contact buttons
- **DashboardPage**: Stats cards (total listings, available, total rent potential), list of owner's properties with view/edit/delete actions
- **RoleSelectionPage**: Two-card layout for Owner vs Renter role selection
- **AddPropertyModal**: Full form dialog with image upload, amenities checkboxes, validation
- **Footer**: Simple branding footer
- **Design system**: OKLCH warm amber/cream palette, Fraunces (display) + DM Sans (body) fonts, hero-gradient utility, glass-effect utility, animate-fade-in-up animations

## Requested Changes (Diff)

### Add
- Richer visual hierarchy on the Hero section -- larger, more impactful heading with better subtitle treatment
- Stats bar in Hero (properties count) made more prominent with an animated counter feel
- Property cards: hover shadow elevation, improved image aspect ratio handling, clearer price display
- Dashboard: section dividers, better stat card design with trend indicators, listing rows with more visual weight
- Navbar: subtle border-bottom gradient line, improved active state indicator (bottom border/pill style)
- Role selection page: decorative background pattern, stronger card hover states, feature bullet lists under each role
- Add Property modal: step-indicator feel, section headers within the form, improved image upload zone (larger drop target)
- Footer: expanded with quick links column and tagline
- Better empty-state illustrations using icon + gradient background circles

### Modify
- BrowsePage filter bar: wrap into a styled card container with subtle bg, improve mobile stacking behavior
- PropertyCard: taller image (h-56 instead of h-48), add a subtle gradient overlay on image bottom, bolder price display
- Header: increase logo presence, add a visual separator between nav and auth section
- DashboardPage: switch listing rows to proper cards with better spacing and image sizing
- RoleSelectionPage: add feature bullet points to each role card (3 bullets each)
- Loading skeleton: ensure skeletons match final card proportions
- Hero: add a trust badge row below the search bar (e.g., "Verified Listings", "No Brokerage", "Instant Contact")

### Remove
- Nothing removed (backend untouched, all features preserved)

## Implementation Plan
1. **index.css**: Add new utility classes: `card-elevated`, `filter-card`, `hero-badge`, `trust-badge`, enhanced `.property-card` hover states with stronger shadow
2. **Header.tsx**: Strengthen logo sizing, add active indicator as bottom border on nav link, add visual divider
3. **BrowsePage.tsx**: Improve hero layout with larger heading, trust badges row, wrap filter section in a styled card, update search bar styling
4. **PropertyCard.tsx**: Increase image height to h-56, add gradient overlay, bolder price font
5. **DashboardPage.tsx**: Convert listing rows to proper cards with larger image thumbnails, improve stat cards with icon backgrounds, add section labels
6. **RoleSelectionPage.tsx**: Add feature bullet lists, improve background decorative elements, stronger CTA buttons
7. **Footer.tsx**: Expand to two-column layout with quick links and tagline
8. **AddPropertyModal.tsx**: Add section separators within form, improve image upload zone to full-width drop target

## UX Notes
- Do NOT change any backend logic, API calls, hooks, or routing
- Maintain all existing functionality (filters, auth, role logic, delete/edit, contact buttons)
- All changes are purely CSS class adjustments and JSX layout improvements
- Preserve all existing animation classes (animate-fade-in-up, stagger-*) 
- Ensure mobile responsiveness on all updated components
- Keep the warm amber/cream color palette -- just make it feel more polished and premium
