# Backend Google OAuth Setup

This backend implements a server-side OAuth 2.0 flow for Google authentication.

## Features

- ✅ **Secure**: Client Secret never exposed to frontend
- ✅ **Simple**: Frontend just redirects to backend
- ✅ **Standard**: Uses OAuth 2.0 authorization code flow
- ✅ **JWT**: Returns JWT token for session management

## Setup

### 1. Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create/select project → **APIs & Services** → **Credentials**
3. Click **+ CREATE CREDENTIALS** → **OAuth 2.0 Client ID**
4. Configure OAuth consent screen:
   - Scopes: `openid`, `email`, `profile`
5. Create **Web application** credentials:
   - Authorized JavaScript origins:
     - `http://localhost:3000`
     - `https://gym-backend-two-bay.vercel.app`
   - Authorized redirect URIs:
     - `http://localhost:3000/api/auth/google/callback`
     - `https://gym-backend-two-bay.vercel.app/api/auth/google/callback`

### 2. Environment Variables

Create `.env` file:

```env
# Database
DATABASE_URL=postgresql://user:pass@host/db

# JWT Secret
NEXTAUTH_SECRET=your-random-secret-key-here

# Google OAuth
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback
```

### 3. Deploy to Vercel

Add environment variables in Vercel dashboard, including:
- `GOOGLE_REDIRECT_URI=https://gym-backend-two-bay.vercel.app/api/auth/google/callback`

## API Endpoints

### Initiate Google Sign-In

```
GET /api/auth/google/login?redirect=<frontend-url>
```

**Parameters:**
- `redirect` (optional): Frontend URL to redirect back to after authentication

**Response:**
- Redirects to Google OAuth consent screen

---

### OAuth Callback

```
GET /api/auth/google/callback?code=<code>&state=<state>
```

**Parameters:**
- `code`: OAuth authorization code from Google
- `state`: Original redirect URL (frontend)

**Response:**
- Redirects to frontend with:
  - `?token=<jwt>` - JWT authentication token
  - `&user=<json>` - User data as JSON string

**Error Response:**
- `?error=<error>&message=<message>`

## Flow Diagram

```
┌─────────┐         ┌─────────┐         ┌─────────┐         ┌─────────┐
│ Flutter │         │ Backend │         │ Google  │         │Database │
│   App   │         │   API   │         │  OAuth  │         │         │
└────┬────┘         └────┬────┘         └────┬────┘         └────┬────┘
     │                   │                   │                   │
     │ 1. Click Sign In  │                   │                   │
     ├──────────────────>│                   │                   │
     │                   │                   │                   │
     │ 2. Redirect to    │                   │                   │
     │    /auth/google/login                 │                   │
     │<──────────────────┤                   │                   │
     │                   │                   │                   │
     │ 3. Redirect to Google                 │                   │
     │───────────────────────────────────────>│                   │
     │                   │                   │                   │
     │ 4. User Authorizes│                   │                   │
     │<──────────────────────────────────────┤                   │
     │                   │                   │                   │
     │ 5. Callback with code                 │                   │
     │───────────────────────────────────────>│                   │
     │                   │                   │                   │
     │                   │ 6. Exchange code  │                   │
     │                   │    for token      │                   │
     │                   ├──────────────────>│                   │
     │                   │<──────────────────┤                   │
     │                   │                   │                   │
     │                   │ 7. Get user info  │                   │
     │                   ├──────────────────>│                   │
     │                   │<──────────────────┤                   │
     │                   │                   │                   │
     │                   │ 8. Create/update user                 │
     │                   ├──────────────────────────────────────>│
     │                   │<──────────────────────────────────────┤
     │                   │                   │                   │
     │ 9. Redirect with JWT token            │                   │
     │<──────────────────┤                   │                   │
     │                   │                   │                   │
     │ 10. Save token & login                │                   │
     │                   │                   │                   │
```

## Testing

### Local Testing

```bash
# Start backend
npm run dev

# Test OAuth flow
curl http://localhost:3000/api/auth/google/login?redirect=http://localhost:54321
```

### Production Testing

1. Deploy backend to Vercel
2. Update environment variables
3. Test with production URLs

## Security Notes

- ✅ Client Secret stays on server (never exposed)
- ✅ State parameter prevents CSRF attacks
- ✅ JWT tokens expire in 7 days
- ✅ HTTPS required in production
- ⚠️ Set `requireEmailVerification: true` for production
