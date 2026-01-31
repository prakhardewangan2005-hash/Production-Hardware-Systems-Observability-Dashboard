import React from "react";
import { FleetEvent } from "../lib/fleet";

function fmt(ts: number) {
  const d = new Date(ts);
  return `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`;
}

export function Timeline(props: { events: FleetEvent[] }) {
  return (
    <div className="panel">
      <div className="panel__header">
        <div className="panel__title">Event Timeline</div>
        <div className="panel__subtitle">Last 20 state changes / runs</div>
      </div>

      <div className="timeline">
        {props.events.map((e, idx) => {
          const sevClass =
            e.severity === "CRIT" ? "sev--crit" : e.severity === "WARN" ? "sev--warn" : "sev--info";
          return (
            <div className="tItem" key={idx}>
              <div className={`sev ${sevClass}`} />
              <div className="tBody">
                <div className="tTop">
                  <span className="tTitle">{e.title}</span>
                  <span className="tTime">{fmt(e.ts)}</span>
                </div>
                <div className="tDetail">{e.detail}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
