# abhedit UCM — Unified Compliance Control Mapper

**Implement a control once. Comply with every framework.**

abhedit UCM is a multi-tenant SaaS application that maps one control across ISO 27001, SOC 2, NIST and other frameworks. It ships with a curated **Unified Control Library** of 91 controls, linked by 900+ mappings to 553 requirements across 9 frameworks:

| Framework | Version | Requirements |
|---|---|---|
| ISO/IEC 27001 | 2022 (clauses 4–10 + all 93 Annex A controls) | 112 |
| SOC 2 Trust Services Criteria | 2017 TSC (rev. 2022), CC + A + C + PI + P | 57 |
| NIST Cybersecurity Framework | 2.0 | 99 |
| NIST SP 800-53 | Rev. 5 (moderate-baseline controls in common use) | 100 |
| HIPAA Security & Breach Notification Rules | 45 CFR 164 | 43 |
| PCI DSS | v4.0.1 | 47 |
| GDPR | 2016/679 | 22 |
| CIS Critical Security Controls | v8 (key IG1/IG2 safeguards) | 57 |
| India DPDP Act | 2023 (+ 2025 Rules) | 16 |

`npm run validate-data` checks that every mapped code exists and that **every requirement in every framework is covered by at least one unified control**.

## Market research: how others do it

| Vendor | Approach | What we took from it |
|---|---|---|
| **Scrut Automation** | A unified control framework mapping one control to many frameworks. Its 2026 materials claim 70+ frameworks, about 1,500 controls and auto-filled overlapping controls. | The unified control library is the core data model. Evidence is attached once at the control level. |
| **Vanta** | Common-criteria mapping between SOC 2 and ISO 27001, an auto-generated Statement of Applicability, and continuous automated tests. | An SoA and gap-report export per framework, plus readiness computed from control status. |
| **Secureframe** | A pre-built control library mapped to frameworks, with custom controls and tests. | A custom-control builder with mapping suggestions. |
| **Drata** | Pre-mapped controls aligned to ISO 27001:2022. Vendor estimates put SOC 2 / ISO overlap at 40–85%. | An overlap matrix and crosswalk, to show "how much of the next framework you already have". |

**How abhedit UCM differs:**
- **Transparent mapping.** The free public mapper at `/map` shows the whole crosswalk before anyone buys, and each mapping has a shareable link.
- **India coverage.** The DPDP Act sits next to GDPR, HIPAA and PCI DSS.
- **Leverage-first guidance.** The dashboard ranks open controls by how many in-scope requirements each one closes.
- **Pricing and API.** Self-serve plans, plus a REST API for the mapping library and workspace coverage.

## Features

- **Control mapper** (`/map` is public; `/app/mapper` is in the workspace). Pick any requirement or control and see every equivalent requirement in every framework, linked through unified controls. You can pivot between them, copy a link, or export CSV.
- **Readiness dashboard.** Per-framework met/partial/gap counts, work saved by mapping, highest-leverage next controls, a framework overlap heat-map, and an activity feed.
- **Controls.** Set status, owner and implementation notes. Evidence links are attached once and reused for every mapped requirement.
- **Framework detail and gap analysis.** Each requirement shows its controls and status, and you can export a **Statement of Applicability / gap report** CSV.
- **Crosswalk.** A→B matrix between any two frameworks, with overlap percentages and CSV export.
- **Custom controls.** Describe a control in plain English. A TF-IDF similarity engine suggests the requirements it satisfies and warns about duplicates of library controls.
- **Multi-tenant auth.** Workspaces, scrypt password hashing, HTTP-only session cookies, and per-workspace framework scope.
- **REST API.** Public mapping endpoints, plus workspace endpoints protected by hashed API keys (see `/docs`).

## Tech stack

- Next.js 15 (App Router, Server Components, Server Actions), React 19, TypeScript, Tailwind CSS v4
- SQLite through Node's built-in `node:sqlite`, so there are no native dependencies. The data layer lives in `src/lib/db.ts` and `src/lib/org.ts` and can be swapped for Postgres.
- Pure, framework-agnostic mapping engine in `src/lib/mapper.ts`

```
src/
  data/frameworks.ts   framework requirement catalog
  data/controls.ts     unified control library + mappings
  lib/mapper.ts        crosswalk, coverage, overlap, suggestion engine (pure)
  lib/auth.ts          users, sessions, password hashing
  lib/org.ts           workspace data access (status, evidence, custom controls, API keys)
  app/                 marketing site, public mapper, /app workspace, /api/v1
```

## Running locally

Requires Node.js 22.5+.

```bash
npm install
npm run validate-data   # check mapping integrity
npm run dev             # http://localhost:3000
```

Production:

```bash
npm run build && npm start
# or
docker build -t abhedit-ucm . && docker run -p 3000:3000 -v ucm-data:/app/data abhedit-ucm
```

Environment variables (see `.env.example`):
- `DATABASE_PATH`: SQLite file location. Defaults to `./data/ucm.db`.
- `INSECURE_COOKIES=1`: lets session cookies work over plain HTTP in production mode, for local testing only.

> Serverless hosts such as Vercel do not keep a local SQLite file between requests. Deploy as a container (Docker, Fly.io, Railway, Render, ECS) with a persistent volume, or replace `src/lib/db.ts` with Postgres.

## Roadmap

1. **Integrations for automated evidence**: AWS, GCP and Azure config, Okta and Google Workspace, GitHub, Jira, and MDM.
2. **More frameworks**: ISO 27701, ISO 42001, SOC 1, NIST 800-171 / CMMC, RBI / SEBI CSCRF, CERT-In directions, DORA, NIS2, HITRUST.
3. **Mapping relationship types** (NIST OLIR style: equal / subset / superset / intersects) and auditor review workflow.
4. **Consultant / MSP mode**: many client workspaces under one partner account.
5. **Team invites, RBAC, SSO/SAML, and audit-ready PDF exports.**
6. **Billing**: Stripe or Razorpay subscriptions for the published plans.

## Disclaimer

Mappings are reference crosswalks to help plan compliance work. They are not legal advice and do not imply certification. Requirement titles are short paraphrases. Licensed standards such as ISO/IEC 27001 and PCI DSS must be obtained from their publishers. Validate scoping decisions with your auditor.
