import React from "react";
import { FleetEvent } from "../lib/fleet";

export function Timeline({ events }: { events: FleetEvent[] }) {
  return (
    <div className="timeline">
      {events.length === 0 ? (
        <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, padding: 10 }}>
          No events yet. Regenerate telemetry or run a validation suite.
        </div>
      ) : (
        events.map((e, idx) => {
          const sevClass =
            e.severity === "CRIT" ? "sevCrit" : e.severity === "WARN" ? "sevWarn" : "sevInfo";
          return (
            <div className="event" key={`${e.ts}-${idx}`}>
              <div className="eventTime">{new Date(e.ts).toLocaleTimeString()}</div>
              <div>
                <div className={`eventTitle ${sevClass}`}>
                  [{e.severity}] {e.title}
                </div>
                <div className="eventDetail">{e.detail}</div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
