# Backend README

## Quick Start

1. Install dependencies:
```bash
npm install
```

2. Copy environment variables:
```bash
cp .env.local.example .env.local
```

3. Update `.env.local` with your Neon database credentials

4. Run development server:
```bash
npm run dev
```

Backend runs on http://localhost:3000

## Database Schema

Run this SQL in your Neon console:

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    name VARCHAR(255),
    google_id VARCHAR(255) UNIQUE,
    photo_url TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_google_id ON users(google_id);
```

## API Endpoints

### Public Routes
- `POST /api/auth/sign-in` - Login
- `POST /api/auth/register` - Register
- `POST /api/auth/google` - Google OAuth
- `GET /api/auth/verify` - Verify token

### Protected Routes (Require JWT)
- `GET /api/data/profile` - User profile

## Security

All `/api/data/*` routes are automatically protected by middleware.
JWT validation happens before any route logic executes.
