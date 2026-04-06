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

## 🎨 Design System

Integrated with UI/UX Design Library principles:
- **Reference**: See `docs/DESIGN_SYSTEM.md` (local only)
- Components follow accessibility (WCAG 2.1) standards
- Mobile-first responsive design
- Consistent color palette & typography
- Learn from: https://github.com/justinhartman/ui-ux-design-library

## 🤖 React MCP (Claude AI Integration)

Integrated React Model Context Protocol for AI-assisted development:

### Setup
1. Follow: `docs/REACT_MCP_SETUP.md` (local only)
2. Configure Claude Desktop with provided config
3. Ask Claude to help build/design components

### Features
- Create React components with AI guidance
- Follow design system automatically
- Write tests and documentation
- Refactor existing code

### Example Usage in Claude:
```
Using react-mcp, create an emergency widget that:
- Uses #DC2626 red for visibility
- Is 48px+ for touch screens
- Follows DESIGN_SYSTEM guidelines
- Includes TypeScript types
```

**Get Started**: See `docs/DESIGN_AND_DEVELOPMENT.md` (local only)

## 🚀 Network Sharing

Share localhost on local network:
```bash
npm run dev
```

Then open: `https://192.168.29.62:5174/`

**Note**: Self-signed SSL cert - click "Proceed" on first visit.

## 📂 Documentation

All markdown documentation is stored in the `/docs` folder and is **NOT uploaded to GitHub**. 
This keeps the repository clean and documentation local-only.

**Local docs** (see in `/docs` folder):
- Design system & component guidelines
- React MCP setup & configuration
- Development workflow

## Notes

- Next.js API routes and SSR are no longer used for runtime.
- The root workspace now orchestrates a client-server MERN workflow.
