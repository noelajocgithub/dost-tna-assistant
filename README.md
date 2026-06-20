# DOST TNA Form 01 — Digital Collection App

A digital collection system for the DOST Technology Needs Assessment (TNA) Form 01,
built from the VibeCoding Blueprint. Flat design system, role-based workflow, AI-assisted
narrative drafting (5 providers incl. local Ollama), and PDF/DOCX export.

**Stack:** React + Vite + Tailwind v4 (frontend) · Laravel 13 + PostgreSQL 16 (backend) ·
Sanctum token auth · dompdf + PhpWord (export) · Ollama/Claude/Gemini/OpenAI/Qwen (AI).

---

## Prerequisites

- PHP 8.3+, Composer
- Node 20+, npm
- PostgreSQL 16 (running)
- (optional) Ollama for local AI — the app seeds an active Ollama config by default

## First-time setup

```bash
# 1. PostgreSQL — create the database (once)
createdb dost_tna

# 2. Backend
cd backend
composer install
php artisan migrate:fresh --seed      # tables + demo users + Ollama AI config

# 3. Frontend
cd ../frontend
npm install
```

The backend `.env` is preconfigured for PostgreSQL (`dost_tna`, user `noelajoc`, no password).
Adjust `DB_USERNAME` / `DB_PASSWORD` if your local Postgres differs.

## Run (two terminals)

```bash
# Terminal 1 — API on :8000
cd backend && php artisan serve --port=8000

# Terminal 2 — SPA on :5173 (proxies /api -> :8000)
cd frontend && npm run dev
```

Open the printed Vite URL (http://localhost:5173).

## Demo accounts (password: `password`)

| Email | Role | Sees |
|---|---|---|
| `admin@dost.gov.ph` | Admin | User management, AI configuration |
| `evaluator@dost.gov.ph` | Regional Evaluator | Evaluation queue, review/validate/return |
| `staff@dost.gov.ph` | Provincial Staff | TNA wizard, own submissions |
| `enterprise@dost.gov.ph` | Enterprise | TNA wizard, own submissions |

## Feature map (built in vertical slices)

1. **Auth** — Sanctum tokens, role-based routing, flat login.
2. **TNA forms** — list, create draft, role-scoped CRUD.
3. **Wizard** — 9 steps, debounced auto-save per section, dynamic tables, review & submit.
4. **Evaluation** — queue with filters, collapsible read-only review, per-section
   Note/Flag/Approve, Validate & Endorse, Return with reason.
5. **AI Assist** — `/api/ai/assist` routes to the active provider; slide-in suggestion
   panel on every narrative field. Defaults to local Ollama (`llama3.1:8b`).
6. **Admin** — user management, AI provider config with masked keys + Test Connection.
7. **Export** — server-side PDF (dompdf) and DOCX (PhpWord) downloads.

## AI providers

Configure under **Admin → AI Configuration**. API keys are stored encrypted
(`encrypted` cast) and never returned to the frontend. Supported: Claude Haiku 3.5,
Gemini 2.0 Flash-Lite, GPT-4o mini, Qwen-Flash, and Ollama (local, no key).

## Project layout

```
backend/    Laravel API (app/Http/Controllers, app/Services, database/migrations)
frontend/   React SPA (src/api, src/components, src/pages, src/store)
```
