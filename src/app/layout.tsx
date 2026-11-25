import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "abhedit UCM — Unified Compliance Control Mapper", template: "%s · abhedit UCM" },
  description:
    "Map one control across ISO 27001, SOC 2, NIST CSF 2.0, NIST 800-53, HIPAA, PCI DSS 4.0, GDPR, CIS v8 and India DPDP. Implement once, comply many.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen font-sans">{children}</body>
    </html>
  );
}
