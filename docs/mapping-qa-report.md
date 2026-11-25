# Mapping QA report

Generated 2026-11-25 for Unified Control Library **v2026.11** (103 controls, 1594 mapping links) against **SCF 2026.3**.
See [MAPPING_METHODOLOGY.md](../MAPPING_METHODOLOGY.md) for the procedure.

## 1. Independent corroboration

A link is *corroborated* when the reference crosswalk, reached through the control's SCF anchor controls, maps the same requirement.
Links not corroborated are analyst-asserted and were individually reviewed (see methodology §5).
Frameworks the reference does not cover at catalog granularity (e.g. UK Cyber Essentials themes, CCPA statute sections, CERT-In Directions) are fully analyst-mapped.

| Framework | Links | Corroborated | Rate | Reference suggestions reviewed |
|---|---:|---:|---:|---:|
| ISO/IEC 27001:2022 | 184 | 129 | 70% | 109 |
| SOC 2 Trust Services Criteria | 157 | 103 | 66% | 164 |
| NIST Cybersecurity Framework 2.0 | 174 | 90 | 52% | 95 |
| NIST SP 800-53 Rev. 5 | 153 | 101 | 66% | 55 |
| HIPAA Security & Breach Notification Rules | 79 | 39 | 49% | 52 |
| PCI DSS v4.0.1 | 134 | 118 | 88% | 105 |
| EU General Data Protection Regulation | 54 | 28 | 52% | 9 |
| CIS Critical Security Controls v8.1 | 90 | 64 | 71% | 39 |
| India Digital Personal Data Protection Act | 29 | 16 | 55% | 15 |
| ISO/IEC 42001:2023 AI Management System | 101 | 71 | 70% | 64 |
| EU Artificial Intelligence Act | 30 | 26 | 87% | 34 |
| ISO 22301:2019 Business Continuity Management | 46 | 26 | 57% | 3 |
| EU Digital Operational Resilience Act | 43 | 32 | 74% | 23 |
| EU NIS2 Directive | 38 | 21 | 55% | 34 |
| UK Cyber Essentials | 10 | — | n/a — no reference crosswalk; analyst-mapped | — |
| NIST SP 800-171 Rev. 3 (CUI) | 126 | 102 | 81% | 126 |
| GLBA FTC Safeguards Rule | 29 | 16 | 55% | 18 |
| NYDFS Cybersecurity Regulation | 41 | 39 | 95% | 57 |
| SEC Cybersecurity Disclosure Rules | 12 | 6 | 50% | 10 |
| Sarbanes-Oxley Act — IT General Controls | 20 | 1 | 5% | 1 |
| California Consumer Privacy Act (as amended by CPRA) | 17 | — | n/a — no reference crosswalk; analyst-mapped | — |
| CERT-In Directions under Section 70B(6) of the IT Act | 9 | — | n/a — no reference crosswalk; analyst-mapped | — |
| India IT (Reasonable Security Practices and SPDI) Rules | 18 | 9 | 50% | 1 |
| **Total** | **1594** | **1037** | **65%** | |

Reference suggestions that remain open were reviewed and rejected as over-mapping: typically program-level reference controls
(e.g. "governance policy") that the reference links to every standard of a framework, where the library assigns a more specific control.

## 2. Relationship types (NIST IR 8477 STRM)

| Relationship | Meaning | Links |
|---|---|---:|
| = Equal | Requirement and control have the same scope. | 51 |
| ⊂ Subset of | Requirement is fully contained in the control — implementing the control covers it. | 581 |
| ⊃ Superset of | Requirement is broader — the control covers part of it alongside the other mapped controls. | 939 |
| ∩ Intersects | Control supports part of the requirement; it is not required for coverage. | 23 |

## 3. Coverage completeness

Every catalogued requirement must be addressable by the library: either by a fully-covering control (=, ⊂) or by a composite of partial controls (⊃).

| Framework | Requirements | Full | Composite | Supportive only |
|---|---:|---:|---:|---:|
| ISO/IEC 27001:2022 | 123 | 81 | 42 | 0 |
| SOC 2 Trust Services Criteria | 61 | 26 | 35 | 0 |
| NIST Cybersecurity Framework 2.0 | 106 | 68 | 38 | 0 |
| NIST SP 800-53 Rev. 5 | 100 | 63 | 37 | 0 |
| HIPAA Security & Breach Notification Rules | 66 | 55 | 11 | 0 |
| PCI DSS v4.0.1 | 63 | 32 | 31 | 0 |
| EU General Data Protection Regulation | 36 | 28 | 8 | 0 |
| CIS Critical Security Controls v8.1 | 79 | 68 | 11 | 0 |
| India Digital Personal Data Protection Act | 20 | 16 | 4 | 0 |
| ISO/IEC 42001:2023 AI Management System | 65 | 33 | 32 | 0 |
| EU Artificial Intelligence Act | 20 | 15 | 5 | 0 |
| ISO 22301:2019 Business Continuity Management | 32 | 19 | 13 | 0 |
| EU Digital Operational Resilience Act | 20 | 5 | 15 | 0 |
| EU NIS2 Directive | 18 | 4 | 14 | 0 |
| UK Cyber Essentials | 5 | 2 | 3 | 0 |
| NIST SP 800-171 Rev. 3 (CUI) | 97 | 71 | 26 | 0 |
| GLBA FTC Safeguards Rule | 17 | 8 | 9 | 0 |
| NYDFS Cybersecurity Regulation | 16 | 3 | 13 | 0 |
| SEC Cybersecurity Disclosure Rules | 5 | 0 | 5 | 0 |
| Sarbanes-Oxley Act — IT General Controls | 16 | 12 | 4 | 0 |
| California Consumer Privacy Act (as amended by CPRA) | 14 | 11 | 3 | 0 |
| CERT-In Directions under Section 70B(6) of the IT Act | 7 | 5 | 2 | 0 |
| India IT (Reasonable Security Practices and SPDI) Rules | 12 | 7 | 5 | 0 |
