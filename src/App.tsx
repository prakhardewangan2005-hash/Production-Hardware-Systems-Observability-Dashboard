import React, { useMemo, useRef, useState } from "react";
import "./styles.css";

import { ControlsBar } from "./components/ControlsBar";
import { KpiCard } from "./components/KpiCard";
import { FleetTable, SortKey } from "./components/FleetTable";
import { Timeline } from "./components/Timeline";

import {
  FailureClass,
  FleetNode,
  FleetSnapshot,
  HealthStatus,
  ValidationRun,
  diffToEvents,
  generateFleetSnapshot,
  runValidationSuite,
} from "./lib/fleet";
import { p95 } from "./lib/stats";
import { downloadCSV, downloadMarkdown } from "./lib/exporters";

const DEFAULT_FLEET_SIZE = 1000;

export default function App() {
  const [snapshot, setSnapshot] = useState<FleetSnapshot>(() =>
    generateFleetSnapshot(DEFAULT_FLEET_SIZE)
  );

  const prevSnapshotRef = useRef<FleetSnapshot | null>(null);

  const [statusFilter, setStatusFilter] = useState<HealthStatus | "ALL">("ALL");
  const [failureFilter, setFailureFilter] = useState<FailureClass | "ALL">(
    "ALL"
  );
  const [sortKey, setSortKey] = useState<SortKey>("health_score");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const [latestRun, setLatestRun] = useState<ValidationRun | null>(null);

  const fleet = snapshot.nodes;

  const kpis = useMemo(() => {
    const critical = fleet.filter((n) => n.status === "CRITICAL").length;
    const p95Temp = p95(fleet.map((n) => n.cpu_temp_c));
    const p95Power = p95(fleet.map((n) => n.power_w));
    return {
      fleetSize: fleet.length,
      critical,
      p95Temp,
      p95Power,
    };
  }, [fleet]);

  const events = useMemo(() => snapshot.events.slice(0, 20), [snapshot.events]);

  const filteredSorted = useMemo(() => {
    const filtered = fleet.filter((n) => {
      const okStatus = statusFilter === "ALL" ? true : n.status === statusFilter;
      const okFailure =
        failureFilter === "ALL" ? true : n.failure_class === failureFilter;
      return okStatus && okFailure;
    });

    const dir = sortDir === "asc" ? 1 : -1;

    const toNum = (v: unknown) => (typeof v === "number" ? v : Number(v));

    const sorted = [...filtered].sort((a, b) => {
      switch (sortKey) {
        case "cpu_temp_c":
          return dir * (a.cpu_temp_c - b.cpu_temp_c);
        case "power_w":
          return dir * (a.power_w - b.power_w);
        case "fan_rpm":
          return dir * (a.fan_rpm - b.fan_rpm);
        case "ecc_errors":
          return dir * (a.ecc_errors - b.ecc_errors);
        case "nic_errors":
          return dir * (a.nic_errors - b.nic_errors);
        case "reboot_count":
          return dir * (a.reboot_count - b.reboot_count);
        case "throttle_events":
          return dir * (a.throttle_events - b.throttle_events);
        case "health_score":
          return dir * (a.health_score - b.health_score);
        case "last_seen":
          return dir * (a.last_seen - b.last_seen);
        case "status":
          return dir * a.status.localeCompare(b.status);
        case "failure_class":
          return dir * a.failure_class.localeCompare(b.failure_class);
        case "rack":
          return dir * a.rack.localeCompare(b.rack);
        case "zone":
          return dir * a.zone.localeCompare(b.zone);
        default:
          return dir * (toNum((a as any)[sortKey]) - toNum((b as any)[sortKey]));
      }
    });

    return sorted;
  }, [fleet, statusFilter, failureFilter, sortKey, sortDir]);

  const selected = useMemo(() => {
    if (!selectedNodeId) return null;
    return fleet.find((n) => n.node_id === selectedNodeId) ?? null;
  }, [fleet, selectedNodeId]);

  function handleRegenerate() {
    const prev = snapshot;
    prevSnapshotRef.current = prev;

    const next = generateFleetSnapshot(DEFAULT_FLEET_SIZE, prev);
    // If you want the timeline to reflect changes specifically:
    next.events = diffToEvents(prev, next).slice(0, 20);
    setSnapshot(next);
    setLatestRun(null);

    // Keep selection if node still exists
    if (selectedNodeId && !next.nodes.some((n) => n.node_id === selectedNodeId)) {
      setSelectedNodeId(null);
    }
  }

  function handleRunValidation() {
    const run = runValidationSuite(snapshot);
    setLatestRun(run);

    // Push a “run event” to top of timeline
    setSnapshot((s) => ({
      ...s,
      events: [
        {
          ts: Date.now(),
          severity: run.summary.overall_pass ? "INFO" : "WARN",
          title: "Validation suite completed",
          detail: `Run ${run.run_id} • PASS=${run.summary.pass_count} FAIL=${run.summary.fail_count}`,
        },
        ...s.events,
      ].slice(0, 20),
    }));
  }

  function handleDownloadCSV() {
    downloadCSV("fleet_snapshot.csv", snapshot.nodes);
  }

  function handleDownloadReport() {
    const md = buildValidationReportMarkdown(snapshot, latestRun);
    downloadMarkdown("validation_report.md", md);
  }

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <div className="title">Production Hardware Validation Console</div>
          <div className="subtitle">
            Fleet telemetry • power/thermal • failure triage • validation runs
          </div>
        </div>

        <div className="badges">
          <span className="badge">Build: Vite + React + TS</span>
          <span className="badge">Deploy: Vercel / Pages</span>
          <span className="badge">Mode: In-browser simulation</span>
        </div>
      </header>

      <section className="kpis">
        <KpiCard
          label="Fleet Size"
          value={kpis.fleetSize.toLocaleString()}
          hint="Nodes in current snapshot"
        />
        <KpiCard
          label="Critical Nodes"
          value={kpis.critical.toLocaleString()}
          hint="Immediate triage recommended"
          emphasis={kpis.critical > 0 ? "danger" : "neutral"}
        />
        <KpiCard
          label="P95 CPU Temp"
          value={`${kpis.p95Temp.toFixed(1)}°C`}
          hint="Thermal tail latency signal"
          emphasis={kpis.p95Temp >= 88 ? "warn" : "neutral"}
        />
        <KpiCard
          label="P95 Power"
          value={`${kpis.p95Power.toFixed(0)} W`}
          hint="Power delivery tail behavior"
          emphasis={kpis.p95Power >= 420 ? "warn" : "neutral"}
        />
      </section>

      <ControlsBar
        statusFilter={statusFilter}
        onStatusFilter={setStatusFilter}
        failureFilter={failureFilter}
        onFailureFilter={setFailureFilter}
        onRegenerate={handleRegenerate}
        onRunValidation={handleRunValidation}
        onDownloadCSV={handleDownloadCSV}
        onDownloadReport={handleDownloadReport}
        latestRun={latestRun}
      />

      <div className="grid">
        <div className="panel">
          <div className="panelHeader">
            <div>
              <div className="panelTitle">Fleet Triage</div>
              <div className="panelHint">
                Sort + filter nodes by severity and failure class. Select a row
                for details.
              </div>
            </div>
            <div className="panelMeta">
              <span className="pill">
                Showing: {filteredSorted.length.toLocaleString()}
              </span>
              <span className="pill">
                Updated: {new Date(snapshot.generated_at).toLocaleTimeString()}
              </span>
            </div>
          </div>

          <FleetTable
            rows={filteredSorted}
            sortKey={sortKey}
            sortDir={sortDir}
            onSortChange={(k) => {
              if (k === sortKey) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
              else {
                setSortKey(k);
                setSortDir("asc");
              }
            }}
            selectedNodeId={selectedNodeId}
            onSelectNode={setSelectedNodeId}
          />

          {selected && (
            <div className="details">
              <div className="detailsTitle">Selected Node</div>
              <div className="detailsGrid">
                <DetailItem label="Node" value={selected.node_id} />
                <DetailItem label="Zone" value={selected.zone} />
                <DetailItem label="Rack" value={selected.rack} />
                <DetailItem label="Status" value={selected.status} />
                <DetailItem label="Failure Class" value={selected.failure_class} />
                <DetailItem label="Health Score" value={String(selected.health_score)} />
                <DetailItem label="CPU Temp" value={`${selected.cpu_temp_c.toFixed(1)}°C`} />
                <DetailItem label="Power" value={`${selected.power_w.toFixed(0)} W`} />
                <DetailItem label="Fan" value={`${selected.fan_rpm.toFixed(0)} RPM`} />
                <DetailItem label="Throttle" value={String(selected.throttle_events)} />
                <DetailItem label="ECC Errors" value={String(selected.ecc_errors)} />
                <DetailItem label="NIC Errors" value={String(selected.nic_errors)} />
                <DetailItem label="Reboots" value={String(selected.reboot_count)} />
                <DetailItem
                  label="Last Seen"
                  value={new Date(selected.last_seen).toLocaleString()}
                />
              </div>
            </div>
          )}
        </div>

        <div className="panel">
          <div className="panelHeader">
            <div>
              <div className="panelTitle">Event Timeline</div>
              <div className="panelHint">
                Shows recent changes from fleet regeneration / validation runs.
              </div>
            </div>
            <div className="panelMeta">
              <span className="pill">Last 20 events</span>
            </div>
          </div>

          <Timeline events={events} />
        </div>
      </div>

      <footer className="footer">
        <div className="footerLeft">
          Tip: This console is intentionally frontend-only for reviewable validation
          workflows. Add a backend later for real telemetry ingestion.
        </div>
        <div className="footerRight">
          <span className="tiny">Output: dist</span>
        </div>
      </footer>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="detailItem">
      <div className="detailLabel">{label}</div>
      <div className="detailValue">{value}</div>
    </div>
  );
}

function buildValidationReportMarkdown(snapshot: FleetSnapshot, run: ValidationRun | null) {
  const nodes = snapshot.nodes;
  const critical = nodes.filter((n) => n.status === "CRITICAL").length;
  const degraded = nodes.filter((n) => n.status === "DEGRADED").length;
  const healthy = nodes.filter((n) => n.status === "HEALTHY").length;

  const p95Temp = p95(nodes.map((n) => n.cpu_temp_c));
  const p95Power = p95(nodes.map((n) => n.power_w));

  const topFailure = topCounts(nodes.map((n) => n.failure_class), 6);

  const header = `# Hardware Validation Report

**Generated:** ${new Date(snapshot.generated_at).toISOString()}
**Fleet Size:** ${nodes.length}
**Health:** Healthy=${healthy} • Degraded=${degraded} • Critical=${critical}

## Fleet Tails
- **P95 CPU Temp:** ${p95Temp.toFixed(1)} °C
- **P95 Power:** ${p95Power.toFixed(0)} W

## Top Failure Classes
${topFailure.map(([k, v]) => `- **${k}**: ${v}`).join("\n")}

## Validation Suite
`;

  if (!run) {
    return (
      header +
      `No validation suite has been executed for this snapshot yet.

Recommended:
- Run the Validation Suite
- Export CSV for deeper offline analysis
`
    );
  }

  const checks = run.checks
    .map((c) => `- ${c.pass ? "✅" : "❌"} **${c.name}** — ${c.detail}`)
    .join("\n");

  return (
    header +
    `**Run ID:** ${run.run_id}
**Overall:** ${run.summary.overall_pass ? "PASS" : "FAIL"}
**Checks:** PASS=${run.summary.pass_count} • FAIL=${run.summary.fail_count}

### Check Results
${checks}

## Notes for Cross-Functional Review
- **Power:** investigate nodes flagged for power spikes / high P95 power.
- **Thermal:** validate heatsink/contact/fan curves for thermal throttle clusters.
- **Hardware:** inspect ECC burst nodes for DIMM instability; review reboot loops.
- **Software:** correlate driver/firmware versions with NIC flaps where applicable.
`
  );
}

function topCounts(items: string[], k: number): Array<[string, number]> {
  const m = new Map<string, number>();
  for (const it of items) m.set(it, (m.get(it) ?? 0) + 1);
  return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, k);
}
