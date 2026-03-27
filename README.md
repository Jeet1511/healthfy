# LifeLine – Smart Emergency & Healthcare Platform

Production-quality, hackathon-optimized emergency web platform focused on **speed, trust, and actionable response**.

## 1) Full Architecture Overview

### Minimal, high-impact modules
1. **Smart Emergency AI Assistant**
	 - User describes symptoms/situation
	 - Returns urgency level (Low/Medium/Critical), immediate steps, first-aid guidance
2. **Emergency Blood Finder**
	 - Blood group + location filters
	 - Shows nearby blood banks/hospitals + map
3. **Doctor & Hospital Locator**
	 - Nearby healthcare providers on map
	 - Filter by distance and specialty
4. **Crisis Mode**
	 - Predefined scenarios: Accident, Fire, Explosion
	 - Step-by-step emergency response + contact numbers

### Data flow diagram (text-based)
```text
[User UI: Next.js + Tailwind]
				|
				| 1) Enter symptom text / filters / scenario
				v
[App Components + Local State]
				|
				| 2) API call
				v
[Next.js Route Handlers]
	 |                    |
	 | /api/ai/emergency  | /api/resources
	 v                    v
[OpenAI API / fallback] [Mock healthcare dataset]
				|                    |
				+-------- 3) Structured JSON --------+
												 |
												 v
									[UI Renders:
									 urgency, actions,
									 maps, blood sources]
```

## 2) Tech Stack

- **Frontend:** Next.js (App Router), React, TypeScript, Tailwind CSS
- **Backend:** Next.js serverless route handlers (REST-style)
- **AI integration:** OpenAI SDK with strict JSON response format + heuristic fallback
- **Maps:** Google Maps Embed (query-based, zero-complexity demo reliability)
- **Data:** Mock datasets for hospitals, clinics, doctors, blood banks, crisis playbooks

## 3) Folder Structure

```text
src/
	app/
		api/
			ai/emergency/route.ts
			resources/route.ts
		globals.css
		layout.tsx
		page.tsx
	frontend/
		components/
			EmergencyChat.tsx
			LiveMap.tsx
			ActionPanel.tsx
			BloodFinderPanel.tsx
			CrisisModeOverlay.tsx
			StatusBar.tsx
	backend/
		data/
			mockData.ts
		lib/
			aiPrompts.ts
			location.ts
		types/
			index.ts
```

## 4) Key Code Snippets

### AI Triage endpoint
`POST /api/ai/emergency`:
- Uses `OPENAI_API_KEY` if present
- Returns fallback triage if AI key is unavailable

### Resource search endpoint
`GET /api/resources?maxDistanceKm=15&specialty=Trauma&type=Hospital&bloodGroup=O+`:
- Computes geographic distance
- Applies filters and sorting
- Returns map-ready resource list

## 5) API Design

### `POST /api/ai/emergency`
**Request**
```json
{ "input": "Severe chest pain and sweating" }
```
**Response**
```json
{
	"mode": "ai",
	"result": {
		"urgency": "Critical",
		"message": "Possible heart issue detected",
		"steps": ["Sit down", "Call ambulance"],
		"actions": ["Call Ambulance", "Find Hospital"]
	}
}
```

### `GET /api/resources`
Query params:
- `latitude`, `longitude` (optional)
- `maxDistanceKm` (default 20)
- `type` (Hospital | Clinic | Doctor | Blood Bank)
- `specialty` (General | Cardiology | Trauma | Pediatrics | Orthopedic)
- `bloodGroup` (A+, O-, etc.)

## 6) UI Layout Description

- **Global shell:** dark premium gradient + glassmorphism cards
- **Top bar:** command-style status bar with AI and location system state
- **Left panel:** emergency chat with typing animation, urgency badge, and quick actions
- **Right intelligence stack:** live map, action panel, and blood availability widget
- **Crisis mode:** full-screen overlay with scenario playbooks and emergency contacts

## 7) AI Prompt Templates

System prompt principles:
- Triage support, not diagnosis
- Strict JSON output
- 3–5 immediate actions
- Mandatory urgency class: Low/Medium/Critical
- Clear first-aid recommendation

Prompt implementation is in:
- `src/backend/lib/aiPrompts.ts`

## 8) Development Plan (Phased)

1. **Phase 1:** Setup project (Next.js + Tailwind + TypeScript)
2. **Phase 2:** Build UI skeleton + dark glass dashboard
3. **Phase 3:** Integrate AI assistant route and chat panel
4. **Phase 4:** Add map-based locator with filters
5. **Phase 5:** Add blood finder with mock availability
6. **Phase 6:** Add crisis mode playbooks and contacts
7. **Phase 7:** Polish UI + scripted demo flow

## 9) State Management Approach

- Local component state (`useState`, `useMemo`, `useEffect`) for fast iteration
- API-backed state fetch from route handlers
- No heavy global store to keep demo speed and maintainability high

## 10) Demo Strategy (Hackathon)

### Scenario 1: Chest pain (AI assistant)
1. Open **Emergency AI** tab
2. Enter: `Severe chest pain and sweating`
3. Show `Critical` urgency + ambulance recommendation

### Scenario 2: Need O+ blood
1. Open **Blood Finder** tab
2. Select `O+`
3. Show nearby blood banks/hospitals + map focus

### Scenario 3: Accident happened
1. Click **Activate Crisis Mode**
2. Select `Accident`
3. Walk through full-screen playbook + emergency contacts

### 2-minute pitch flow
1. Enter `I have chest pain` in emergency chat to trigger critical triage and live actions.
2. Press `Call Ambulance` to show rapid response controls and crisis readiness.
3. Press `Need Blood` to open the blood request modal and show nearby matching sources on map.
4. Activate crisis mode for a full-screen command protocol finish.

## 11) Setup & Run

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

### Optional AI configuration
Create `.env.local`:

```bash
OPENAI_API_KEY=your_key_here
OPENAI_MODEL=gpt-4.1-mini
```

Without key, the app uses a safe mock triage fallback for uninterrupted demos.
