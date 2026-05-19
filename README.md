# Medical Chemist Web App

A full-stack web application for medical pharmacy management built with React, Node.js, Express, MongoDB, and Firebase Authentication.

## Features

- ✅ Google Sign-In Authentication with Firebase
- ✅ Medicine Catalog with Search and Filter
- ✅ Admin Dashboard with Statistics
- ✅ Add, Edit, and Delete Medicines
- ✅ Expiry Date Management with Color-Coded Status
- ✅ JWT Token-Based API Security
- ✅ Responsive Design with Tailwind CSS
- ✅ Toast Notifications for User Feedback

## Tech Stack

**Frontend:**
- React.js 18
- Tailwind CSS
- Firebase Auth SDK
- Axios
- React Router

**Backend:**
- Node.js
- Express.js
- MongoDB + Mongoose
- Firebase Admin SDK
- JWT

## Project Structure

```
/medical
├── /server (Backend)
│   ├── /config
│   │   ├── firebaseConfig.js
│   │   └── mongooseConfig.js
│   ├── /models
│   │   ├── Medicine.js
│   │   └── User.js
│   ├── /controllers
│   │   ├── authController.js
│   │   ├── medicineController.js
│   │   └── adminController.js
│   ├── /routes
│   │   ├── authRoutes.js
│   │   ├── medicineRoutes.js
│   │   └── adminRoutes.js
│   ├── /middleware
│   │   ├── authMiddleware.js
│   │   └── adminMiddleware.js
│   ├── server.js
│   ├── package.json
│   └── .env.example
│
└── /client (Frontend)
    ├── /public
    │   └── index.html
    ├── /src
    │   ├── /pages
    │   │   ├── LoginPage.js
    │   │   ├── HomePage.js
    │   │   ├── MedicineDetailPage.js
    │   │   ├── AdminDashboardPage.js
    │   │   ├── AdminMedicinesPage.js
    │   │   ├── AddMedicinePage.js
    │   │   └── EditMedicinePage.js
    │   ├── /components
    │   │   ├── Header.js
    │   │   ├── MedicineCard.js
    │   │   ├── ExpiryBadge.js
    │   │   ├── LoadingSpinner.js
    │   │   ├── ConfirmDialog.js
    │   │   └── ProtectedRoute.js
    │   ├── /context
    │   │   └── AuthContext.js
    │   ├── /services
    │   │   ├── api.js
    │   │   └── apiCalls.js
    │   ├── /utils
    │   │   └── helpers.js
    │   ├── /config
    │   │   └── firebaseConfig.js
    │   ├── App.js
    │   ├── index.js
    │   └── index.css
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── package.json
    └── .env.example
```

## Installation & Setup

### Prerequisites
- Node.js (v14+)
- MongoDB (local or MongoDB Atlas)
- Firebase Project with Google Auth enabled

### Backend Setup

1. **Navigate to server folder:**
   ```bash
   cd server
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create `.env` file from `.env.example`:**
   ```bash
   cp .env.example .env
   ```

4. **Configure `.env` with your values:**
   - `MONGO_URI`: Your MongoDB connection string
   - `JWT_SECRET`: A strong secret key for JWT signing
   - `FIREBASE_PROJECT_ID`: Your Firebase project ID
   - `FIREBASE_CLIENT_EMAIL`: Your Firebase service account email
   - `FIREBASE_PRIVATE_KEY`: Your Firebase private key (replace `\n` with actual newlines)
   - `PORT`: Server port (default: 5000)

5. **Start the backend:**
   ```bash
   npm start
   ```
   Or for development with auto-reload:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. **Navigate to client folder:**
   ```bash
   cd client
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create `.env` file from `.env.example`:**
   ```bash
   cp .env.example .env
   ```

4. **Configure `.env` with your Firebase values:**
   - `REACT_APP_API_URL`: Backend API URL (http://localhost:5000/api)
   - `REACT_APP_FIREBASE_API_KEY`: Your Firebase API Key
   - `REACT_APP_FIREBASE_AUTH_DOMAIN`: Your Firebase Auth Domain
   - `REACT_APP_FIREBASE_PROJECT_ID`: Your Firebase Project ID

5. **Start the frontend:**
   ```bash
   npm start
   ```

## API Documentation

### Authentication
- **POST** `/api/auth/google` - Authenticate with Firebase ID token
  - Body: `{ idToken: string }`
  - Response: `{ token: string, user: object }`

### Medicines (Public)
- **GET** `/api/medicines` - Get all medicines with optional search/filter
  - Query params: `search`, `category`
- **GET** `/api/medicines/:id` - Get single medicine details

### Medicines (Admin Only)
- **POST** `/api/medicines` - Add new medicine
- **PUT** `/api/medicines/:id` - Update medicine
- **DELETE** `/api/medicines/:id` - Delete medicine

### Admin
- **GET** `/api/admin/dashboard/stats` - Get dashboard statistics

## Database Schema

### Medicine Model
```javascript
{
  name: String,
  genericName: String,
  manufacturer: String,
  category: String,
  description: String,
  price: Number,
  stockQuantity: Number,
  expiryDate: Date,
  dateArrivedInShop: Date,
  batchNumber: String,
  requiresPrescription: Boolean,
  imageUrl: String,
  createdAt: Date,
  updatedAt: Date
}
```

### User Model
```javascript
{
  uid: String (Firebase UID),
  email: String,
  displayName: String,
  photoURL: String,
  role: String (customer | admin),
  createdAt: Date,
  updatedAt: Date
}
```

## Key Features Explained

### Expiry Status Logic
- **RED (Expired)**: Expiry date is in the past
- **ORANGE (Expiring Soon)**: Expiry date is within 30 days
- **GREEN (Valid)**: Expiry date is more than 30 days away

### Price Format
All prices are displayed in Indian Rupee (₹) format using locale-specific formatting.

### Date Format
All dates in the UI are formatted as DD/MM/YYYY for consistency.

### JWT Token Flow
1. User logs in with Google
2. Firebase generates an ID token
3. Frontend sends ID token to `/api/auth/google`
4. Backend verifies token and returns JWT
5. JWT is stored in localStorage
6. All subsequent API calls include JWT in Authorization header

## Admin Setup

By default, new users are created with `role: "customer"`. To make a user an admin:

1. **MongoDB Direct Update:**
   ```javascript
   db.users.updateOne(
     { email: "user@example.com" },
     { $set: { role: "admin" } }
   )
   ```

2. **Or set via environment seed (optional - can be implemented)**

## Security Notes

- Never expose Firebase private key in frontend
- Always validate JWT tokens on backend
- Admin routes require both valid JWT and admin role
- Use HTTPS in production
- Store sensitive data in environment variables
- Implement rate limiting in production

## Development

### Adding New Features

1. **New API Route:**
   - Create controller in `/server/controllers`
   - Create route in `/server/routes`
   - Import in `server.js`

2. **New Frontend Page:**
   - Create component in `/client/src/pages`
   - Add route in `App.js`
   - Create components if needed

3. **New API Call:**
   - Add method in `/client/src/services/apiCalls.js`
   - Use in component with useState and useEffect

## Troubleshooting

### MongoDB Connection Error
- Check MONGO_URI format
- Ensure MongoDB is running
- Verify network access on MongoDB Atlas (if using)

### Firebase Auth Error
- Verify Firebase credentials in .env
- Check Firebase Console for Google OAuth configuration
- Ensure redirect URI is configured

### CORS Error
- Verify CORS is enabled in Express (check server.js)
- Check frontend API URL in .env matches backend

### JWT Token Expiration
- Tokens expire after 7 days by default
- User will need to log in again
- Can be changed in `authController.js`

## Deployment

### Backend (Heroku, Railway, Render, etc.)
1. Create an account on your chosen platform
2. Set environment variables
3. Deploy from GitHub repo

### Frontend (Vercel, Netlify, etc.)
1. Build: `npm run build`
2. Deploy build folder
3. Set environment variables in deployment settings

## License

MIT

## Support

For issues and questions, please refer to the documentation or create an issue.
