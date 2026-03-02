# Google OAuth Setup Guide

## Steps to Enable Google Sign-In

### 1. Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable Google+ API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API"
   - Click "Enable"

### 2. Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. Choose "Web application"
4. Add authorized redirect URIs:
   ```
   http://localhost:3000/api/auth/callback/google
   https://gym-backend-two-bay.vercel.app/api/auth/callback/google
   ```
5. Click "Create"
6. Copy the Client ID and Client Secret

### 3. Update Environment Variables

Add to your `.env` file:
```env
GOOGLE_CLIENT_ID=your-client-id-here
GOOGLE_CLIENT_SECRET=your-client-secret-here
```

### 4. Update Vercel Environment Variables

Run the script to sync with Vercel:
```bash
npm run add-env
```

Then redeploy:
```bash
vercel deploy --prod
```

### 5. Test the API

Run the test script:
```bash
npm run test-api
```

## API Endpoints

- `POST /api/auth/register` - Register with email/password
- `POST /api/auth/sign-in` - Sign in with email/password
- `POST /api/auth/google` - Sign in with Google
- `GET /api/auth/verify` - Verify JWT token
- `GET /api/data/profile` - Get user profile (requires auth)

## Testing Google Sign-In

For manual testing with Google OAuth:
1. Use the Google Sign-In button in your frontend
2. Or use Postman/Thunder Client with OAuth 2.0 flow
3. Or use the mock test in `npm run test-api`
