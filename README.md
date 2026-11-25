# abhedit UCM — Unified Compliance Control Mapper

**Implement a control once. Comply with every framework.**

abhedit UCM is a multi-tenant SaaS application that maps one control across every compliance regime a company typically has to follow. It ships with a curated **Unified Control Library** (v2026.11) of **103 controls**, linked by **1,594 typed mapping links** to **998 requirements** across **23 frameworks** in India, the US, the EU, the UK and globally.

It also includes an **applicability assessment** (`/assess` publicly, *Obligations* in-app). It turns a short company profile into the list of **mandatory**, **customer-expected** and **recommended** frameworks, with the reason for each, and the number of unified controls that cover them all.

The library is built with the procedure enterprise GRC programmes use. The full procedure is in **[MAPPING_METHODOLOGY.md](MAPPING_METHODOLOGY.md)**, and current metrics are in [docs/mapping-qa-report.md](docs/mapping-qa-report.md).

- **Common control framework:** requirements map once to unified controls, and cross-framework equivalence is derived through the controls they share.
- **NIST IR 8477 relationship types:** every link is typed `=` equal, `⊂` subset of, `⊃` superset of, or `∩` intersects with. Readiness scoring and crosswalk match strength follow from those types.
- **Independent corroboration:** every control is anchored to Secure Controls Framework (SCF 2026.3) controls. 65% of links are corroborated by the SCF crosswalk. The rest are analyst-asserted, individually reviewed, and labelled in the product.
- **CI integrity gates (R1–R7)** and **versioned change control** (see [CHANGELOG-mappings.md](CHANGELOG-mappings.md)).

| Region | Framework | Legal force | Requirements |
|---|---|---|---:|
| Global | ISO/IEC 27001:2022 (all clauses and 93 Annex A controls) | Certification | 123 |
| Global | ISO/IEC 42001:2023 AI management (clauses and all 38 Annex A controls) | Certification | 65 |
| Global | ISO 22301:2019 Business continuity | Certification | 32 |
| Global | NIST CSF 2.0 (all 106 subcategories) | Voluntary | 106 |
| Global | CIS Controls v8.1 (all IG1 plus selected IG2/IG3) | Voluntary | 79 |
| Global | PCI DSS v4.0.1 (all 63 second-level requirements) | Contractual | 63 |
| US | SOC 2 Trust Services Criteria (all 61) | Attestation | 61 |
| US | NIST SP 800-53 Rev. 5 (moderate-baseline base controls) | Contractual | 100 |
| US | NIST SP 800-171 Rev. 3 / CMMC L2 basis (all 97, official OSCAL titles) | Contractual | 97 |
| US | HIPAA Security & Breach Notification Rules | Law | 66 |
| US | GLBA FTC Safeguards Rule §314.4 | Law | 17 |
| US | NYDFS 23 NYCRR 500 | Law | 16 |
| US | SEC cybersecurity disclosure (8-K 1.05, S-K 106) | Law | 5 |
| US | Sarbanes-Oxley §302/§404 plus ITGC domains | Law | 16 |
| US | CCPA / CPRA | Law | 14 |
| EU | GDPR | Law | 36 |
| EU | NIS2 Directive | Law | 18 |
| EU | DORA | Law | 20 |
| EU | EU AI Act | Law | 20 |
| UK | Cyber Essentials | Certification | 5 |
| India | DPDP Act 2023 | Law | 20 |
| India | CERT-In Directions 2022 | Law | 7 |
| India | IT (SPDI) Rules 2011 | Law | 12 |

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
2. **More frameworks**: ISO/IEC 27701, 27017/27018, CSA CCM, SEBI CSCRF, the RBI IT Master Direction, HITRUST, Singapore PDPA, Australia Essential Eight, and US state privacy laws beyond California.
3. **Auditor review workflow:** auditors can accept or challenge individual links, and customers can override relationships for their own scope.
4. **Consultant / MSP mode**: many client workspaces under one partner account.
5. **Team invites, RBAC, SSO/SAML, and audit-ready PDF exports.**
6. **Billing**: Stripe or Razorpay subscriptions for the published plans.

## Disclaimer

Mappings are reference crosswalks to help plan compliance work. They are not legal advice and do not imply certification. Requirement titles are short paraphrases. Licensed standards such as ISO/IEC 27001 and PCI DSS must be obtained from their publishers. Validate scoping decisions with your auditor.
