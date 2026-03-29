"use client";

import dynamic from "next/dynamic";

const MapView = dynamic(
  () => import("./MapView").then((m) => m.MapView),
  {
    ssr: false,
    loading: () => (
      <div className="h-[400px] bg-[var(--bg3)] rounded-xl animate-pulse" />
    ),
  },
);

export { MapView as LazyMapView };
