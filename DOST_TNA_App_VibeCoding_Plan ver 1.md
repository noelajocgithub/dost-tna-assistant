# DOST TNA Form 01 — Digital Collection App
## Vibe Coding Blueprint

> **Stack:** React.js + Vite + Tailwind CSS (Frontend) · Laravel + PostgreSQL (Backend API) · Ollama (Local LLM fallback)
> **AI Providers:** Claude Haiku 3.5 · Gemini 2.0 Flash-Lite · GPT-4o mini · Qwen-Flash · Ollama (local)
> **UI Style:** Flat Design — no shadows, no gradients, no border-radius on cards, pixel-precise borders

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
│   └── tailwind.config.js       # ← color palette defined here
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

## 2. Design System

### 2.1 Color Palette

Define all colors in `tailwind.config.js` so they are available as utility classes throughout the app.

```js
// tailwind.config.js
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary:    '#004A98',   // DOST Royal Blue   — buttons, active states, main headers
        charcoal:   '#1E1E1E',   // Deep Charcoal     — body text, headings, icons
        background: '#FFFFFF',   // Clean White        — page background, card surfaces
        neutral:    '#F4F5F7',   // Soft Grey          — section backgrounds, borders, spacers
        cyan:       '#00B5E2',   // Science Cyan       — secondary actions, progress bars, highlights
        yellow:     '#FFC107',   // Alert Yellow       — warnings, priority badges
        green:      '#28A745',   // Success Green      — confirmations, success states
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
}
```

**Quick reference — Tailwind class names:**

| Token | Class (bg) | Class (text) | Class (border) |
|---|---|---|---|
| Primary | `bg-primary` | `text-primary` | `border-primary` |
| Charcoal | `bg-charcoal` | `text-charcoal` | `border-charcoal` |
| Background | `bg-background` | — | — |
| Neutral | `bg-neutral` | `text-neutral` | `border-neutral` |
| Cyan | `bg-cyan` | `text-cyan` | `border-cyan` |
| Yellow | `bg-yellow` | `text-yellow` | `border-yellow` |
| Green | `bg-green` | `text-green` | `border-green` |

### 2.2 Flat Design Rules

These rules must be followed by every component. No exceptions.

| Rule | Implementation |
|---|---|
| **No shadows** | Never use `shadow-*` classes. Depth is expressed through solid 1px borders only. |
| **No gradients** | Never use `bg-gradient-*`. Backgrounds are flat solid colors. |
| **No border-radius on containers** | Cards, panels, modals, sidebar — `rounded-none`. Buttons use `rounded-none` too unless noted. |
| **No border-radius on inputs** | All `<input>`, `<textarea>`, `<select>` use `rounded-none`. |
| **Borders define structure** | Use `border border-neutral` for cards and sections. Use `border-b border-neutral` for dividers. |
| **Active states use fill** | Active nav items: `bg-primary text-white`. Active tabs: `border-b-2 border-primary text-primary`. |
| **Hover is a flat color shift** | Buttons: darken background (e.g. `hover:bg-blue-800`). Nav: `hover:bg-neutral`. Never add shadow on hover. |
| **Typography is the hierarchy** | Use font weight and size — not color blocks or decorations — to establish visual priority. |
| **Icons are line-style only** | Use `lucide-react` icons at `strokeWidth={1.5}`. Never filled icon variants. |

### 2.3 Typography Scale

Import `Inter` via Google Fonts in `index.html`.

| Role | Class | Notes |
|---|---|---|
| Page title | `text-2xl font-bold text-charcoal` | Topbar app name, page headers |
| Section heading | `text-lg font-semibold text-charcoal` | Form step titles, card headers |
| Label | `text-sm font-medium text-charcoal` | All form field labels |
| Body / helper text | `text-sm text-charcoal` | Paragraphs, descriptions |
| Muted / caption | `text-xs text-gray-500` | Timestamps, sub-labels |
| Error text | `text-xs text-red-600` | Field-level validation errors |

### 2.4 Component Anatomy

#### Button Variants

```jsx
// Primary — main CTA (Submit, Save, Validate)
<button className="bg-primary text-white text-sm font-medium px-4 py-2 border border-primary hover:bg-blue-800 transition-colors">
  Submit Form
</button>

// Secondary — secondary action (Cancel, Back)
<button className="bg-background text-primary text-sm font-medium px-4 py-2 border border-primary hover:bg-neutral transition-colors">
  Back
</button>

// Accent — AI Assist trigger, progress actions
<button className="bg-cyan text-white text-sm font-medium px-4 py-2 border border-cyan hover:bg-sky-600 transition-colors">
  AI Assist
</button>

// Danger — Return to Submitter, Delete
<button className="bg-background text-red-600 text-sm font-medium px-4 py-2 border border-red-600 hover:bg-red-50 transition-colors">
  Return to Submitter
</button>

// Success — Validate & Endorse
<button className="bg-green text-white text-sm font-medium px-4 py-2 border border-green hover:bg-emerald-700 transition-colors">
  Validate & Endorse
</button>
```

#### Input / Textarea

```jsx
<input
  className="w-full border border-neutral bg-background text-charcoal text-sm px-3 py-2
             focus:outline-none focus:border-primary rounded-none"
/>
<textarea
  className="w-full border border-neutral bg-background text-charcoal text-sm px-3 py-2
             focus:outline-none focus:border-primary rounded-none resize-y"
/>
```

#### Status Badges

```jsx
// Draft
<span className="text-xs font-medium px-2 py-0.5 bg-neutral text-charcoal border border-neutral">Draft</span>

// Submitted
<span className="text-xs font-medium px-2 py-0.5 bg-cyan text-white border border-cyan">Submitted</span>

// Under Review
<span className="text-xs font-medium px-2 py-0.5 bg-yellow text-charcoal border border-yellow">Under Review</span>

// Validated
<span className="text-xs font-medium px-2 py-0.5 bg-green text-white border border-green">Validated</span>

// Returned
<span className="text-xs font-medium px-2 py-0.5 bg-red-100 text-red-700 border border-red-300">Returned</span>
```

#### Card / Panel

```jsx
<div className="bg-background border border-neutral p-6">
  {/* No shadow, no radius. Structure defined entirely by 1px border */}
</div>
```

#### Section Divider

```jsx
<hr className="border-t border-neutral my-6" />
```

### 2.5 Layout Shell

```
┌─────────────────────────────────────────────────────────────┐
│  TOPBAR  bg-primary text-white h-14                         │
│  [≡] DOST TNA System          [Role Badge] [User] [Logout]  │
├──────────────┬──────────────────────────────────────────────┤
│              │                                              │
│  SIDEBAR     │  MAIN CONTENT AREA                           │
│  bg-charcoal │  bg-neutral (outer)                          │
│  w-56        │  bg-background (inner cards)                 │
│  text-white  │                                              │
│              │                                              │
│  Nav items:  │                                              │
│  hover:      │                                              │
│  bg-primary  │                                              │
│              │                                              │
│  Active:     │                                              │
│  bg-primary  │                                              │
│  border-l-4  │                                              │
│  border-cyan │                                              │
│              │                                              │
└──────────────┴──────────────────────────────────────────────┘
```

- **Topbar:** `bg-primary text-white h-14 px-6 flex items-center justify-between border-b-2 border-cyan`
- **Sidebar:** `bg-charcoal text-white w-56 min-h-screen` with nav items `px-4 py-2.5 text-sm hover:bg-primary`
- **Active nav item:** `bg-primary border-l-4 border-cyan`
- **Content area wrapper:** `bg-neutral min-h-screen p-6`
- **Content cards:** `bg-background border border-neutral`

---

## 3. Database Schema (PostgreSQL)

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

## 4. Backend — Laravel API

### 4.1 Authentication
- Use **Laravel Sanctum** for token-based SPA auth
- Issue tokens on login, revoke on logout
- Middleware checks `role` for protected routes

### 4.2 API Routes (`routes/api.php`)

```
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me

# TNA Forms (submitters)
GET    /api/forms                     → list own forms
POST   /api/forms                     → create new form / draft
GET    /api/forms/{id}                → get full form with sections
PUT    /api/forms/{id}/section        → save one section (auto-draft)
POST   /api/forms/{id}/submit         → finalize and submit
POST   /api/forms/{id}/attachments    → upload file

# Evaluation (regional evaluators)
GET    /api/evaluations               → list all submitted forms
GET    /api/evaluations/{id}          → full form for review
POST   /api/evaluations/{id}/comment  → add per-section comment
POST   /api/evaluations/{id}/validate → mark as validated
POST   /api/evaluations/{id}/return   → return to submitter

# AI Assist
POST   /api/ai/assist                 → proxy prompt to configured LLM

# Admin
GET    /api/admin/users               → list all users
POST   /api/admin/users               → create user
PUT    /api/admin/users/{id}          → edit user/role
GET    /api/admin/ai-config           → get current AI config
PUT    /api/admin/ai-config           → update API keys / provider / model
GET    /api/admin/ai-config/test      → test connection to selected provider

# Export
GET    /api/forms/{id}/export/pdf
GET    /api/forms/{id}/export/docx
```

### 4.3 AIService.php

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

## 5. Frontend — React + Vite + Tailwind

### 5.1 Setup

```bash
npm create vite@latest frontend -- --template react
cd frontend
npm install tailwindcss @tailwindcss/vite
npm install axios zustand react-router-dom react-hook-form zod @hookform/resolvers
npm install @headlessui/react lucide-react
```

Add `Inter` to `index.html`:
```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
```

### 5.2 Global State (Zustand)

Three stores:

**`authStore`** — current user, role, token
**`formStore`** — current TNA form draft state per section, dirty flags
**`aiStore`** — selected AI provider name (display only; actual keys are backend-only)

### 5.3 Routing

```
/login
/dashboard                    → role-based redirect (submitter or evaluator view)
/forms/new                    → start new TNA form
/forms/:id                    → resume draft
/forms/:id/step/:step         → specific form step (1–8)
/forms/:id/review             → submitter pre-submission review
/evaluate                     → evaluator: list of submitted forms
/evaluate/:id                 → evaluator: form detail + comment/validate
/admin/users                  → admin: user management
/admin/ai                     → admin: LLM provider & API key config
```

### 5.4 Login Page

```
┌──────────────────────────────────────────────────┐
│  bg-neutral full-screen                           │
│                                                  │
│     ┌──────────────────────────────────┐         │
│     │  bg-background border-neutral    │         │
│     │  p-10  w-[400px]                 │         │
│     │                                  │         │
│     │  [DOST Logo — flat SVG]          │         │
│     │  TNA Collection System           │         │
│     │  text-2xl font-bold text-primary │         │
│     │                                  │         │
│     │  Email ___________________       │         │
│     │  Password _________________      │         │
│     │                                  │         │
│     │  [  Log In  ] bg-primary         │         │
│     │                                  │         │
│     └──────────────────────────────────┘         │
│                                                  │
└──────────────────────────────────────────────────┘
```

- Card: `bg-background border border-neutral p-10` (no shadow, no radius)
- Title: `text-2xl font-bold text-primary`
- Inputs: `border border-neutral focus:border-primary rounded-none`
- Button: full-width `bg-primary text-white hover:bg-blue-800`

### 5.5 Submitter Dashboard

```
┌─ TOPBAR (bg-primary) ─────────────────────────────────────────┐
├─ SIDEBAR (bg-charcoal) ──┬─ CONTENT (bg-neutral p-6) ─────────┤
│  Dashboard               │                                     │
│  My Forms          ←─── │  My TNA Submissions                 │
│                          │  ┌──────────────────────────────┐   │
│                          │  │ bg-background border-neutral  │   │
│                          │  │                              │   │
│                          │  │  [+ New TNA Form]  bg-primary│   │
│                          │  │                              │   │
│                          │  │  Enterprise Name   Status    │   │
│                          │  │  ─────────────────────────── │   │
│                          │  │  Kahoy Furniture  [Validated]│   │
│                          │  │  Santos Bakery    [Draft]    │   │
│                          │  │  Dela Cruz Farm   [Submitted]│   │
│                          │  └──────────────────────────────┘   │
└──────────────────────────┴─────────────────────────────────────┘
```

- Table rows: `border-b border-neutral hover:bg-neutral`
- Status badges: colored flat badges (see Section 2.4)
- "New TNA Form" button: `bg-primary text-white px-4 py-2 hover:bg-blue-800`

### 5.6 TNA Form Wizard

#### Progress Bar
```
Step 3 of 9 — Production & Supply Chain
──────────────────────────────────────────────────────────
[████████████████████░░░░░░░░░░░░░░░░░░░░░░░░░]  33%
bg-cyan on bg-neutral — no radius, flat bar
```

```jsx
<div className="w-full bg-neutral h-1.5">
  <div className="bg-cyan h-1.5 transition-all" style={{ width: `${progress}%` }} />
</div>
```

#### Step Tab Navigation (top of wizard)
Each step label is a flat tab. Completed steps show a `✓` in `text-green`. Current step has `border-b-2 border-primary text-primary`. Future steps are `text-gray-400`.

```
[✓ Enterprise] [✓ Profile] [→ Workforce] [  Assessment] [  Production] ...
```

#### Form Step Container

```jsx
<div className="bg-background border border-neutral p-6">
  <h2 className="text-lg font-semibold text-charcoal mb-1">Step 3 — Production & Supply Chain</h2>
  <p className="text-xs text-gray-500 mb-6">Auto-saved · Last saved 2 min ago</p>
  <hr className="border-t border-neutral mb-6" />
  {/* Fields */}
</div>
```

#### Auto-save Indicator
Small status line below the step title:
- Saving: `text-xs text-cyan` — "Saving…"
- Saved: `text-xs text-green` — "✓ Saved"
- Error: `text-xs text-red-600` — "⚠ Save failed"

### 5.7 Form Steps — Fields Detail

**Step 1 — Enterprise Information**
Fields: Enterprise Name, Contact Person, Position, Office Address, Tel, Fax, Email, Factory Address, Tel, Fax, Email, Website

**Step 2 — Business Profile**
Fields: Year Established, Initial Capitalization, Present Capitalization, Organization Type (radio buttons styled as flat bordered toggles), Registration No., Year Registered
AI Assist: Generate Business Background narrative from: name, product, year, capitalization, past DOST programs, owner info

**Step 3 — Workforce**
Fields: Employee count table (Direct / Production / Non-Production / Contract × Male / Female), Senior Citizens, PWDs, Total, Business Activity Sector + Commodity

**Step 4 — Business Assessment**
Fields:
- Products/Services offered (textarea) — AI Assist
- Reason for assistance (textarea) — AI Assist: draft from equipment age + production issues
- Prior consultations (Yes/No toggle → conditional: agency, type, amount)
- Org Chart (file upload)
- 5-Year Plan (textarea) — AI Assist
- 10-Year Plan (textarea) — AI Assist
- Vision, Mission, Values (textarea) — AI Assist
- Current alliances (textarea)

**Step 5 — Production & Supply Chain**
Sub-sections with dynamic add/remove row tables:
- Raw Materials Table (Material, Source, Unit Cost, Volume/Year)
- Production Table (Product, Volume/Year, Unit Cost, Annual Cost)
- Equipment Inventory Table (Type, Specs, Capacity, No. of Units, Year Acquired)
- Production Problems (textarea) — AI Assist: draft from equipment table data
- Waste Management (textarea) — AI Assist
- Production Plan (textarea) — AI Assist
- Plant Layout (file upload)
- Process Flow (file upload or text description)
- Inventory System (textarea) — AI Assist
- Maintenance Program (textarea) — AI Assist
- GMP/HACCP Activities (textarea or N/A toggle)
- Purchasing/Supplies System (textarea) — AI Assist

**Step 6 — Marketing**
Fields:
- Marketing Plan (textarea) — AI Assist
- Market Outlets and Number (textarea + number input)
- Promotional Strategies (textarea) — AI Assist
- Market Competitors (textarea) — AI Assist
- Packaging: Nutrition Evaluation, Bar Code, Product Label, Expiry Date (each: text or N/A toggle)

**Step 7 — Finance**
Fields:
- Cash Flow / financial documents (textarea) — AI Assist
- Source(s) of Capital/Credit (textarea)
- Accounting System (textarea) — AI Assist

**Step 8 — Human Resources**
Fields:
- Hiring Criteria (textarea) — AI Assist
- Incentives to Employees (textarea) — AI Assist
- Training and Development (textarea or N/A)
- Safety Measures Practiced (textarea) — AI Assist
- Other Employee Welfare (textarea)
- Other Concerns (large textarea — open-ended)

**Step 9 — Review & Submit**
- Read-only collapsible summary of all 8 sections
- Section completion chips: green `✓` = complete, yellow `!` = incomplete
- Typed signature field for acknowledgment (name input)
- "Submit Form" button: `bg-primary` — disabled and `opacity-50` if any required fields are missing

#### Dynamic Table Rows (Steps 5)

```jsx
// Each row in a table (e.g. Raw Materials)
<tr className="border-b border-neutral hover:bg-neutral">
  <td className="p-2"><input className="w-full border border-neutral px-2 py-1 text-sm rounded-none focus:border-primary" /></td>
  <td className="p-2"><input ... /></td>
  <td className="p-2">
    <button className="text-red-600 text-xs border border-red-300 px-2 py-1 hover:bg-red-50">Remove</button>
  </td>
</tr>

// Add row button below table
<button className="text-sm text-cyan border border-cyan px-3 py-1 hover:bg-sky-50 mt-2">
  + Add Row
</button>
```

### 5.8 AI Assist Component

Each narrative textarea has an `<AIAssistButton>` above it — styled with `bg-cyan text-white`.

**Interaction flow:**
1. User clicks "AI Assist" button
2. A flat side panel slides in from the right (no shadow — `border-l border-neutral bg-background`)
3. Panel shows a loading state: flat animated bar in `bg-cyan`
4. AI suggestion renders in the panel in a read-only textarea
5. Two buttons: "Use this" (`bg-primary`) inserts text into the field; "Dismiss" (`border border-neutral`) closes panel
6. User can always edit the inserted text

```jsx
// Prompt structure sent to backend
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

**AI Assist panel layout:**
```
┌── AI Suggestion ─────────────────────────────── [✕] ─┐
│  bg-background border-l border-neutral w-80 h-full    │
│                                                        │
│  Provider: [Claude Haiku 3.5]  text-xs text-gray-500  │
│  ──────────────────────────────────────────────────── │
│  [Loading bar: bg-cyan h-0.5 animated]                 │
│                                                        │
│  Kahoy Furniture is a sole proprietorship...           │
│  (suggested text in a read-only textarea)              │
│                                                        │
│  [Use this]  bg-primary text-white                     │
│  [Dismiss]   border border-neutral                     │
└────────────────────────────────────────────────────────┘
```

### 5.9 Evaluator Interface

**Evaluator Dashboard:**
- Table: Enterprise Name | Province | Submitted By | Date | Status
- Rows: `border-b border-neutral hover:bg-neutral cursor-pointer`
- Filter bar: flat `border border-neutral` dropdowns for Status and Province
- Status badges follow Section 2.4

**Evaluator Form Review:**
```
┌─ Form: Kahoy Furniture ──────────────────────────────────────────┐
│  Status: [Under Review]    Submitted: Jan 10, 2025               │
│  ──────────────────────────────────────────────────────────────  │
│  ▼ Section 1: Enterprise Info        [✓ Approved]                │
│    [Read-only field values]                                       │
│    Comment: ____________________________________________          │
│    [Noted] [Flag ⚠] [Approve ✓]                                 │
│  ──────────────────────────────────────────────────────────────  │
│  ▼ Section 2: Business Profile       [⚠ Flagged]                 │
│    ...                                                            │
│  ──────────────────────────────────────────────────────────────  │
│                                                                   │
│  [Return to Submitter]  border-red    [Validate & Endorse]  bg-green │
└──────────────────────────────────────────────────────────────────┘
```

Section action buttons:
- `[Noted]` — `border border-neutral text-charcoal hover:bg-neutral`
- `[Flag ⚠]` — `border border-yellow text-yellow hover:bg-yellow hover:text-charcoal`
- `[Approve ✓]` — `border border-green text-green hover:bg-green hover:text-white`

### 5.10 Admin Panel

**Tabs:** `[User Management]  [AI Configuration]  [Audit Log]`
Tab style: active tab `border-b-2 border-primary text-primary font-medium`, inactive `text-gray-500 hover:text-charcoal`

**User Management tab:**
- Table of users with role badges (role badge colors: admin=`bg-primary`, evaluator=`bg-cyan`, staff=`bg-charcoal`, enterprise=`bg-neutral text-charcoal border border-neutral`)
- "Add User" button: `bg-primary text-white`
- Edit/Deactivate inline row actions

**AI Configuration tab:**

```
┌─ AI Provider Configuration ────────────────────────────────────┐
│  bg-background border border-neutral p-6                        │
│                                                                  │
│  Active Provider:                                                │
│  [ Claude Haiku 3.5  ▼ ]   border border-neutral rounded-none  │
│                                                                  │
│  ── Claude Settings ──────────────────────────────────────────  │
│  API Key   [●●●●●●●●●●●●●●●●●●●●]  [Show]                      │
│  Model     [claude-haiku-3-5      ]                             │
│                                                                  │
│  ── Ollama Settings (local fallback) ─────────────────────────  │
│  Base URL  [http://localhost:11434]                              │
│  Model     [llama3.1             ]                              │
│                                                                  │
│  [Test Connection]  bg-cyan text-white                          │
│  ✓ Connection successful   text-green text-sm                   │
│                                                                  │
│  [Save Configuration]  bg-primary text-white                    │
└──────────────────────────────────────────────────────────────────┘
```

Provider dropdown options:
- Claude Haiku 3.5 (Anthropic)
- Gemini 2.0 Flash-Lite (Google)
- GPT-4o mini (OpenAI)
- Qwen-Flash (Alibaba)
- Ollama — Local (No API key required)

---

## 6. LLM Provider Details

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
- Admin configures base URL and model name in the admin panel
- No API key needed — purely local inference
- Ideal when offline or API credits are exhausted

---

## 7. Export (PDF & DOCX)

Both exports are generated server-side by Laravel's `ExportService`.

**PDF Export:**
- Use `barryvdh/laravel-dompdf`
- Blade template mirrors DOST TNA Form 01 layout exactly
- Tables, checkboxes, and signature lines in HTML → PDF

**DOCX Export:**
- Use `PHPWord` (PhpOffice/PhpWord)
- Populate a DOCX template with form data
- Tables for raw materials, equipment, production data

Exports triggered via:
- `GET /api/forms/:id/export/pdf` → file download
- `GET /api/forms/:id/export/docx` → file download

Download buttons (in submitter review and evaluator views):
```jsx
<button className="border border-primary text-primary text-sm px-4 py-2 hover:bg-neutral">
  Download PDF
</button>
<button className="border border-primary text-primary text-sm px-4 py-2 hover:bg-neutral ml-2">
  Download DOCX
</button>
```

---

## 8. Security Considerations

- All API keys stored **encrypted** in the database (Laravel `encrypted` cast)
- API keys are **never returned** to the frontend — only used server-side
- Role middleware enforces access at the route level
- File uploads: validate MIME type and size server-side; store outside `public/`
- CORS configured to allow only the frontend domain
- Sanctum tokens expire after configurable inactivity period

---

## 9. Phased Build Order

### Phase 1 — Foundation
- [ ] Set up Vite + React + Tailwind frontend; configure `tailwind.config.js` with full DOST color palette
- [ ] Add Inter font, set base styles (`body { font-family: 'Inter'; background: #F4F5F7; color: #1E1E1E; }`)
- [ ] Build reusable flat UI primitives: Button, Input, Textarea, Badge, Card, Modal, Divider
- [ ] Set up Laravel backend with Sanctum auth
- [ ] Create PostgreSQL migrations for all tables
- [ ] Build login page (flat card, no shadow, `bg-primary` button)
- [ ] Build AppShell: `bg-primary` topbar, `bg-charcoal` sidebar, `bg-neutral` content area

### Phase 2 — TNA Form Wizard (Core)
- [ ] Build multi-step wizard shell: flat step tab navigation, `bg-cyan` progress bar
- [ ] Implement all 8 form steps as React components (react-hook-form + Zod)
- [ ] Implement dynamic add/remove row tables for Steps 5 (raw materials, production, equipment)
- [ ] Implement file upload UI (flat drop zone: `border-2 border-dashed border-neutral`)
- [ ] Connect auto-save: `PUT /api/forms/:id/section` on blur; show save indicator in `text-green` / `text-cyan`
- [ ] Build Step 9: Review & Submit summary with section completion chips

### Phase 3 — Dashboard & Submission
- [ ] Submitter dashboard: form list table, status badges, "New TNA Form" button
- [ ] Submit action: completeness check, confirm modal (flat, `border border-neutral`), status transition
- [ ] Evaluator dashboard: table with filter bar for Status and Province

### Phase 4 — Evaluator Review Workflow
- [ ] Evaluator form detail view: read-only sections, collapsible with `border-b border-neutral`
- [ ] Per-section comment textarea and Noted / Flag / Approve action buttons
- [ ] "Validate & Endorse" action: `bg-green` button, logs evaluator + date
- [ ] "Return to Submitter" action: `border-red` button, reason required in modal

### Phase 5 — AI Assist Integration
- [ ] Build `AIService.php` with routing to all 5 providers
- [ ] Build `AIAssistButton` component (`bg-cyan`) + right-side slide-in suggestion panel
- [ ] Write prompt templates per narrative field (see Section 5.8)
- [ ] Admin: AI config panel — provider dropdown, API key masked input, test connection, save

### Phase 6 — Admin Panel
- [ ] User management: flat table, role badges, "Add User" modal, deactivate toggle
- [ ] AI config panel: provider selector, per-provider fields, Ollama section, test + save
- [ ] Audit log: read-only table of submission/validation events

### Phase 7 — Export
- [ ] PDF Blade template matching TNA Form 01 layout
- [ ] DOCX PHPWord template population
- [ ] Download buttons in review and evaluator views (`border border-primary text-primary`)

### Phase 8 — Polish & Hardening
- [ ] Mobile-responsive layout (sidebar collapses to hamburger menu on small screens)
- [ ] Empty states: flat illustration + CTA (e.g. "No forms yet. Start your first TNA.")
- [ ] Error boundaries and loading skeleton states (flat grey `bg-neutral` pulse blocks)
- [ ] Encrypt API keys in `ai_configs` table
- [ ] Final design pass: audit every screen for accidental shadows, gradients, or border-radius

---

## 10. Key Dependencies Summary

### Frontend
| Package | Purpose |
|---|---|
| `vite` | Build tool |
| `react-router-dom` | Client-side routing |
| `react-hook-form` + `zod` | Form state + validation |
| `zustand` | Global state management |
| `axios` | HTTP client |
| `@headlessui/react` | Accessible modals, dropdowns (unstyled — apply flat classes) |
| `lucide-react` | Line-style icons (`strokeWidth={1.5}`) |
| `tailwindcss` | Utility-first CSS with custom DOST palette |

### Backend
| Package | Purpose |
|---|---|
| `laravel/sanctum` | SPA token auth |
| `barryvdh/laravel-dompdf` | PDF generation |
| `phpoffice/phpword` | DOCX generation |
| `guzzlehttp/guzzle` | HTTP client for LLM API calls |
| `intervention/image` | Image handling for uploads |

---

## 11. Environment Variables

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

# AI keys are NOT stored here — stored encrypted in the DB, managed via Admin panel
```

---

## 12. Flat Design Quick Reference Card

> Give this to every developer or AI coding session working on UI screens.

```
COLORS
  Primary (Royal Blue)   #004A98  → bg-primary  text-primary  border-primary
  Charcoal               #1E1E1E  → bg-charcoal text-charcoal border-charcoal
  Background (White)     #FFFFFF  → bg-background
  Neutral (Soft Grey)    #F4F5F7  → bg-neutral  border-neutral
  Cyan (Science Cyan)    #00B5E2  → bg-cyan     text-cyan     border-cyan
  Yellow (Alert)         #FFC107  → bg-yellow   text-yellow   border-yellow
  Green (Success)        #28A745  → bg-green    text-green    border-green

RULES (NEVER violate)
  ✗ No shadow-*         ✗ No bg-gradient-*     ✗ No rounded-* on cards/inputs
  ✓ border border-neutral on all cards
  ✓ rounded-none on all inputs, buttons, modals
  ✓ Hover = flat color shift only (hover:bg-neutral or hover:bg-blue-800)
  ✓ Active nav = bg-primary border-l-4 border-cyan
  ✓ Progress bar = bg-cyan on bg-neutral, h-1.5, no radius
  ✓ Icons = lucide-react strokeWidth={1.5} only

TOPBAR     bg-primary text-white h-14 border-b-2 border-cyan
SIDEBAR    bg-charcoal text-white w-56
CONTENT    bg-neutral p-6 (outer)  →  bg-background border border-neutral (inner cards)
```

---

*This document is the single source of truth for building the DOST TNA Digitization App. Each phase can be handed to a developer or AI coding assistant as a self-contained sprint. The Flat Design Quick Reference Card (Section 12) must be included in every coding prompt.*
