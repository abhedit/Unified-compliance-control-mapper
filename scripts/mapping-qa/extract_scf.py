# Extract normalized SCF -> framework references from a locally downloaded SCF workbook.
# Usage: python3 scripts/mapping-qa/extract_scf.py <scf.xlsx> <out.json>
# The SCF is licensed CC BY-ND 4.0 by the SCF Council; its data is used only as a
# reference for auditing and is NOT redistributed in this repository.
import sys, json, re, openpyxl
src, out = sys.argv[1], sys.argv[2]
wb = openpyxl.load_workbook(src, read_only=True)
ws = wb["SCF 2026.3"]
def toks(v): return [t.strip() for t in str(v).split("\n") if t.strip()] if v else []
def n_soc2(t):
    t = re.sub(r"-POF\d+$", "", t)
    return t if re.fullmatch(r"(CC\d\.\d+|A1\.\d|C1\.\d|PI1\.\d|P\d\.\d)", t) else None
def n_cis(t): return t if re.fullmatch(r"\d+\.\d+", t) and not t.endswith(".0") else None
def n_iso_cl(t):
    t = re.sub(r"\(.*$", "", t)
    return t if re.fullmatch(r"(4|5|6|7|8|9|10)(\.\d+)*", t) and t not in ("4","5","6","7","8","9","10") else None
def n_iso_a(t): return "A." + t if re.fullmatch(r"[5-8]\.\d+", t) else None
def n_800(t):
    m = re.fullmatch(r"([A-Z]{2})-0*(\d+)(\(.*\))?", t)
    return f"{m.group(1)}-{m.group(2)}" if m else None
def n_csf(t): return t if re.fullmatch(r"[A-Z]{2}\.[A-Z]{2}-\d\d", t) else None
def n_pci(t):
    m = re.match(r"^(\d+)\.(\d+)", t)
    return f"{m.group(1)}.{m.group(2)}" if m else None
def n_hipaa(t): return t.replace("§", "").strip() or None
def n_gdpr(t):
    m = re.match(r"Article (\d+)", t)
    return f"Art. {m.group(1)}" if m else None
def n_dpdp(t):
    m = re.match(r"^(\d+)(\((\d+)\))?", t)
    if not m: return None
    return f"Sec. 8({m.group(3)})" if m.group(1) == "8" and m.group(3) else f"Sec. {m.group(1)}"
def n_iso_mgmt(t):  # ISO management-system clauses and Annex A (42001 / 22301)
    t = re.sub(r"\(.*$", "", t)
    return t if re.fullmatch(r"(A\.)?\d+(\.\d+)+", t) else None
def n_171(t):
    m = re.match(r"^(\d\d\.\d\d\.\d\d)", t)
    return m.group(1) if m else None
def n_nis2(t):
    m = re.match(r"Article (\d+)\.(\d+)(\(\w+\))?", t)
    return f"Art. {m.group(1)}({m.group(2)}){m.group(3) or ''}" if m else None
def n_eu_article(t):
    m = re.match(r"Article (\d+)", t)
    return f"Art. {m.group(1)}" if m else None
def n_keep(t): return t.strip() or None
def n_sec(t):
    if t.startswith("Form 8-K Item 1.05"): return "8-K 1.05"
    return t.replace("17 CFR ", "").strip()
def n_spdi(t):
    m = re.match(r"^(\d+)(\.0)?(.*)$", t)
    return f"Rule {m.group(1)}{m.group(3)}" if m else None
COLS = {"soc2": [(48, n_soc2)], "cisv8": [(51, n_cis)], "iso27001": [(74, n_iso_cl), (75, n_iso_a)], "nist80053": [(91, n_800)],
        "csf2": [(116, n_csf)], "pci4": [(121, n_pci)], "hipaa": [(176, n_hipaa)], "gdpr": [(232, n_gdpr)], "dpdp": [(283, n_dpdp)],
        "iso42001": [(82, n_iso_mgmt)], "iso22301": [(73, n_iso_mgmt)], "nist800171": [(109, n_171)], "nis2": [(233, n_nis2)],
        "dora": [(229, n_eu_article)], "euaiact": [(226, n_eu_article)], "glba": [(175, n_keep)], "nydfs": [(202, n_keep)],
        "seccyber": [(184, n_sec)], "sox": [(178, n_keep)], "itspdi": [(284, n_spdi)]}
controls, universe, raw_hipaa = [], {k: set() for k in COLS}, set()
for row in ws.iter_rows(min_row=2, values_only=True):
    if not row[2]: continue
    refs = {}
    for fw, specs in COLS.items():
        s = set()
        for col, fn in specs:
            for t in toks(row[col]):
                v = fn(t)
                if v: s.add(v)
        if s: refs[fw] = sorted(s); universe[fw] |= s
    controls.append({"id": row[2], "domain": row[0], "name": row[1], "desc": (row[3] or "").strip(), "refs": refs})
json.dump({"version": "SCF 2026.3", "controls": controls, "universe": {k: sorted(v) for k, v in universe.items()}}, open(out, "w"), indent=0)
print(len(controls), "controls"); [print(k, len(v)) for k, v in universe.items()]
