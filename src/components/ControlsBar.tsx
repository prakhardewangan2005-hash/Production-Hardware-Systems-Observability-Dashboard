import React from "react";
import { FailureClass, HealthStatus } from "../lib/fleet";

export function ControlsBar(props: {
  statusFilter: HealthStatus | "ALL";
  failureFilter: FailureClass | "ALL";
  query: string;

  onChangeStatus: (v: HealthStatus | "ALL") => void;
  onChangeFailure: (v: FailureClass | "ALL") => void;
  onChangeQuery: (v: string) => void;

  onRegenerate: () => void;
  onRunValidation: () => void;
  onDownloadCsv: () => void;
  onDownloadReport: () => void;

  lastUpdated: string;
  lastRun: string;
  passFail: string;
}) {
  return (
    <div className="controls">
      <div className="controls__row">
        <div className="controls__group">
          <label className="label">Status</label>
          <select
            className="select"
            value={props.statusFilter}
            onChange={(e) => props.onChangeStatus(e.target.value as any)}
          >
            <option value="ALL">All</option>
            <option value="HEALTHY">HEALTHY</option>
            <option value="DEGRADED">DEGRADED</option>
            <option value="CRITICAL">CRITICAL</option>
          </select>
        </div>

        <div className="controls__group">
          <label className="label">Failure Class</label>
          <select
            className="select"
            value={props.failureFilter}
            onChange={(e) => props.onChangeFailure(e.target.value as any)}
          >
            <option value="ALL">All</option>
            <option value="NONE">NONE</option>
            <option value="THERMAL_THROTTLE">THERMAL_THROTTLE</option>
            <option value="POWER_SPIKE">POWER_SPIKE</option>
            <option value="ECC_BURST">ECC_BURST</option>
            <option value="NIC_FLAP">NIC_FLAP</option>
            <option value="BOOT_LOOP">BOOT_LOOP</option>
          </select>
        </div>

        <div className="controls__group controls__group--grow">
          <label className="label">Search</label>
          <input
            className="input"
            value={props.query}
            onChange={(e) => props.onChangeQuery(e.target.value)}
            placeholder="node_id, rack, zone, status, failure…"
          />
        </div>

        <div className="controls__stats">
          <div className="stat">
            <span className="stat__k">Updated</span>
            <span className="stat__v">{props.lastUpdated}</span>
          </div>
          <div className="stat">
            <span className="stat__k">Last Run</span>
            <span className="stat__v">{props.lastRun}</span>
          </div>
          <div className={`stat stat--pf ${props.passFail === "FAIL" ? "isFail" : props.passFail === "PASS" ? "isPass" : ""}`}>
            <span className="stat__k">Suite</span>
            <span className="stat__v">{props.passFail}</span>
          </div>
        </div>
      </div>

      <div className="controls__row controls__row--buttons">
        <button className="btn btn--ghost" onClick={props.onRegenerate}>
          Regenerate Telemetry
        </button>
        <button className="btn btn--primary" onClick={props.onRunValidation}>
          Run Validation Suite
        </button>
        <div className="controls__spacer" />
        <button className="btn btn--ghost" onClick={props.onDownloadCsv}>
          Download CSV
        </button>
        <button className="btn btn--ghost" onClick={props.onDownloadReport}>
          Download Report (MD)
        </button>
      </div>
    </div>
  );
}
