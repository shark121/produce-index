# Produce Reliability Index

PRI is a Next.js product demo for turning farm evidence into institution-ready scorecards. The
current product story is centered on lenders and health systems, with farmers as the supply-side
motion and produce buyers as a secondary audience.

## What is implemented

- Institution-first public marketing flow:
  - `/`
  - `/for-institutions`
  - `/for-farmers`
  - `/for-partners`
  - `/how-it-works`
- Real pilot intake flow:
  - `/apply`
  - `POST /api/applications`
- Institution-facing partner tooling:
  - `/partner`
  - `/partner/compare`
  - `/partner/farms/[id]`
  - `/partner/reports`
- Scoring provenance improvements:
  - evidence coverage is captured in admin review
  - scorecards expose weights version, benchmark version, review method, and confidence

## Demo mode

The app is designed to run safely before Supabase is configured.

- If `NEXT_PUBLIC_MOCK_MODE=true`, or Supabase env vars are missing, demo mode is active.
- Demo mode uses curated mock farms, scores, and partner records.
- Pilot applications are persisted locally to `.local/pilot-applications.json`.
- Public and partner pages explicitly show when they are using demo data.

## Local development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Key environment variables

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_MOCK_MODE=
```

If Supabase is configured, the app will attempt to use:

- `pilot_intake_applications`
- `pri_submissions`
- `pri_score_snapshots`
- `partner_interests`
- `admin_config`

## Current product posture

- Primary buyer: lenders and health systems
- Secondary buyer: produce buyers and procurement teams
- Farmer value: verified proof record for financing and procurement conversations
- Differentiators in the UI: financing readiness, community coverage, health impact ledger,
  verification confidence, and seasonal reliability
