# RentEasy Bhiwandi — Node.js / Express / MongoDB Backend

A full-stack rental property listing platform for Bhiwandi built with Node.js, Express, and MongoDB.

---

## Project Structure

```
renteasy-bhiwandi/
├── models/
│   ├── User.js           # Mongoose User model (name, email, password, role)
│   └── Property.js       # Mongoose Property model (all fields)
├── routes/
│   ├── auth.js           # Register, Login, Me routes
│   └── properties.js     # CRUD + filter routes for properties
├── middleware/
│   ├── auth.js           # JWT protect + role-based restrictTo middleware
│   └── upload.js         # Multer config for image upload (max 5, 5MB each)
├── public/
│   └── uploads/          # Uploaded property images stored here
├── views/                # Reserved for future server-rendered templates
├── server.js             # Entry point — Express app + MongoDB connection
├── .env.example          # Environment variable template
├── package.json
└── README.md
```

---

## Prerequisites

- Node.js >= 18.x
- MongoDB running locally (Community Edition)

### Install MongoDB (if not installed)

**Windows:** Download from https://www.mongodb.com/try/download/community  
**macOS:** `brew tap mongodb/brew && brew install mongodb-community`  
**Ubuntu/Debian:** Follow https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-ubuntu/

---

## Setup & Run

### Step 1 — Install dependencies

```bash
npm install
```

### Step 2 — Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` and set:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/renteasy
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRES_IN=7d
```

### Step 3 — Start MongoDB

**Windows (as a service):** MongoDB starts automatically after install.  
**macOS:** `brew services start mongodb-community`  
**Ubuntu:** `sudo systemctl start mongod`

Verify it's running:
```bash
mongosh --eval "db.runCommand({ connectionStatus: 1 })"
```

### Step 4 — Start the server

```bash
# Production
npm start

# Development (with auto-restart on file changes)
npm run dev
```

Server starts at: **http://localhost:5000**

---

## API Reference

### Authentication

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register a new user | Public |
| POST | `/api/auth/login` | Login and get JWT token | Public |
| GET | `/api/auth/me` | Get current user info | Private |

#### Register

```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "Rahul Sharma",
  "email": "rahul@example.com",
  "password": "password123",
  "role": "owner"
}
```

Response:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { "id": "...", "name": "Rahul Sharma", "email": "rahul@example.com", "role": "owner" }
}
```

#### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "rahul@example.com",
  "password": "password123"
}
```

---

### Properties

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/properties` | List all available properties (with filters) | Public |
| GET | `/api/properties/count` | Total available property count | Public |
| GET | `/api/properties/my` | Owner's own listings | Private (owner) |
| GET | `/api/properties/:id` | Get single property | Public |
| POST | `/api/properties` | Create new listing (with images) | Private (owner) |
| DELETE | `/api/properties/:id` | Delete listing | Private (owner, must own it) |

#### Search & Filter (GET /api/properties)

Query params:
- `area` — filter by area (partial, case-insensitive) e.g. `?area=Anjur`
- `minRent` — minimum rent e.g. `?minRent=5000`
- `maxRent` — maximum rent e.g. `?maxRent=15000`
- `bhkType` — filter by BHK type e.g. `?bhkType=2BHK`
- `bestFor` — filter by suitability e.g. `?bestFor=Families`

Combined: `/api/properties?area=Anjur&minRent=5000&maxRent=12000`

#### Create Property (multipart/form-data)

```http
POST /api/properties
Authorization: Bearer <token>
Content-Type: multipart/form-data

title: Spacious 2BHK Near Highway
rent: 8000
deposit: 16000
area: Anjur, Bhiwandi
bhkType: 2BHK
landmark: Near Anjur Phata
description: Well-maintained apartment with parking
contactNumber: 9876543210
bestFor: Families
images: [file1.jpg, file2.jpg]  (up to 5 images, max 5MB each)
```

Uploaded images are saved to `public/uploads/` and filenames are stored in the database.  
Access images at: `http://localhost:5000/public/uploads/<filename>`

---

## Security Features

- Passwords hashed with bcrypt (12 salt rounds)
- JWT tokens for stateless authentication
- Role-based authorization (owner vs renter)
- Duplicate email prevention with MongoDB unique index
- Input validation on all routes with express-validator
- Only property owner can delete their own listings
- File type and size validation on image uploads

---

## Data Models

### User
| Field | Type | Notes |
|-------|------|-------|
| name | String | required, 2-50 chars |
| email | String | required, unique |
| password | String | hashed, not returned in queries |
| role | String | "owner" or "renter" |
| createdAt | Date | auto |

### Property
| Field | Type | Notes |
|-------|------|-------|
| ownerId | ObjectId | ref: User |
| title | String | required, 5-100 chars |
| rent | Number | required |
| deposit | Number | optional |
| area | String | required |
| bhkType | String | enum: 1BHK, 2BHK, 3BHK, 4BHK, Studio, PG Room, Other |
| landmark | String | optional |
| description | String | max 1000 chars |
| images | [String] | filenames, max 5 |
| contactNumber | String | 10-digit |
| bestFor | String | enum: Families, Students, Working Professionals, Bachelors, Any |
| available | Boolean | default: true |
| createdAt | Date | auto |
