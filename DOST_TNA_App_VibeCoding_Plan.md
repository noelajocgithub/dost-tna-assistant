# DOST TNA Form 01 — Digital Collection App
## Vibe Coding Blueprint

> **Stack:** React.js + Vite + Tailwind CSS (Frontend) · Laravel + PostgreSQL (Backend API) · Ollama (Local LLM fallback)
> **AI Providers:** Claude Haiku 3.5 · Gemini 2.0 Flash-Lite · GPT-4o mini (nano) · Qwen-Flash · Ollama (local)

---

## 1. Project Structure

```
dost-tna/
├── frontend/                    # React + Vite + Tailwind
│   ├── src/
│   │   ├── api/                 # Axios API client modules
│   │   ├── components/
│   │   │   ├── ui/              # Reusable UI primitives (Button, Input, Badge, Modal)
│   │   │   ├── form/            # Per-step form section components
│   │   │   ├── layout/          # AppShell, Sidebar, Topbar
│   │   │   └── ai/              # AIAssistButton, AISuggestionPanel
│   │   ├── pages/
│   │   │   ├── auth/            # Login, ForgotPassword
│   │   │   ├── dashboard/       # Submitter and Evaluator dashboards
│   │   │   ├── form/            # Multi-step TNA form (wizard)
│   │   │   ├── review/          # Evaluator review & validation view
│   │   │   └── admin/           # Admin panel (users, API keys, LLM config)
│   │   ├── store/               # Zustand global state (auth, form draft, AI config)
│   │   ├── hooks/               # useAI, useFormDraft, useAuth
│   │   └── utils/               # formatters, validators, export helpers
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── backend/                     # Laravel 11
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/
│   │   │   │   ├── Auth/        # AuthController (login, logout, register)
│   │   │   │   ├── TnaFormController.php
│   │   │   │   ├── EvaluationController.php
│   │   │   │   ├── UserController.php
│   │   │   │   ├── AdminController.php
│   │   │   │   └── AIController.php
│   │   │   └── Middleware/
│   │   │       └── RoleMiddleware.php
│   │   ├── Models/
│   │   │   ├── User.php
│   │   │   ├── TnaForm.php
│   │   │   ├── TnaSection.php
│   │   │   ├── Evaluation.php
│   │   │   └── AiConfig.php
│   │   └── Services/
│   │       ├── AIService.php    # Routes prompts to correct provider
│   │       └── ExportService.php
│   ├── database/
│   │   └── migrations/
│   └── routes/
│       └── api.php
│
└── docker-compose.yml           # Optional: Postgres + Laravel + Ollama containers
```

---

## 2. Database Schema (PostgreSQL)

### `users`
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| name | VARCHAR | |
| email | VARCHAR UNIQUE | |
| password | VARCHAR | Hashed |
| role | ENUM | `enterprise`, `provincial_staff`, `regional_evaluator`, `admin` |
| province | VARCHAR | For provincial staff scoping |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

### `ai_configs`
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| provider | ENUM | `claude`, `gemini`, `openai`, `qwen`, `ollama` |
| api_key | TEXT | Encrypted at rest |
| model_name | VARCHAR | e.g. `claude-haiku-3-5`, `gemini-2.0-flash-lite` |
| ollama_base_url | VARCHAR | e.g. `http://localhost:11434` (for Ollama) |
| ollama_model | VARCHAR | e.g. `llama3`, `mistral`, `phi3` |
| is_active | BOOLEAN | Only one can be active at a time |
| created_by | UUID FK → users | Admin only |
| updated_at | TIMESTAMP | |

### `tna_forms`
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| enterprise_name | VARCHAR | |
| submitted_by | UUID FK → users | Enterprise or Provincial staff |
| status | ENUM | `draft`, `submitted`, `under_review`, `validated`, `returned` |
| submitted_at | TIMESTAMP | Nullable until submitted |
| validated_at | TIMESTAMP | Nullable until validated |
| validated_by | UUID FK → users | Regional evaluator |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

### `tna_sections`
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| tna_form_id | UUID FK → tna_forms | |
| section_key | VARCHAR | e.g. `enterprise_info`, `production`, `marketing` |
| data | JSONB | All field values for that section |
| updated_at | TIMESTAMP | |

### `tna_attachments`
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| tna_form_id | UUID FK → tna_forms | |
| type | ENUM | `org_chart`, `plant_layout`, `process_flow`, `other` |
| file_path | VARCHAR | Server storage path |
| original_name | VARCHAR | |
| uploaded_at | TIMESTAMP | |

### `evaluations`
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| tna_form_id | UUID FK → tna_forms | |
| evaluator_id | UUID FK → users | |
| section_key | VARCHAR | Which section this note applies to |
| comment | TEXT | Evaluator's per-section note |
| action | ENUM | `noted`, `flagged`, `approved` |
| created_at | TIMESTAMP | |

---

## 3. Backend — Laravel API

### 3.1 Authentication
- Use **Laravel Sanctum** for token-based SPA auth
- Issue tokens on login, revoke on logout
- Middleware checks `role` for protected routes

### 3.2 API Routes (`routes/api.php`)

```
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me

# TNA Forms (submitters)
GET    /api/forms                  → list own forms
POST   /api/forms                  → create new form / draft
GET    /api/forms/{id}             → get full form with sections
PUT    /api/forms/{id}/section     → save one section (auto-draft)
POST   /api/forms/{id}/submit      → finalize and submit
POST   /api/forms/{id}/attachments → upload file

# Evaluation (regional evaluators)
GET    /api/evaluations            → list all submitted forms
GET    /api/evaluations/{id}       → full form for review
POST   /api/evaluations/{id}/comment  → add per-section comment
POST   /api/evaluations/{id}/validate → mark as validated
POST   /api/evaluations/{id}/return   → return to submitter

# AI Assist
POST   /api/ai/assist              → proxy prompt to configured LLM

# Admin
GET    /api/admin/users            → list all users
POST   /api/admin/users            → create user
PUT    /api/admin/users/{id}       → edit user/role
GET    /api/admin/ai-config        → get current AI config
PUT    /api/admin/ai-config        → update API keys / provider / model
GET    /api/admin/ai-config/test   → test connection to selected provider

# Export
GET    /api/forms/{id}/export/pdf
GET    /api/forms/{id}/export/docx
```

### 3.3 AIService.php

The `AIService` reads the active `ai_configs` record and routes the prompt accordingly:

```php
class AIService {
    public function assist(string $prompt): string {
        $config = AiConfig::where('is_active', true)->first();

        return match($config->provider) {
            'claude'  => $this->callClaude($config, $prompt),
            'gemini'  => $this->callGemini($config, $prompt),
            'openai'  => $this->callOpenAI($config, $prompt),
            'qwen'    => $this->callQwen($config, $prompt),
            'ollama'  => $this->callOllama($config, $prompt),
        };
    }

    // Each method sends HTTP request to provider endpoint with api_key
    // Ollama uses: POST {ollama_base_url}/api/generate with no key
}
```

**Supported Models:**

| Provider | Model String | Requires API Key |
|---|---|---|
| Anthropic | `claude-haiku-3-5` | Yes |
| Google | `gemini-2.0-flash-lite` | Yes |
| OpenAI | `gpt-4o-mini` | Yes |
| Alibaba | `qwen-flash` | Yes |
| Ollama | Any local model (user-configurable) | No |

---

## 4. Frontend — React + Vite + Tailwind

### 4.1 Setup

```bash
npm create vite@latest frontend -- --template react
cd frontend
npm install tailwindcss @tailwindcss/vite
npm install axios zustand react-router-dom react-hook-form zod @hookform/resolvers
npm install @headlessui/react lucide-react
```

### 4.2 Global State (Zustand)

Three stores:

**`authStore`** — current user, role, token
**`formStore`** — current TNA form draft state per section, dirty flags
**`aiStore`** — selected AI provider name (display only; actual keys are backend-only)

### 4.3 Routing

```
/login
/dashboard                   → role-based redirect (submitter or evaluator view)
/forms/new                   → start new TNA form
/forms/:id                   → resume draft
/forms/:id/step/:step        → specific form step (1–8)
/forms/:id/review            → submitter pre-submission review
/evaluate                    → evaluator: list of submitted forms
/evaluate/:id                → evaluator: form detail + comment/validate
/admin/users                 → admin: user management
/admin/ai                    → admin: LLM provider & API key config
```

### 4.4 TNA Form Wizard (8 Steps)

Each step is a React component that:
- Loads its section data from the API on mount
- Auto-saves to backend on every field blur (`PUT /api/forms/:id/section`)
- Shows an **AI Assist** button on every textarea/narrative field

**Step 1 — Enterprise Information**
Fields: Enterprise Name, Contact Person, Position, Office Address, Tel, Fax, Email, Factory Address, Tel, Fax, Email, Website

**Step 2 — Business Profile**
Fields: Year Established, Initial Capitalization, Present Capitalization, Organization Type (radio), Registration No., Year Registered
AI: Generate Business Background narrative from: name, product, year, capitalization, past DOST programs, owner info

**Step 3 — Workforce**
Fields: Employee count table broken down by Direct/Production/Non-Production/Contract × Male/Female, Senior Citizens, PWDs, total
Business Activity: Sector + Commodity (text)

**Step 4 — Business Assessment**
Fields:
- Products/Services offered (textarea) — AI: suggest based on business type
- Reason for assistance (textarea) — AI: draft based on equipment age + production issues
- Prior consultations (Yes/No toggle, conditional fields: agency, type, amount)
- Org Chart (file upload)
- 5-Year Plan (textarea) — AI: suggest based on current scale and region
- 10-Year Plan (textarea) — AI: suggest
- Vision, Mission, Values (textarea) — AI: suggest
- Current alliances (textarea)

**Step 5 — Production & Supply Chain**
Sub-sections:
- Raw Materials Table (add/remove rows: Material, Source, Unit Cost, Volume/Year)
- Production Table (add/remove rows: Product, Volume/Year, Unit Cost, Annual Cost)
- Equipment Inventory Table (Type, Specs, Capacity, No. of Units, Year Acquired)
- Production Problems (textarea) — AI: draft from equipment table data
- Waste Management (textarea) — AI: suggest based on industry
- Production Plan (textarea) — AI: suggest
- Plant Layout (file upload)
- Process Flow (file upload or diagram description)
- Inventory System (textarea) — AI: suggest
- Maintenance Program (textarea) — AI: suggest
- GMP/HACCP Activities (textarea or N/A toggle)
- Purchasing/Supplies System (textarea) — AI: suggest

**Step 6 — Marketing**
Fields:
- Marketing Plan (textarea) — AI: draft from channels, outlets, target market
- Market Outlets and Number (textarea + number)
- Promotional Strategies (textarea) — AI: suggest based on current channels
- Market Competitors (textarea) — AI: suggest how to frame competitive positioning
- Packaging: Nutrition Evaluation, Bar Code, Product Label, Expiry Date (each: text or N/A toggle)

**Step 7 — Finance**
Fields:
- Cash Flow / financial documents (textarea) — AI: suggest standard description for SMEs
- Source(s) of Capital/Credit (textarea)
- Accounting System (textarea) — AI: suggest

**Step 8 — Human Resources**
Fields:
- Hiring Criteria (textarea) — AI: suggest standard SME hiring criteria
- Incentives to Employees (textarea) — AI: suggest
- Training and Development (textarea or N/A)
- Safety Measures Practiced (textarea) — AI: suggest PPE and safety practices
- Other Employee Welfare (textarea)
- Other Concerns (large textarea — open-ended)

**Step 9 — Review & Submit**
- Read-only summary of all 8 sections
- Section-by-section completion indicator
- "Submit Form" button (disabled if required fields are missing)
- Signature field (typed name as acknowledgment)

### 4.5 AI Assist Component

Each narrative textarea gets an `<AIAssistButton>` that:

1. Collects the current section's filled-in data as context
2. Sends a structured prompt to `POST /api/ai/assist`
3. Shows a loading spinner while waiting
4. Renders the AI suggestion in a side panel
5. User clicks "Use this" to insert into the field, or "Dismiss" to ignore
6. User can always manually edit the inserted text

```jsx
// Example prompt structure sent to backend
{
  section: "business_background",
  context: {
    enterprise_name: "Kahoy Furniture",
    product: "custom handcrafted furniture",
    year_established: 2005,
    capitalization: "8 million",
    past_programs: "SETUP 2015"
  },
  instruction: "Write a concise 3-paragraph business background for a DOST TNA form."
}
```

### 4.6 Evaluator Interface

- Table of all submitted forms: sortable by date, enterprise name, status, province
- Click a form to open full read-only view
- Each section has a collapsible evaluator comment box
- "Flag" / "Approve" toggles per section
- Bottom action bar: "Validate & Endorse" (logs evaluator name + date) or "Return to Submitter" (requires reason)

### 4.7 Admin Panel

**User Management tab:**
- Table of all users with role badges
- Create user form: name, email, temp password, role, province
- Edit/deactivate users

**AI Configuration tab:**
- Dropdown: Select active AI provider (Claude / Gemini / OpenAI / Qwen / Ollama)
- Input fields per provider:
  - API key (masked, stored encrypted in `ai_configs` table)
  - Model name (pre-filled per provider, editable)
- Ollama section:
  - Base URL input (e.g. `http://localhost:11434`)
  - Local model name input (e.g. `llama3.1`, `mistral`, `phi3`)
- "Test Connection" button → calls `GET /api/admin/ai-config/test` and shows success/error
- Only one provider can be active at a time; switching deactivates the previous one

---

## 5. LLM Provider Details

### Cloud Providers (API Key Required)

| Provider | Endpoint | Auth Header | Notes |
|---|---|---|---|
| Claude Haiku 3.5 | `https://api.anthropic.com/v1/messages` | `x-api-key` | Set `anthropic-version` header |
| Gemini 2.0 Flash-Lite | `https://generativelanguage.googleapis.com/v1beta/models/...` | URL param `key=` | |
| GPT-4o mini | `https://api.openai.com/v1/chat/completions` | `Authorization: Bearer` | |
| Qwen-Flash | `https://dashscope.aliyuncs.com/api/v1/services/aigc/...` | `Authorization: Bearer` | Alibaba DashScope API |

### Ollama (Local, No Key)

- Requires Ollama installed on the server or user's machine
- Backend calls: `POST {ollama_base_url}/api/generate`
- Payload: `{ model: "llama3.1", prompt: "...", stream: false }`
- The admin configures the base URL and model name in the admin panel
- No API key needed — purely local inference
- Ideal fallback when offline or API credits are exhausted

---

## 6. Export (PDF & DOCX)

Both exports are generated server-side by Laravel's `ExportService`:

**PDF Export:**
- Use `barryvdh/laravel-dompdf` or `spatie/laravel-pdf`
- Blade template mirrors the DOST TNA Form 01 layout
- Tables, checkboxes, and signature lines rendered in HTML → PDF

**DOCX Export:**
- Use `PHPWord` (PhpOffice/PhpWord) library
- Populate a DOCX template with form data
- Tables for raw materials, equipment, production data

Exports are accessible via:
- `GET /api/forms/:id/export/pdf` → returns file download
- `GET /api/forms/:id/export/docx` → returns file download

---

## 7. Security Considerations

- All API keys stored **encrypted** in the database (Laravel `encrypted` cast)
- API keys are **never returned** to the frontend — only used server-side
- Role middleware enforces access at the route level
- File uploads: validate MIME type and size server-side; store outside `public/`
- CORS configured to allow only the frontend domain
- Sanctum tokens expire after configurable inactivity period

---

## 8. Phased Build Order

### Phase 1 — Foundation
- [ ] Set up Vite + React + Tailwind frontend project
- [ ] Set up Laravel backend with Sanctum auth
- [ ] Create PostgreSQL migrations for all tables
- [ ] Build login page and auth flow (token stored in memory / httpOnly cookie)
- [ ] Build role-based routing and layout shell (sidebar, topbar, role badge)

### Phase 2 — TNA Form Wizard (Core)
- [ ] Build multi-step form shell with step navigation and progress indicator
- [ ] Implement all 8 form steps as React components with react-hook-form + Zod validation
- [ ] Implement dynamic tables (raw materials, production, equipment) with add/remove row
- [ ] Implement file upload for org chart, plant layout, process flow
- [ ] Connect auto-save (on blur → `PUT /api/forms/:id/section`)
- [ ] Build Step 9: Review & Submit summary view

### Phase 3 — Dashboard & Submission
- [ ] Submitter dashboard: list of own forms, status badges, resume/new
- [ ] Submit action: validate completeness, confirm dialog, status transition
- [ ] Evaluator dashboard: table of all submitted forms, filter/sort

### Phase 4 — Evaluator Review Workflow
- [ ] Evaluator form detail view (read-only with section expand/collapse)
- [ ] Per-section comment and flag/approve toggles
- [ ] Validate & Endorse action (status → `validated`)
- [ ] Return to Submitter action (status → `returned`, reason required)

### Phase 5 — AI Assist Integration
- [ ] Build `AIService.php` with routing to all 5 providers
- [ ] Build `AIAssistButton` React component + suggestion side panel
- [ ] Write prompt templates for each narrative field (see Section 4.5)
- [ ] Admin: AI config panel with provider selection, API key input, test connection
- [ ] Ollama integration: base URL + model selector, no-key flow

### Phase 6 — Admin Panel
- [ ] User management: create, edit, assign role, deactivate
- [ ] AI config management: select active provider, save keys, test connection
- [ ] Audit log view: who submitted/validated what and when

### Phase 7 — Export
- [ ] PDF export: Blade template matching TNA Form 01 layout
- [ ] DOCX export: PHPWord template population
- [ ] Download buttons in submitter review and evaluator views

### Phase 8 — Polish & Hardening
- [ ] Mobile-responsive form layout (Tailwind breakpoints)
- [ ] Form field validation error messages
- [ ] Loading states, empty states, error boundaries
- [ ] Encrypt API keys in `ai_configs` table
- [ ] Write API documentation (optional: use Laravel Scribe)

---

## 9. Key Dependencies Summary

### Frontend
| Package | Purpose |
|---|---|
| `vite` | Build tool |
| `react-router-dom` | Client-side routing |
| `react-hook-form` + `zod` | Form state + validation |
| `zustand` | Global state management |
| `axios` | HTTP client |
| `@headlessui/react` | Accessible UI components (modals, dropdowns) |
| `lucide-react` | Icons |
| `tailwindcss` | Utility-first CSS |

### Backend
| Package | Purpose |
|---|---|
| `laravel/sanctum` | SPA token auth |
| `barryvdh/laravel-dompdf` | PDF generation |
| `phpoffice/phpword` | DOCX generation |
| `guzzlehttp/guzzle` | HTTP client for LLM API calls |
| `intervention/image` | Image handling for uploads |

---

## 10. Environment Variables

### Frontend (`.env`)
```
VITE_API_BASE_URL=http://localhost:8000/api
```

### Backend (`.env`)
```
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=dost_tna
DB_USERNAME=postgres
DB_PASSWORD=secret

APP_KEY=...
SANCTUM_STATEFUL_DOMAINS=localhost:5173

# AI keys are NOT stored here — they are stored encrypted in the database
# and managed through the Admin panel
```

---

*This document is the single source of truth for building the DOST TNA Digitization App. Each phase can be handed to a developer (or AI coding assistant) as a self-contained sprint.*
