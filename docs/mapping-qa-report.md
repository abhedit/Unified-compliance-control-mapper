# Mapping QA report

Generated 2026-11-25 for Unified Control Library **v2026.11** (92 controls, 1054 mapping links) against **SCF 2026.3**.
See [MAPPING_METHODOLOGY.md](../MAPPING_METHODOLOGY.md) for the procedure.

## 1. Independent corroboration

A link is *corroborated* when the reference crosswalk, reached through the control's SCF anchor controls, maps the same requirement.
Links not corroborated are analyst-asserted and were individually reviewed (see methodology §5).

| Framework | Links | Corroborated | Rate | Reference suggestions reviewed |
|---|---:|---:|---:|---:|
| ISO/IEC 27001:2022 | 184 | 129 | 70% | 103 |
| SOC 2 Trust Services Criteria | 157 | 103 | 66% | 158 |
| NIST Cybersecurity Framework 2.0 | 174 | 90 | 52% | 93 |
| NIST SP 800-53 Rev. 5 | 153 | 101 | 66% | 55 |
| HIPAA Security & Breach Notification Rules | 79 | 39 | 49% | 51 |
| PCI DSS v4.0.1 | 134 | 118 | 88% | 104 |
| EU General Data Protection Regulation | 54 | 28 | 52% | 9 |
| CIS Critical Security Controls v8.1 | 90 | 64 | 71% | 39 |
| India Digital Personal Data Protection Act | 29 | 16 | 55% | 12 |
| **Total** | **1054** | **688** | **65%** | |

Reference suggestions that remain open were reviewed and rejected as over-mapping: typically program-level reference controls
(e.g. "governance policy") that the reference links to every standard of a framework, where the library assigns a more specific control.

## 2. Relationship types (NIST IR 8477 STRM)

| Relationship | Meaning | Links |
|---|---|---:|
| = Equal | Requirement and control have the same scope. | 42 |
| ⊂ Subset of | Requirement is fully contained in the control — implementing the control covers it. | 395 |
| ⊃ Superset of | Requirement is broader — the control covers part of it alongside the other mapped controls. | 594 |
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
