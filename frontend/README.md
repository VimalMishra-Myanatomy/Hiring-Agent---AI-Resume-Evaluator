# Hiring Agent — Frontend UI

HackerRank-inspired React frontend connected to the **live FastAPI backend**.

## Requirements

- **Node.js 18+**
- **Python API running** on port 8000 (see `../run_api.ps1`)

## Quick start

**Terminal 1 — API:**
```powershell
cd d:\hiring-agent
.\run_api.ps1
```

**Terminal 2 — UI:**
```powershell
cd d:\hiring-agent
.\run_frontend.ps1
```

Open http://localhost:5173 — the Vite dev server proxies `/api` → `http://localhost:8000`.

## API endpoints (used by UI)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/health` | Provider status + Gemini config check |
| POST | `/api/analyze` | Upload PDF (`file`, `include_github`) → `{ jobId }` |
| GET | `/api/analyze/:id/status` | Poll progress |
| GET | `/api/analyze/:id/result` | Full result when complete |

## Environment

Optional override for API URL (production builds):

```env
VITE_API_URL=https://your-api.example.com
```

## Design tokens

| Token | Value |
|-------|-------|
| Primary green | `#21C45D` |
| Teal accent | `#2DD4BF` |
| Background | `#080B10` |
| Card | `#141A22` |
| Border | `#2A3344` |

## Build

```bash
npm run build
npm run preview
```

For production, set `VITE_API_URL` to your deployed API before building.
