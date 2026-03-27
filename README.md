# Omina - Human Assistance Platform (MERN)

Omina is now a clean MERN full-stack base focused on scalability and modular structure.

## Architecture

- `client/` - React (Vite) frontend
- `server/` - Node.js + Express backend
- `database/` - MongoDB connection module

## Server Structure

```text
server/
	config/
	controllers/
	models/
	routes/
	services/
	utils/
	middleware/
	index.js
```

## Implemented Backend Features

- Express server with JSON + CORS + Morgan
- MongoDB connection using Mongoose
- dotenv config support via `server/config/env.js`
- Global `notFound` and `errorHandler` middleware
- Modular route registration (`/api/v1/health`, `/api/v1/assistance`)
- Assistance request model, service, and controller

## Frontend Features

- React app running on Vite
- Axios API client
- Live API health check
- Assistance request submit form
- Assistance request listing view

## Getting Started

1. Copy env vars:

```bash
cp .env.example .env
```

2. Install dependencies:

```bash
npm install
npm install --prefix server
npm install --prefix client
```

3. Start both apps:

```bash
npm run dev
```

## Default Ports

- Server: `http://localhost:5000`
- Client: `http://localhost:5173`

## API Endpoints

- `GET /api/v1/health`
- `GET /api/v1/assistance`
- `POST /api/v1/assistance`
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me` (Bearer token required)
- `GET /api/v1/admin` (Bearer token required, admin role only)
- `POST /api/v1/ai/decision-engine`
- `POST /api/v1/admin/provider` (admin only)
- `GET /api/v1/admin/providers` (admin only)
- `POST /api/v1/admin/activate` (admin only)

## Auth + Roles

- JWT-based authentication
- Password hashing via bcrypt
- User roles: `user`, `admin`
- Admin registration requires `ADMIN_SETUP_KEY`

## Centralized AI Gateway

- Route: `POST /api/v1/ai/decision-engine`
- Flow:
	- Fetch active + enabled provider
	- Decrypt provider API key using AES-256 utility
	- Dynamically call provider adapter (OpenAI, Anthropic, Groq)
	- Normalize response into standard schema
	- Fall back to keyword-based decision logic if provider call fails

Standard decision schema:

```json
{
	"status": "CRITICAL | MODERATE | SAFE",
	"category": "safety | medical | disaster",
	"actions": [],
	"instructions": []
}
```

## Notes

- Next.js API routes and SSR are no longer used for runtime.
- The root workspace now orchestrates a client-server MERN workflow.
