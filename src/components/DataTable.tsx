import React from "react";
import { FleetNode } from "../lib/fleet";

export type SortKey =
  | "node_id"
  | "zone"
  | "rack"
  | "cpu_temp_c"
  | "power_w"
  | "fan_rpm"
  | "throttle_events"
  | "ecc_errors"
  | "nic_errors"
  | "reboot_count"
  | "status"
  | "failure_class"
  | "health_score";

export type SortDir = "asc" | "desc";

function headerLabel(key: SortKey) {
  switch (key) {
    case "node_id":
      return "Node";
    case "zone":
      return "Zone";
    case "rack":
      return "Rack";
    case "cpu_temp_c":
      return "CPU °C";
    case "power_w":
      return "Power W";
    case "fan_rpm":
      return "Fan RPM";
    case "throttle_events":
      return "Throttle";
    case "ecc_errors":
      return "ECC";
    case "nic_errors":
      return "NIC";
    case "reboot_count":
      return "Reboots";
    case "status":
      return "Status";
    case "failure_class":
      return "Failure";
    case "health_score":
      return "Score";
  }
}

export function DataTable(props: {
  rows: FleetNode[];
  sortKey: SortKey;
  sortDir: SortDir;
  onSort: (k: SortKey) => void;
}) {
  const cols: SortKey[] = [
    "node_id",
    "zone",
    "rack",
    "status",
    "failure_class",
    "health_score",
    "cpu_temp_c",
    "power_w",
    "fan_rpm",
    "throttle_events",
    "ecc_errors",
    "nic_errors",
    "reboot_count",
  ];

  return (
    <div className="tableWrap">
      <table className="table">
        <thead>
          <tr>
            {cols.map((c) => {
              const active = c === props.sortKey;
              return (
                <th
                  key={c}
                  className={`th ${active ? "th--active" : ""}`}
                  onClick={() => props.onSort(c)}
                  title="Click to sort"
                >
                  <span className="th__label">{headerLabel(c)}</span>
                  <span className="th__sort">
                    {active ? (props.sortDir === "asc" ? "▲" : "▼") : "↕"}
                  </span>
                </th>
              );
            })}
          </tr>
        </thead>

        <tbody>
          {props.rows.map((r) => {
            const rowTone = r.status === "CRITICAL" ? "row--crit" : r.status === "DEGRADED" ? "row--warn" : "";
            return (
              <tr key={r.node_id} className={`tr ${rowTone}`}>
                <td className="td td--mono">{r.node_id}</td>
                <td className="td td--mono">{r.zone}</td>
                <td className="td td--mono">{r.rack}</td>
                <td className={`td td--pill pill pill--${r.status}`}>{r.status}</td>
                <td className={`td td--pill pill pill--failure`}>{r.failure_class}</td>
                <td className="td td--num">{r.health_score}</td>
                <td className="td td--num">{r.cpu_temp_c.toFixed(1)}</td>
                <td className="td td--num">{r.power_w.toFixed(0)}</td>
                <td className="td td--num">{r.fan_rpm.toFixed(0)}</td>
                <td className="td td--num">{r.throttle_events}</td>
                <td className="td td--num">{r.ecc_errors}</td>
                <td className="td td--num">{r.nic_errors}</td>
                <td className="td td--num">{r.reboot_count}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
