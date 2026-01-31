import React from "react";
import { FailureClass, HealthStatus, ValidationRun } from "../lib/fleet";

export function ControlsBar({
  statusFilter,
  onStatusFilter,
  failureFilter,
  onFailureFilter,
  onRegenerate,
  onRunValidation,
  onDownloadCSV,
  onDownloadReport,
  latestRun,
}: {
  statusFilter: HealthStatus | "ALL";
  onStatusFilter: (v: HealthStatus | "ALL") => void;
  failureFilter: FailureClass | "ALL";
  onFailureFilter: (v: FailureClass | "ALL") => void;
  onRegenerate: () => void;
  onRunValidation: () => void;
  onDownloadCSV: () => void;
  onDownloadReport: () => void;
  latestRun: ValidationRun | null;
}) {
  return (
    <div className="controls">
      <div className="controlGroup">
        <select
          className="select"
          value={statusFilter}
          onChange={(e) => onStatusFilter(e.target.value as any)}
        >
          <option value="ALL">Status: All</option>
          <option value="HEALTHY">Status: Healthy</option>
          <option value="DEGRADED">Status: Degraded</option>
          <option value="CRITICAL">Status: Critical</option>
        </select>

        <select
          className="select"
          value={failureFilter}
          onChange={(e) => onFailureFilter(e.target.value as any)}
        >
          <option value="ALL">Failure: All</option>
          <option value="NONE">Failure: NONE</option>
          <option value="THERMAL_THROTTLE">Failure: THERMAL_THROTTLE</option>
          <option value="POWER_SPIKE">Failure: POWER_SPIKE</option>
          <option value="ECC_BURST">Failure: ECC_BURST</option>
          <option value="NIC_FLAP">Failure: NIC_FLAP</option>
          <option value="BOOT_LOOP">Failure: BOOT_LOOP</option>
        </select>
      </div>

      <div className="controlGroup">
        <button className="button ghost" onClick={onRegenerate}>
          Regenerate Telemetry
        </button>
        <button className="button primary" onClick={onRunValidation}>
          Run Validation Suite
        </button>
        <button className="button warn" onClick={onDownloadCSV}>
          Download CSV
        </button>
        <button className="button ghost" onClick={onDownloadReport}>
          Download Report
        </button>
      </div>

      <div className="runMeta">
        {latestRun ? (
          <>
            <span className="mono">
              last_run={latestRun.run_id.slice(0, 8)}
            </span>
            <span>•</span>
            <span>
              {latestRun.summary.overall_pass ? "PASS" : "FAIL"}{" "}
              (pass={latestRun.summary.pass_count}, fail={latestRun.summary.fail_count})
            </span>
          </>
        ) : (
          <span>Run a suite to generate a validation summary.</span>
        )}
      </div>
    </div>
  );
}
