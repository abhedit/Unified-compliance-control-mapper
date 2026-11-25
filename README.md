# abhedit UCM — Unified Compliance Control Mapper

**Implement a control once. Comply with every framework.**

abhedit UCM is a multi-tenant SaaS application that maps one control across ISO 27001, SOC 2, NIST and other frameworks. It ships with a curated **Unified Control Library** (v2026.11) of **92 controls**, linked by **1,054 typed mapping links** to **654 requirements** across 9 frameworks.

The library is built with the procedure enterprise GRC programmes use. The full procedure is in **[MAPPING_METHODOLOGY.md](MAPPING_METHODOLOGY.md)**, and current metrics are in [docs/mapping-qa-report.md](docs/mapping-qa-report.md).

- **Common control framework:** requirements map once to unified controls, and cross-framework equivalence is derived through the controls they share.
- **NIST IR 8477 relationship types:** every link is typed `=` equal, `⊂` subset of, `⊃` superset of, or `∩` intersects with. Readiness scoring and crosswalk match strength (equivalent, strong, partial, supporting) follow from those types.
- **Independent corroboration:** every control is anchored to Secure Controls Framework (SCF 2026.3) controls. 65% of links are corroborated by the SCF crosswalk. The rest are analyst-asserted, individually reviewed, and labelled as such in the product.
- **CI integrity gates (R1–R7):** every mapped code exists, every requirement has non-supportive coverage, and relationships and provenance stay consistent.
- **Versioned change control:** see [CHANGELOG-mappings.md](CHANGELOG-mappings.md).

| Framework | Version | Requirements | Catalog completeness |
|---|---|---:|---|
| ISO/IEC 27001 | 2022 | 123 | All clauses 4–10 and all 93 Annex A controls |
| SOC 2 Trust Services Criteria | 2017 TSC (rev. 2022) | 61 | All CC, A, C, PI and P criteria |
| NIST Cybersecurity Framework | 2.0 | 106 | All subcategories |
| NIST SP 800-53 | Rev. 5 | 100 | Base controls commonly selected for the moderate baseline; titles from the NIST OSCAL catalog |
| HIPAA Security & Breach Notification Rules | 45 CFR 164 | 66 | All Security Rule standards and implementation specifications, plus breach notification |
| PCI DSS | v4.0.1 | 63 | All second-level requirements |
| GDPR | 2016/679 | 36 | Operative controller and processor obligations, data subject rights and transfer articles |
| CIS Critical Security Controls | v8.1 | 79 | All 56 IG1 safeguards plus selected IG2/IG3 safeguards |
| India DPDP Act | 2023 | 20 | Data Fiduciary obligations and Data Principal rights |

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

## Mapping QA pipeline

```bash
python3 scripts/mapping-qa/extract_scf.py secure-controls-framework-scf-2026-3.xlsx scf-reference.json
node --experimental-strip-types scripts/mapping-qa/reconcile.ts scf-reference.json --detail
npm run validate-data
```

The SCF workbook is free from the SCF Council (CC BY-ND 4.0). It is used only as an audit reference and is not redistributed here.

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
npm run validate-data   # mapping integrity gates R1–R7 (also run in CI)
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
3. **Auditor review workflow:** auditors can accept or challenge individual links, and customers can override relationships for their own scope.
4. **Consultant / MSP mode**: many client workspaces under one partner account.
5. **Team invites, RBAC, SSO/SAML, and audit-ready PDF exports.**
6. **Billing**: Stripe or Razorpay subscriptions for the published plans.

## Disclaimer

Mappings are reference crosswalks to help plan compliance work. They are not legal advice and do not imply certification. Requirement titles are short paraphrases. Licensed standards such as ISO/IEC 27001 and PCI DSS must be obtained from their publishers. Validate scoping decisions with your auditor.
