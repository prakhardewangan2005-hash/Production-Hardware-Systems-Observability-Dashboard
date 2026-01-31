import React from "react";
import { FleetNode } from "../lib/fleet";

export type SortKey =
  | "node_id"
  | "zone"
  | "rack"
  | "status"
  | "failure_class"
  | "health_score"
  | "cpu_temp_c"
  | "power_w"
  | "fan_rpm"
  | "throttle_events"
  | "ecc_errors"
  | "nic_errors"
  | "reboot_count"
  | "last_seen";

export function FleetTable({
  rows,
  sortKey,
  sortDir,
  onSortChange,
  selectedNodeId,
  onSelectNode,
}: {
  rows: FleetNode[];
  sortKey: SortKey;
  sortDir: "asc" | "desc";
  onSortChange: (k: SortKey) => void;
  selectedNodeId: string | null;
  onSelectNode: (id: string) => void;
}) {
  const sortIndicator = (k: SortKey) =>
    sortKey === k ? (sortDir === "asc" ? " ▲" : " ▼") : "";

  const th = (k: SortKey, label: string) => (
    <th onClick={() => onSortChange(k)}>
      {label}
      {sortIndicator(k)}
    </th>
  );

  const dotClass = (status: FleetNode["status"]) =>
    status === "HEALTHY" ? "ok" : status === "DEGRADED" ? "warn" : "danger";

  return (
    <div className="tableWrap">
      <table className="table">
        <thead>
          <tr>
            {th("node_id", "Node")}
            {th("zone", "Zone")}
            {th("rack", "Rack")}
            {th("status", "Status")}
            {th("failure_class", "Failure Class")}
            {th("health_score", "Health")}
            {th("cpu_temp_c", "CPU °C")}
            {th("power_w", "Power W")}
            {th("fan_rpm", "Fan RPM")}
            {th("ecc_errors", "ECC")}
            {th("nic_errors", "NIC")}
            {th("reboot_count", "Reboots")}
            {th("last_seen", "Last Seen")}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const selected = r.node_id === selectedNodeId;
            return (
              <tr
                key={r.node_id}
                className={selected ? "rowSelected" : ""}
                onClick={() => onSelectNode(r.node_id)}
                style={{ cursor: "pointer" }}
              >
                <td className="mono">{r.node_id}</td>
                <td className="mono">{r.zone}</td>
                <td className="mono">{r.rack}</td>
                <td>
                  <span className="statusDot">
                    <span className={`dot ${dotClass(r.status)}`} />
                    <span className="mono">{r.status}</span>
                  </span>
                </td>
                <td>
                  <span className="tag">{r.failure_class}</span>
                </td>
                <td className="mono">{r.health_score}</td>
                <td className="mono">{r.cpu_temp_c.toFixed(1)}</td>
                <td className="mono">{r.power_w.toFixed(0)}</td>
                <td className="mono">{r.fan_rpm.toFixed(0)}</td>
                <td className="mono">{r.ecc_errors}</td>
                <td className="mono">{r.nic_errors}</td>
                <td className="mono">{r.reboot_count}</td>
                <td className="mono">{new Date(r.last_seen).toLocaleTimeString()}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
