// Compliance applicability engine: company profile -> which frameworks apply and why.
// Pure and client-safe. Rules encode the published scope triggers of each law/standard;
// results are a starting point for legal review, not legal advice.
import { FRAMEWORK_BY_ID, type FrameworkId } from "../data/frameworks.ts";

export type Market = "India" | "US" | "EU" | "UK" | "California";
export type Industry =
  | "saas"
  | "fintech"
  | "bank_insurance"
  | "healthcare"
  | "ecommerce"
  | "gov_contractor"
  | "critical_infra"
  | "manufacturing"
  | "other";
export type Size = "small" | "medium" | "large";

export interface CompanyProfile {
  hq: "India" | "US" | "EU" | "UK" | "Other";
  markets: Market[];
  industry: Industry;
  size: Size;
  b2bEnterprise: boolean; // sells to enterprise / regulated customers who run vendor security reviews
  personalData: boolean;
  sensitiveData: boolean; // health, biometric, financial, passwords, children
  phi: boolean; // US protected health information (covered entity or business associate)
  cardData: boolean; // stores/processes/transmits payment card data
  cui: boolean; // US Controlled Unclassified Information / DoD contracts
  federalCloud: boolean; // provides cloud services to US federal agencies (FedRAMP)
  usListed: boolean; // securities registered with the US SEC (or preparing to list)
  nydfsLicensed: boolean;
  caThresholds: boolean; // meets CCPA thresholds (> $25M revenue, 100k+ CA consumers, or 50% revenue from selling/sharing PI)
  aiProvider: boolean; // develops / places AI systems or models on the market
  aiDeployer: boolean; // uses AI systems in its operations or products
  ukGovSupplier: boolean;
  indiaCloudOrVpn: boolean; // data centre, VPS, cloud or VPN service provider in India
  continuityCritical: boolean; // customers or regulators expect certified business continuity
}

export const DEFAULT_PROFILE: CompanyProfile = {
  hq: "India",
  markets: ["India", "US"],
  industry: "saas",
  size: "small",
  b2bEnterprise: true,
  personalData: true,
  sensitiveData: false,
  phi: false,
  cardData: false,
  cui: false,
  federalCloud: false,
  usListed: false,
  nydfsLicensed: false,
  caThresholds: false,
  aiProvider: false,
  aiDeployer: false,
  ukGovSupplier: false,
  indiaCloudOrVpn: false,
  continuityCritical: false,
};

export type Level = "mandatory" | "expected" | "recommended";
export const LEVEL_META: Record<Level, { label: string; help: string }> = {
  mandatory: { label: "Mandatory", help: "Legal or regulatory obligation, or a binding contractual standard (e.g. PCI DSS for card data)." },
  expected: { label: "Expected by customers", help: "Not law for you, but customers, partners or tenders routinely require it." },
  recommended: { label: "Recommended", help: "Best-practice framework that strengthens your program and maps onto everything else." },
};

export interface Applicability {
  framework: FrameworkId;
  level: Level;
  reasons: string[];
}

export function assess(p: CompanyProfile): Applicability[] {
  const out = new Map<FrameworkId, Applicability>();
  const RANK: Record<Level, number> = { mandatory: 3, expected: 2, recommended: 1 };
  const add = (framework: FrameworkId, level: Level, reason: string) => {
    const cur = out.get(framework);
    if (!cur) out.set(framework, { framework, level, reasons: [reason] });
    else {
      if (RANK[level] > RANK[cur.level]) cur.level = level;
      cur.reasons.push(reason);
    }
  };
  const inMarket = (m: Market) => p.markets.includes(m) || (p.hq as string) === m;
  const financial = p.industry === "fintech" || p.industry === "bank_insurance";
  const usesAi = p.aiProvider || p.aiDeployer;

  // ── India
  if (p.hq === "India") {
    add("certin", "mandatory", "CERT-In Directions apply to body corporates and service providers operating ICT systems in India (6-hour incident reporting, 180-day logs).");
    if (p.sensitiveData) add("itspdi", "mandatory", "You handle sensitive personal data in India: IT Act §43A SPDI Rules apply until fully superseded by the DPDP Act.");
  } else if (inMarket("India")) {
    add("certin", "expected", "If you operate ICT systems or serve users in India, CERT-In reporting duties may apply — confirm with counsel.");
  }
  if (p.personalData && inMarket("India")) add("dpdp", "mandatory", "You process digital personal data in India or of individuals in India.");
  if (p.indiaCloudOrVpn) add("certin", "mandatory", "Cloud, VPS, data-centre and VPN providers in India must retain validated subscriber records for 5 years.");

  // ── EU
  if (p.personalData && inMarket("EU")) add("gdpr", "mandatory", "You are established in the EU or offer goods/services to people in the EU.");
  const nis2Sector = p.industry === "critical_infra" || p.industry === "manufacturing" || p.industry === "healthcare" || financial;
  if (inMarket("EU") && nis2Sector) {
    if (p.size === "small") add("nis2", "expected", "Your sector is in NIS2 scope; small entities are usually exempt unless designated — check national transposition. Customers in scope will flow down requirements.");
    else add("nis2", "mandatory", "Medium/large entity in a NIS2 sector (e.g. energy, transport, health, manufacturing, finance) operating in the EU.");
  }
  if (inMarket("EU") && (p.industry === "saas" || p.indiaCloudOrVpn) && p.size !== "small") {
    add("nis2", "expected", "Cloud computing, data-centre and managed (security) service providers serving the EU can be NIS2 entities — non-EU providers must designate an EU representative. Confirm your classification.");
  }
  if (inMarket("EU") && financial) add("dora", "mandatory", "EU financial entities must meet DORA ICT risk, incident reporting, testing and third-party requirements.");
  if (inMarket("EU") && p.b2bEnterprise && p.industry === "saas") add("dora", "expected", "EU financial-sector customers must flow DORA contractual provisions (Art. 30) down to their ICT providers.");
  if (usesAi && inMarket("EU")) {
    add("euaiact", "mandatory", p.aiProvider ? "You place AI systems or models on the EU market (provider obligations scale with risk tier)." : "You deploy AI systems in the EU (deployer obligations, AI literacy, transparency).");
  }

  // ── United States
  if (p.phi) add("hipaa", "mandatory", "You create, receive, maintain or transmit ePHI as a covered entity or business associate.");
  if (financial && inMarket("US")) add("glba", "mandatory", "US financial institutions (incl. non-bank fintechs) must comply with the FTC Safeguards Rule.");
  if (p.nydfsLicensed) add("nydfs", "mandatory", "You are licensed or regulated by the New York DFS.");
  if (p.usListed) {
    add("seccyber", "mandatory", "SEC registrants must disclose material incidents (8-K 1.05) and cyber governance annually (Reg S-K 106).");
    add("sox", "mandatory", "SOX §302/404 require effective internal control over financial reporting, supported by IT general controls.");
  }
  if (p.personalData && p.caThresholds) add("ccpa", "mandatory", "You do business in California and meet CCPA/CPRA thresholds.");
  if (p.cui) add("nist800171", "mandatory", "Handling CUI under DFARS 252.204-7012 / CMMC Level 2 requires NIST SP 800-171.");
  if (p.federalCloud) add("nist80053", "mandatory", "FedRAMP authorizations are based on NIST SP 800-53 baselines.");
  if (p.industry === "gov_contractor" && !p.cui) add("nist800171", "expected", "US federal and defence contracts frequently require NIST SP 800-171 / CMMC.");

  // ── UK
  if (p.ukGovSupplier) add("cyberessentials", "mandatory", "UK central government contracts handling personal data or ICT services require Cyber Essentials.");
  else if (inMarket("UK")) add("cyberessentials", "recommended", "Cyber Essentials is a low-cost UK baseline often requested by UK customers.");
  if (p.personalData && inMarket("UK")) add("gdpr", "mandatory", "The UK GDPR mirrors the EU GDPR for processing personal data of people in the UK.");

  // ── Industry standards
  if (p.cardData) add("pci4", "mandatory", "Storing, processing or transmitting payment card data requires PCI DSS (enforced by card brands and acquirers).");
  if (p.industry === "ecommerce" && !p.cardData) add("pci4", "expected", "Even with an outsourced payment page you must complete a PCI DSS SAQ (e.g. SAQ A).");

  // ── Customer-driven attestations
  if (p.b2bEnterprise) {
    if (inMarket("US")) add("soc2", "expected", "US enterprise customers routinely require a SOC 2 Type II report from vendors.");
    add("iso27001", "expected", "Enterprise and international customers (EU, India, APAC) commonly require ISO/IEC 27001 certification.");
  }
  if (financial || p.industry === "critical_infra" || p.continuityCritical) add("iso22301", "expected", "Regulated and critical-service customers expect certified business continuity (ISO 22301).");
  if (p.aiProvider && p.b2bEnterprise) add("iso42001", "expected", "Enterprise buyers increasingly ask AI vendors for ISO/IEC 42001 AI management certification.");
  else if (usesAi) add("iso42001", "recommended", "ISO/IEC 42001 provides a governance structure for responsible AI use.");

  // ── Baselines (always useful)
  add("csf2", "recommended", "NIST CSF 2.0 is the common language for board reporting and program maturity.");
  add("cisv8", "recommended", "CIS Controls IG1 is the minimum essential cyber hygiene for every organization.");
  if (!out.has("iso27001")) add("iso27001", "recommended", "ISO/IEC 27001 is the global ISMS benchmark and maps to every other framework here.");

  const LEVEL_ORDER: Level[] = ["mandatory", "expected", "recommended"];
  return [...out.values()].sort(
    (a, b) => LEVEL_ORDER.indexOf(a.level) - LEVEL_ORDER.indexOf(b.level) || FRAMEWORK_BY_ID[a.framework].name.localeCompare(FRAMEWORK_BY_ID[b.framework].name),
  );
}
