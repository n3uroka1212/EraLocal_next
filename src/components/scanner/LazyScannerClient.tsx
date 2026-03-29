"use client";

import dynamic from "next/dynamic";

const ScannerClient = dynamic(
  () =>
    import("@/components/merchant/scanner/ScannerClient").then(
      (m) => m.ScannerClient,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="h-[300px] bg-[var(--bg3)] rounded-xl animate-pulse flex items-center justify-center">
        <p className="text-sm text-[var(--text2)]">Chargement du scanner...</p>
      </div>
    ),
  },
);

export { ScannerClient as LazyScannerClient };
