# YT Insight — YouTube RAG Chatbot

A full-stack application that processes a YouTube transcript and answers questions about the video using sentence-transformer embeddings, FAISS retrieval, and Groq.

## Project structure

- `backend/` — FastAPI API and RAG pipeline
- `frontend/` — React + Vite application

## Prerequisites

- Python 3.11 recommended
- Node.js 18 or newer
- A Groq API key

## Run locally

### 1. Backend

```powershell
cd backend
Copy-Item .env.example .env
# Edit .env and set GROQ_API_KEY to your own key
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

The backend health endpoint is `http://localhost:8000/health`.

### 2. Frontend

Open a second terminal:

```powershell
cd frontend
Copy-Item .env.example .env
npm install
npm run dev
```

The Vite development server normally runs at `http://localhost:5173`.

## Deployment configuration

Deploy the backend and frontend as separate services.

### Backend service

- Set the service root directory to `backend/`.
- Install dependencies with `pip install -r requirements.txt`.
- Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`.
- Configure `GROQ_API_KEY` in the hosting provider's secret/environment settings. Do not commit `.env`.
- Configure `BACKEND_CORS_ORIGINS` as the exact deployed frontend origin, for example `https://your-frontend.example`.
- Health-check path: `/health`.

### Frontend service

- Set the service root directory to `frontend/`.
- Build command: `npm ci && npm run build`.
- Output directory: `dist`.
- Set `VITE_API_BASE_URL` to the deployed backend base URL, without a trailing slash, for example `https://your-backend.example`.
- `VITE_` variables are public and must never contain secrets.

## Important deployment notes

- The frontend uses `VITE_API_BASE_URL`; the localhost fallback is intended only for local development.
- The current FAISS index and transcript chunks are held in backend process memory. Processing a video again is required after a backend restart, and different backend instances do not share their indexes.
- The embedding model is downloaded/loaded by Sentence Transformers at backend startup. Allow sufficient memory and startup time on the hosting service.
- YouTube transcript availability depends on the video and YouTube's transcript access behavior.
