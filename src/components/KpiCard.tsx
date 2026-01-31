import React from "react";

type Tone = "neutral" | "ok" | "warn" | "danger";

export function KpiCard(props: { title: string; value: string; hint: string; tone: Tone }) {
  const toneClass =
    props.tone === "ok"
      ? "kpi--ok"
      : props.tone === "warn"
      ? "kpi--warn"
      : props.tone === "danger"
      ? "kpi--danger"
      : "kpi--neutral";

  return (
    <div className={`kpi ${toneClass}`}>
      <div className="kpi__top">
        <div className="kpi__title">{props.title}</div>
        <div className="kpi__badge">{props.tone.toUpperCase()}</div>
      </div>
      <div className="kpi__value">{props.value}</div>
      <div className="kpi__hint">{props.hint}</div>
    </div>
  );
}
