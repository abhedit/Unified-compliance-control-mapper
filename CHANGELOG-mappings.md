# Mapping changelog: Unified Control Library

## 2026.11 (extended coverage)

**14 new frameworks, 9 → 23**
- **AI governance:** ISO/IEC 42001:2023 (clauses and all 38 Annex A controls) and the EU AI Act.
- **Resilience:** ISO 22301:2019 and DORA.
- **EU:** the NIS2 Directive.
- **UK:** Cyber Essentials.
- **US:** NIST SP 800-171 Rev. 3 (all 97 requirements, official NIST OSCAL titles), the GLBA Safeguards Rule, NYDFS 23 NYCRR 500, the SEC cybersecurity disclosure rules, SOX §302/§404 with ITGC domains, and CCPA/CPRA.
- **India:** the CERT-In Directions 2022 and the IT (SPDI) Rules 2011.

**New controls (11)**
- AIG-01 to AIG-09 cover AI governance: policy and literacy, inventory and risk tier, risk and impact assessment, data governance, lifecycle and documentation, monitoring and human oversight, transparency, the AI value chain, and serious-incident reporting.
- CMP-06 covers regulatory certifications and filings.
- CMP-07 covers statutory subscriber record retention.
- INC-04 now lists the CERT-In, NIS2, NYDFS, DORA and SEC notification deadlines.

**Process**
- 540 new links. Where SCF covers the regime, they were derived from SCF anchors; every proposal was then reviewed per requirement, and broad program-level proposals were rejected as over-mapping. Regimes without a reference crosswalk were mapped by an analyst.
- The library now stands at 1,594 links, with 1,037 (65%) corroborated by SCF 2026.3.
- New applicability assessment, which shows mandatory, expected and recommended frameworks for a given company profile.

## 2026.11

**Methodology**
- Every link now carries a relationship type from NIST IR 8477 Set Theory Relationship Mapping (STRM): `=` equal, `⊂` subset of, `⊃` superset of, `∩` intersects with. 35 controls have explicit relationships; the rest are derived by the documented rule.
- All controls are now anchored to Secure Controls Framework 2026.3 controls. 688 of 1,054 links (65%) are independently corroborated; the rest are analyst-asserted and were reviewed. See `docs/mapping-qa-report.md`.
- New CI integrity gates R1–R7 (`npm run validate-data`).
- Readiness scoring now follows the relationship types: fully-covering controls satisfy a requirement on their own, and supportive (`∩`) controls never block one.
- Marking a control Not applicable now requires a justification (ISO/IEC 27001 §6.1.3(d)).

**Catalog changes**
- ISO/IEC 27001:2022: added 4.4, 6.1.1, 6.3, 7.1, 8.2, 8.3. Split 7.5 into 7.5.1–7.5.3, 9.2 into 9.2.1–9.2.2 and 9.3 into 9.3.1–9.3.3, matching the 2022 numbering. Now 123 entries: 30 clauses plus 93 Annex A controls.
- SOC 2: added P3.2, P6.2, P6.5 and P6.7. All 61 criteria are now included.
- NIST CSF 2.0: added GV.RM-05, GV.RM-07, GV.SC-03, GV.SC-09, ID.RA-09, RS.AN-08 and RC.RP-04. All 106 subcategories are now included.
- NIST SP 800-53 r5: titles verified against the NIST OSCAL catalog.
- HIPAA: added §164.306(a), the remaining §164.308 standards and implementation specifications, all of §164.310(a)(2) and (d)(2), §164.312(c)(2) and (e)(2), §164.314(a)(1), §164.316(b)(1)(i)–(ii) and (b)(2)(ii)–(iii), and §164.406.
- PCI DSS v4.0.1: added the x.1 governance requirements (1.1–11.1), plus 2.3, 3.3, 8.5, 11.2 and 12.9. All 63 second-level requirements are now included.
- GDPR: added Art. 8, 10, 14, 18, 19, 22, 27, 29, 31, 36, 38, 39, 45 and 49.
- CIS Controls: upgraded to v8.1. All 56 IG1 safeguards are now included, plus 9.5.
- India DPDP Act: added Sec. 8(1), 8(3), 8(9) and 14.

**Control changes**
- New control **NET-05 Email security and anti-phishing**, which closes PCI DSS 5.4 and CIS 9.5.
- Removed 7 tangential links:
  - PHY-04 → PR.AA-05 and CC6.8
  - GOV-05 → PCI 7.2
  - AST-05 → CC6.5
  - CMP-05 → CC5.2
  - IAM-08 → PCI 6.2
  - LOG-04 → CC7.2
  - INC-03 → PCI 10.2
- Accepted about 150 reference-corroborated links after review.

## 2026.10
- Initial library: 91 controls, 907 links across 9 frameworks.
