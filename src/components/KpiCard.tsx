import React from "react";

type Emphasis = "neutral" | "warn" | "danger";

export function KpiCard({
  label,
  value,
  hint,
  emphasis = "neutral",
}: {
  label: string;
  value: string;
  hint: string;
  emphasis?: Emphasis;
}) {
  const accent =
    emphasis === "danger"
      ? "rgba(255, 91, 91, 0.22)"
      : emphasis === "warn"
      ? "rgba(255, 189, 46, 0.18)"
      : "rgba(255, 255, 255, 0.04)";

  const border =
    emphasis === "danger"
      ? "rgba(255, 91, 91, 0.25)"
      : emphasis === "warn"
      ? "rgba(255, 189, 46, 0.22)"
      : "rgba(255, 255, 255, 0.08)";

  return (
    <div
      style={{
        background: accent,
        border: `1px solid ${border}`,
        borderRadius: 18,
        padding: "14px 14px",
        boxShadow: "0 16px 40px rgba(0,0,0,0.35)",
      }}
    >
      <div style={{ color: "rgba(255,255,255,0.65)", fontSize: 12.5, fontWeight: 700 }}>
        {label}
      </div>
      <div style={{ marginTop: 10, fontSize: 28, fontWeight: 850, letterSpacing: 0.2 }}>
        {value}
      </div>
      <div style={{ marginTop: 10, color: "rgba(255,255,255,0.55)", fontSize: 12.5 }}>
        {hint}
      </div>
    </div>
  );
}
