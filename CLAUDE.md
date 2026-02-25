# LetsGrow CMS

---

## 1. PROJECT LOCATION

**Path:** /Users/loic/Documents/Ganesha/LetsGrow/LetsGrow IT/LetsGrow CMS/letsgrow-cms

**BACKUP INSTRUCTIONS:**
- Backups go to: `/Users/loic/Documents/Ganesha/LetsGrow/LetsGrow IT/LetsGrow CMS/backups/`
- Naming format: `YYYY-MM-DD_HH-MM_description_status.zip`
- Example: `2026-02-22_10-30_diagnostics-page_stable.zip`
- To get current date/time for naming, run: `date "+%Y-%m-%d_%H-%M"`
- Use this command (includes essential files, excludes node_modules/.next):
```bash
cd "/Users/loic/Documents/Ganesha/LetsGrow/LetsGrow IT/LetsGrow CMS/letsgrow-cms" && zip -r "../backups/BACKUP_NAME.zip" \
  app/ \
  components/ \
  lib/ \
  public/ \
  .env.local \
  CLAUDE.md \
  package.json \
  tsconfig.json \
  version.ts
```

---

## 2. PROJECT OVERVIEW

- Next.js web application for agronomist experts to review and validate Vegify crop disease diagnoses
- Users: agronomist experts (e.g. Febri) who review AI diagnostic results from young farmers in eastern Indonesia
- Reads from the **Vegify Supabase project** (separate from LetsGrow LMS Supabase)
- No authentication in phase 1 — URL-based access only

**Tech Stack:**
- Framework: Next.js (App Router)
- Database: Supabase (PostgreSQL) — Vegify project
- Styling: Inline styles with centralized theme (same as LMS, no Tailwind)
- Auth: None in phase 1

**Supabase project:**
- URL: `https://vkfwrfeahicwtckzuhrt.supabase.co`
- Anon key: stored in `.env.local`

---

## 3. PROJECT STRUCTURE

```
app/
├── diagnostics/                   # Main review page (sidebar + detail)
│   ├── page.tsx                   # Data fetching + layout
│   ├── DiagnosticSidebar.tsx      # Left list with search + cards
│   └── DiagnosticDetail.tsx       # Right panel with photos + fields
├── dashboard/
│   └── page.tsx                   # Accuracy dashboard (coming soon)
├── settings/
│   └── page.tsx                   # Settings (coming soon)
├── layout.tsx                     # Root layout
├── page.tsx                       # Redirects to /diagnostics
└── globals.css

components/
└── shared/
    ├── NavBar.tsx                 # Top nav: Diagnostics, Dashboard, Settings icon, profile
    └── SearchPill.tsx             # Reusable search input (copied from LMS)

lib/
├── supabase/
│   └── client.ts                  # Browser Supabase client
└── theme/
    ├── colors.ts                  # Same color palette as LMS
    ├── dimensions.ts              # Same spacing/sizing as LMS
    ├── typography.ts              # Same type scale as LMS
    └── index.ts

public/
└── assets/
    ├── letsgrow-logo.png          # Copied from LMS
    └── profile_icon.png           # Copied from LMS

version.ts                         # Current CMS version
```

---

## 4. PAGES

### Diagnostics (`app/diagnostics/`)

Main page for expert review. Layout: full-height, sidebar + main area (same pattern as LMS Youths page).

```
Page (column, 100vh, overflow hidden)
├── NavBar
└── ContentRow (row)
    ├── DiagnosticSidebar (280px, fixed)
    │   ├── SearchPill
    │   └── DiagnosticCard list (scrollable)
    │       Each card = one row from diagnoses table
    │       Sorted: lowest confidence first, newest first
    │       Left border color = expert_validation status
    └── DiagnosticDetail (flex:1, scrollable)
        ├── Title: crop + common name
        ├── Metadata: date, model, session ID
        ├── Photos (photo_1_url, photo_2_url)
        ├── AI Diagnosis fields
        ├── Expert Validation (not yet reviewed / status)
        └── AI Reasoning (full chain-of-thought text)
```

**DiagnosticCard fields shown:**
- Crop + primary common name (title)
- Primary scientific name
- Model name
- Confidence % (badge)
- Date (top right)
- Left border: green = confirmed, red = rejected, none = unreviewed

**DiagnosticDetail fields shown:**
- Photos (200×200px thumbnails)
- Primary diagnosis (common + scientific name)
- Confidence %
- Secondary diagnosis (if present)
- Treatment shown (yes/no + group)
- Expert validation status
- Full AI reasoning text

### Dashboard (`app/dashboard/`)
Coming soon — will show accuracy metrics and confirmation rates.

### Settings (`app/settings/`)
Coming soon.

---

## 5. SHARED COMPONENTS

| Component | Description |
|-----------|-------------|
| `NavBar` | Blue top bar with Diagnostics, Dashboard links + Settings icon + profile dropdown |
| `SearchPill` | Rounded search input with search icon (identical to LMS) |

---

## 6. THEME

Identical to LMS theme — copied directly. All styling uses inline styles with theme constants.

| File | Contents |
|------|----------|
| `lib/theme/colors.ts` | Color palette (primaryBlue, textDarkBlue, etc.) |
| `lib/theme/dimensions.ts` | Spacing, radius, sidebar width (280px), padding |
| `lib/theme/typography.ts` | Font sizes and weights |

---

## 7. SUPABASE — VEGIFY PROJECT

**diagnoses table** — one row per model result per session:

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `session_id` | UUID | Groups rows from same diagnosis session |
| `created_at` | TIMESTAMPTZ | When diagnosis was made |
| `crop` | TEXT | Crop name |
| `diagnostic_mode` | TEXT | e.g. gpt-only, compare-all |
| `app_version` | TEXT | Vegify app version |
| `photo_1_url` | TEXT | URL to Supabase Storage |
| `photo_2_url` | TEXT | URL to Supabase Storage (optional) |
| `model_name` | TEXT | e.g. GPT-4o, Claude Sonnet |
| `primary_diagnosis` | TEXT | Scientific name (genus/family) |
| `primary_common_name` | TEXT | Human-readable name |
| `primary_confidence` | INTEGER | 0–100 |
| `secondary_diagnosis` | TEXT | Second candidate (optional) |
| `secondary_common_name` | TEXT | Second candidate common name |
| `treatment_group` | TEXT | Treatment group number (optional) |
| `treatment_shown` | BOOLEAN | Whether treatment was shown to farmer |
| `reasoning` | TEXT | Full chain-of-thought reasoning |
| `image_quality_score` | TEXT | "Good", "not great", "poor" |
| `cost_usd` | NUMERIC | API cost for this diagnosis |
| `expert_validation` | ENUM | confirmed / rejected / uncertain / escalated |
| `expert_correct_diagnosis` | TEXT | Expert correction (if rejected) |
| `expert_notes` | TEXT | Optional expert notes |
| `reviewed_at` | TIMESTAMPTZ | When expert reviewed |

**diagnosis-photos bucket** — public bucket, path: `{session_id}/photo_1.jpg`

**Security:** RLS disabled on diagnoses table (phase 1). Storage has open anon policies.

---

## 8. TODO LIST

### Task 1: Expert Validation Actions
**Priority**: High
**Status**: Not started

**Goal**: Add Confirm / Reject+Correct / Uncertain / Escalate buttons to DiagnosticDetail.

**Behavior**:
- **Confirm**: sets `expert_validation = 'confirmed'`, `reviewed_at = now()`
- **Reject + Correct**: sets `expert_validation = 'rejected'`, opens selector to pick correct diagnosis from existing pest/disease list, saves to `expert_correct_diagnosis`
- **Uncertain**: sets `expert_validation = 'uncertain'`
- **Escalate**: sets `expert_validation = 'escalated'`

**Files to modify:**
- `app/diagnostics/DiagnosticDetail.tsx` — add action buttons + correction selector
- `lib/supabase/client.ts` — add update function

---

### Task 2: Accuracy Dashboard
**Priority**: Medium
**Status**: Not started (needs validation data first)

**Key metrics:**
- Overall confirmation rate
- Confirmation rate by confidence bucket (50–60%, 60–70%, 70–80%, etc.)
- Most common AI errors
- Accuracy by crop and by model
- Volume over time

---

### Task 3: Expert Authentication
**Priority**: Medium
**Status**: Not started (deferred from phase 1)

**Goal**: Secure CMS with Supabase Auth email/password login for agronomist experts.

---

### Task 4: Filter & Sort Controls
**Priority**: Low
**Status**: Not started

**Goal**: Add filter pills above the sidebar list to filter by:
- Validation status (unreviewed / confirmed / rejected / uncertain)
- Crop
- Model
- Confidence range

---

## 9. DESIGN PRINCIPLES

- **Identical visual language to LMS**: same colors, spacing, typography, component patterns
- **No Tailwind**: all styling via inline styles with theme constants
- **Sidebar + main area pattern**: same as LMS Youths/TFOs pages
- **One step at a time**: implement incrementally, test at each step
- **Simple and maintainable**: avoid complexity, keep components focused
