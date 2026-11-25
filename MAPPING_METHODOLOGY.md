# Mapping methodology: Abhedit Unified Control Library

This document describes how Abhedit Control Mapper builds, maps, verifies and maintains its control library. The procedure follows the practices used by enterprise GRC programmes and the large compliance-automation platforms:

- **one common control framework**
- **standards-based relationship typing**
- **independent corroboration against a reference crosswalk**
- **automated integrity gates**
- **versioned change control**

Current metrics are in [`docs/mapping-qa-report.md`](docs/mapping-qa-report.md). Mapping changes are in [`CHANGELOG-mappings.md`](CHANGELOG-mappings.md).

---

## 1. Standards and references followed

| Reference | How it is used |
|---|---|
| **NIST IR 8477**, *Mapping Relationships Between Documentary Standards, Regulations, Frameworks, and Guidelines* | Every mapping link carries a Set Theory Relationship Mapping (STRM) type (§4). |
| **NIST OLIR** (Online Informative References) programme | Informs the "focal document element → reference element" structure and the relationship vocabulary. |
| **Secure Controls Framework (SCF) 2026.3**, a metaframework that maps to 250+ laws, regulations and frameworks | Each unified control is anchored to SCF controls. SCF's crosswalk independently corroborates or challenges each mapping (§5). The SCF is used as a reference only and is not redistributed. |
| **NIST SP 800-53 Rev. 5 OSCAL catalog** (usnistgov/oscal-content) | Source of the official 800-53 control identifiers and titles. |
| **ISO/IEC 27001:2022 §6.1.3(d)** | Statement of Applicability rules: exclusions require justification (§8). |
| Official framework publications (ISO/IEC, AICPA, NIST, HHS, PCI SSC, EU, CIS, Government of India) | Define each requirement catalog (§3). |

## 2. Architecture: a common control framework

Mapping framework A directly to B, B to C, and so on needs N² pairwise crosswalks, and they drift apart. Instead, every framework requirement is mapped **once** to a small set of **unified controls**. Equivalence between any two frameworks is then derived through the controls they share:

```
ISO 27001 A.8.5 ─┐                         ┌─ SOC 2 CC6.1
NIST CSF PR.AA-03 ┼──►  IAM-04 Multi-factor ◄┼─ PCI DSS 8.4
HIPAA 164.312(d) ─┘     authentication      └─ CIS 6.3 / 6.4 / 6.5
```

Each unified control has:
- a testable control statement
- a domain
- evidence guidance
- a review frequency
- an automation flag
- one or more **SCF anchor controls**

## 3. Step 1: authoritative source intake and catalog completeness

1. **Granularity.** Requirements are catalogued at the level auditors test:
   - ISO 27001 clauses and every Annex A control
   - SOC 2 criteria, excluding points of focus
   - CSF 2.0 subcategories
   - PCI DSS second-level requirements
   - HIPAA standards and implementation specifications
   - GDPR and DPDP articles and sections
   - CIS v8.1 safeguards
2. **Completeness check.** Each catalog is diffed against the requirement universe referenced by SCF 2026.3. Current status:
   - complete official sets for ISO 27001:2022, SOC 2 TSC, NIST CSF 2.0 (all 106 subcategories), PCI DSS v4.0.1 (all 63 second-level requirements), the HIPAA Security Rule and CIS IG1 (all 56 safeguards)
   - a declared selection for NIST 800-53 (base controls commonly selected for the moderate baseline) and for CIS IG2/IG3
   - **Extended regimes:** ISO 42001 and ISO 22301 use one representative entry per sub-clause family; reference sub-clauses roll up to their sibling. The EU AI Act covers the core organizational obligations (Articles 4–73). SOX uses §302/§404 plus the standard PCAOB AS 2201 ITGC domains. Every catalog declares its scope in the product (`scopeNote`).
   - **Not covered by the reference:** UK Cyber Essentials, CCPA statute sections and the CERT-In Directions have no reference crosswalk at catalog granularity. They are fully analyst-mapped and reported as such.
3. **Titles.**
   - NIST 800-53 titles come from the official OSCAL catalog.
   - Other titles are short paraphrases, because licensed standard text (e.g. ISO) is not reproduced.

## 3a. Applicability (which frameworks apply)

The applicability engine (`src/lib/applicability.ts`) turns a company profile into three groups:
- **mandatory:** law or regulation, or a binding contractual standard such as PCI DSS
- **expected:** routinely required by customers, partners or tenders
- **recommended:** baseline best practice

It covers headquarters, markets, industry, size, data types, listing status, licences and AI use. Every result carries the scope trigger that produced it, drawn from the published applicability provisions; for example, the GDPR's territorial scope, NIS2 sector and size thresholds, CCPA revenue and volume thresholds, and the CERT-In Directions' coverage of body corporates in India. Borderline cases are deliberately graded *expected* with a "confirm" note, never *mandatory*.

## 4. Step 2: mapping and relationship assignment (NIST IR 8477 STRM)

Each link is read as **"⟨requirement⟩ is ⟨relationship⟩ ⟨unified control⟩"**:

| Symbol | Relationship | Meaning | Coverage effect |
|:-:|---|---|---|
| = | **Equal** | Same scope | The control alone satisfies the requirement |
| ⊂ | **Subset of** | Requirement is fully contained in the control | The control alone satisfies the requirement |
| ⊃ | **Superset of** | Requirement is broader than the control | Satisfied only together with the requirement's other ⊃ controls (composite) |
| ∩ | **Intersects with** | The control supports part of the requirement | Supportive only; never required, never sufficient |

**How relationships are assigned**
- **Explicit (analyst):** `=` and `∩` links, plus any exception, are declared on the control (`rel`) and carry an implicit review record in version control.
- **Derived (rule):** when a requirement is served by exactly one non-supportive control, that link is `⊂`. When it is decomposed across several controls, each link is `⊃`. This follows from how requirements are decomposed: a requirement is split across controls only when no single control covers it.
- **Customer custom controls** default to `⊃`, which is conservative.

**Match strength between two requirements** is derived through each shared control:

| Strength | Rule |
|---|---|
| Equivalent | Both requirements are `=` to the control |
| Strong | Both requirements are fully covered (`=`/`⊂`) by the control |
| Partial | At least one side is `⊃` |
| Supporting | Either side is `∩`; hidden by default in the mapper |

## 5. Step 3: independent corroboration and two-pass review

This is the step large GRC vendors run before publishing a crosswalk.

1. **Anchor.** Each unified control is anchored to its equivalent SCF controls. Candidates are ranked by mapping-overlap and text similarity, then chosen by an analyst.
2. **Reconcile.** `scripts/mapping-qa/reconcile.ts` compares each control's links with the links implied by its SCF anchors, after rolling reference codes up to catalog granularity. The result falls into three groups:
   - **Corroborated:** present in both. Marked `✓ SCF` in the product.
   - **Analyst-only:** present only in the library. Each is reviewed against the requirement text and kept if the requirement's subject matter falls inside the control statement. Clearly tangential links were removed; in v2026.11 that was 7 links.
   - **Reference-only:** suggested by the reference, not in the library. Each was reviewed. Accepted when the requirement belongs to the control's scope (v2026.11 accepted about 150 links, such as PCI x.1 governance requirements, HIPAA implementation specs and CIS IG1 training safeguards). Rejected as over-mapping when the reference links a program-level control (e.g. "governance policy") to every standard of a framework while the library assigns a more specific control.
3. **Gap closure.** Requirements left with only supportive coverage are escalated. In v2026.11 this produced the new control **NET-05 Email security and anti-phishing** (PCI DSS 5.4, CIS 9.5) and placed CSF RS.MA-05.

## 6. Step 4: automated integrity gates (CI)

`npm run validate-data` runs on every commit and blocks the build if any rule fails:

| Rule | Check |
|---|---|
| R1 | Control IDs are unique |
| R2 | Every control has an SCF anchor and evidence guidance |
| R3 | Requirement codes are unique within each framework |
| R4 | Every mapped code exists in its framework catalog, with no duplicates |
| R5 | Every catalogued requirement is mapped, and has at least one non-supportive (`=`/`⊂`/`⊃`) mapping |
| R6 | Explicit relationships are valid STRM values and refer to existing links |
| R7 | Provenance entries refer to existing links (forces a QA re-run after mapping edits) |

## 7. Step 5: versioning and change management

- The library carries a version (`LIBRARY_VERSION`, e.g. `2026.11`). The API and exports report it.
- Every change to mappings is recorded in `CHANGELOG-mappings.md`, along with the framework or reference version that triggered it.
- **Re-review triggers:**
  - a new framework version (e.g. PCI DSS errata, CSF updates)
  - a new SCF release
  - customer or auditor feedback
- After any edit, re-run the QA reconcile. R7 enforces this.

## 8. Step 6: how readiness is computed (customer side)

Each requirement's status is derived from its controls:
- A requirement is **met** when any fully-covering control (`=`/`⊂`) is implemented, or when **all** required (`⊃`) controls are implemented.
- Supportive (`∩`) controls never block a requirement.
- Controls marked **Not applicable** require a written justification (ISO/IEC 27001 §6.1.3(d)). The justification flows into the exported **Statement of Applicability / gap report**.

## 9. Reproducing the QA

```bash
# 1. Download the SCF workbook (free, CC BY-ND 4.0) from securecontrolsframework.com or its GitHub repository
python3 scripts/mapping-qa/extract_scf.py secure-controls-framework-scf-2026-3.xlsx scf-reference.json
# 2. Reconcile, regenerate provenance and the QA report
node --experimental-strip-types scripts/mapping-qa/reconcile.ts scf-reference.json --detail
# 3. Gate
npm run validate-data
```

## 10. Limitations

- Mappings are reference crosswalks for planning and evidence reuse. They do not constitute legal advice, an audit opinion or a certification.
- Final scoping and relationship decisions should be confirmed by the organization's auditor or assessor. Analyst-asserted links are flagged so they can be reviewed first.
- Requirement titles are paraphrased. Licensed standards must be obtained from their publishers.
