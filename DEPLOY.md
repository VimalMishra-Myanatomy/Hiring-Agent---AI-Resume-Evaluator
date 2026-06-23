# Deploy Hiring Agent

Deploy the **API** (FastAPI) and **UI** (React) separately. Recommended platform: [Render](https://render.com) (free tier).

Repo: [Hiring-Agent---AI-Resume-Evaluator](https://github.com/VimalMishra-Myanatomy/Hiring-Agent---AI-Resume-Evaluator)

---

## Option A — One-click Render Blueprint (recommended)

1. Go to [Render Dashboard](https://dashboard.render.com/) → **New** → **Blueprint**
2. Connect GitHub account and select `VimalMishra-Myanatomy/Hiring-Agent---AI-Resume-Evaluator`
3. Render reads `render.yaml` and creates two services:
   - `hiring-agent-api` — Python web service
   - `hiring-agent-ui` — static site
4. When prompted, set optional env vars:
   - `GEMINI_API_KEY` — optional server fallback (users can also use BYOK in UI)
   - `ALLOWED_ORIGINS` — set **after** UI deploys (see step 5)
5. After both services are live, open the API service → **Environment** → set:
   ```
   ALLOWED_ORIGINS=https://hiring-agent-ui.onrender.com
   ```
   (Use your actual UI URL from the Render dashboard.)
6. Redeploy the API service.

**URLs:**
- UI: `https://hiring-agent-ui.onrender.com`
- API: `https://hiring-agent-api.onrender.com`

---

## Option B — Manual Render setup

### Backend (`hiring-agent-api`)

| Setting | Value |
|---------|--------|
| Runtime | Python 3 |
| Build Command | `pip install -r requirements.txt` |
| Start Command | `uvicorn api.main:app --host 0.0.0.0 --port $PORT` |
| Health Check | `/api/health` |

**Environment variables:**

| Key | Value |
|-----|--------|
| `LLM_PROVIDER` | `gemini` |
| `DEFAULT_MODEL` | `gemini-2.5-flash` |
| `GEMINI_API_KEY` | *(optional)* |
| `ALLOWED_ORIGINS` | `https://your-ui.onrender.com` |

### Frontend (`hiring-agent-ui`)

| Setting | Value |
|---------|--------|
| Runtime | Static Site |
| Build Command | `cd frontend && npm ci && npm run build` |
| Publish Directory | `frontend/dist` |

**Environment variables:**

| Key | Value |
|-----|--------|
| `VITE_API_URL` | `https://hiring-agent-api.onrender.com` |

Add SPA rewrite: `/*` → `/index.html` (included via `frontend/public/_redirects`).

---

## Important production notes

### Bring-your-own API key
The UI stores Gemini keys in **browser localStorage** only. For public deployment, users validate their own key on the upload screen — no server DB required.

### Free tier cold starts
Render free services spin down after ~15 min idle. First request may take 30–60s to wake up.

### Job storage
Analysis jobs are stored **in memory** on the API server. Do not scale to multiple API instances without adding Redis or a database. Keep **1 instance** on free tier.

### File uploads
Uploaded PDFs are deleted after processing. `cache/` is ephemeral on Render — caching resets on redeploy.

---

## Verify deployment

1. Open `https://your-api.onrender.com/api/health` — should return `"status": "ok"`
2. Open your UI URL
3. Paste a Gemini API key → **Validate** → upload a sample PDF

---

## Other platforms

| Platform | Backend | Frontend |
|----------|---------|----------|
| [Railway](https://railway.app) | Python service, same start command | Static or Vercel |
| [Fly.io](https://fly.io) | Use `Dockerfile` | Netlify / Vercel |
| [Vercel](https://vercel.com) | Not ideal (long-running jobs) | `frontend/` with `VITE_API_URL` |

For Vercel frontend only:
```bash
cd frontend
VITE_API_URL=https://your-api.onrender.com npm run build
```
