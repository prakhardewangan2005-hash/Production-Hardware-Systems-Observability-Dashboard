import React, { useMemo, useState } from "react";
import "./styles.css";
import {
  FleetSnapshot,
  FleetNode,
  FailureClass,
  HealthStatus,
  ValidationRun,
  diffToEvents,
  generateFleetSnapshot,
  runValidationSuite,
} from "./lib/fleet";
import { downloadCSV, downloadMarkdown } from "./lib/exporters";

import { KpiCard } from "./components/KpiCard";
import { ControlsBar } from "./components/ControlsBar";
import { DataTable, SortKey, SortDir } from "./components/DataTable";
import { Timeline } from "./components/Timeline";

const FLEET_SIZE = 1000;

function p95(values: number[]) {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const idx = Math.max(0, Math.min(sorted.length - 1, Math.floor(0.95 * (sorted.length - 1))));
  return sorted[idx];
}

function formatAgo(ts: number) {
  const s = Math.max(0, Math.floor((Date.now() - ts) / 1000));
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  return `${h}h ago`;
}

function buildValidationReport(run: ValidationRun, snapshot: FleetSnapshot) {
  const crit = snapshot.nodes.filter((n) => n.status === "CRITICAL").length;
  const deg = snapshot.nodes.filter((n) => n.status === "DEGRADED").length;

  const lines: string[] = [];
  lines.push(`# Production Hardware Validation Report`);
  lines.push(``);
  lines.push(`**Run ID:** \`${run.run_id}\``);
  lines.push(`**Started:** ${new Date(run.started_at).toISOString()}`);
  lines.push(`**Finished:** ${new Date(run.finished_at).toISOString()}`);
  lines.push(`**Overall:** ${run.summary.overall_pass ? "✅ PASS" : "❌ FAIL"}`);
  lines.push(``);
  lines.push(`## Fleet Snapshot Summary`);
  lines.push(`- Fleet Size: **${snapshot.nodes.length}**`);
  lines.push(`- Critical Nodes: **${crit}**`);
  lines.push(`- Degraded Nodes: **${deg}**`);
  lines.push(``);
  lines.push(`## Validation Checks`);
  lines.push(`| Check | Result | Detail |`);
  lines.push(`|---|---:|---|`);
  for (const c of run.checks) {
    lines.push(`| ${c.name} | ${c.pass ? "PASS" : "FAIL"} | ${c.detail} |`);
  }
  lines.push(``);
  lines.push(`## Notes`);
  lines.push(`This console is an in-browser simulation of fleet telemetry + validation gating. In a production system, these checks would be backed by real fleet metrics, runbooks, and automation hooks.`);
  lines.push(``);
  return lines.join("\n");
}

export default function App() {
  const [snapshot, setSnapshot] = useState<FleetSnapshot>(() => generateFleetSnapshot(FLEET_SIZE));
  const [events, setEvents] = useState(() => snapshot.events.slice(-20).reverse());
  const [lastRun, setLastRun] = useState<ValidationRun | null>(null);

  const [statusFilter, setStatusFilter] = useState<HealthStatus | "ALL">("ALL");
  const [failureFilter, setFailureFilter] = useState<FailureClass | "ALL">("ALL");

  const [sortKey, setSortKey] = useState<SortKey>("health_score");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [query, setQuery] = useState("");

  const kpis = useMemo(() => {
    const nodes = snapshot.nodes;
    const critical = nodes.filter((n) => n.status === "CRITICAL").length;
    const p95Temp = p95(nodes.map((n) => n.cpu_temp_c));
    const p95Power = p95(nodes.map((n) => n.power_w));
    return { fleet: nodes.length, critical, p95Temp, p95Power };
  }, [snapshot]);

  const filteredSorted = useMemo(() => {
    let rows = snapshot.nodes as FleetNode[];

    if (statusFilter !== "ALL") rows = rows.filter((n) => n.status === statusFilter);
    if (failureFilter !== "ALL") rows = rows.filter((n) => n.failure_class === failureFilter);

    const q = query.trim().toLowerCase();
    if (q) {
      rows = rows.filter((n) => {
        const hay = `${n.node_id} ${n.rack} ${n.zone} ${n.status} ${n.failure_class}`.toLowerCase();
        return hay.includes(q);
      });
    }

    const dir = sortDir === "asc" ? 1 : -1;
    rows = [...rows].sort((a, b) => {
      const ak = (a as any)[sortKey];
      const bk = (b as any)[sortKey];
      if (typeof ak === "number" && typeof bk === "number") return (ak - bk) * dir;
      return String(ak).localeCompare(String(bk)) * dir;
    });

    return rows;
  }, [snapshot, statusFilter, failureFilter, sortKey, sortDir, query]);

  const onRegenerateTelemetry = () => {
    const prev = snapshot;
    const next = generateFleetSnapshot(FLEET_SIZE, prev);
    const diffEvents = diffToEvents(prev, next);
    const merged = [...diffEvents, ...events].slice(0, 20);
    setSnapshot(next);
    setEvents(merged);
  };

  const onRunValidation = () => {
    const run = runValidationSuite(snapshot);
    setLastRun(run);

    const sev = run.summary.overall_pass ? "INFO" : "WARN";
    const title = run.summary.overall_pass ? "Validation run PASS" : "Validation run FAIL";
    const detail = `run_id=${run.run_id} pass=${run.summary.pass_count} fail=${run.summary.fail_count}`;
    setEvents([{ ts: Date.now(), severity: sev as any, title, detail }, ...events].slice(0, 20));
  };

  const onDownloadCsv = () => {
    downloadCSV(`fleet_${new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-")}.csv`, filteredSorted);
  };

  const onDownloadReport = () => {
    const run = lastRun ?? runValidationSuite(snapshot);
    const md = buildValidationReport(run, snapshot);
    downloadMarkdown(`validation_report_${run.run_id}.md`, md);
  };

  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar__inner">
          <div className="brand">
            <div className="brand__title">Production Hardware Validation & Fleet Triage Console</div>
            <div className="brand__sub">
              Fleet telemetry • power/thermal • failure classification • validation gating
            </div>
          </div>

          <div className="metaChips">
            <span className="chip">Build: Vite + React + TS</span>
            <span className="chip">Mode: In-browser simulation</span>
            <span className="chip chip--ok">Deploy: Vercel</span>
          </div>
        </div>
      </header>

      <main className="container">
        <section className="kpiGrid">
          <KpiCard
            title="Fleet Size"
            value={kpis.fleet.toLocaleString()}
            hint="Nodes in current snapshot"
            tone="neutral"
          />
          <KpiCard
            title="Critical Nodes"
            value={String(kpis.critical)}
            hint="Immediate triage recommended"
            tone={kpis.critical > 0 ? "danger" : "ok"}
          />
          <KpiCard
            title="P95 CPU Temp"
            value={`${kpis.p95Temp.toFixed(1)}°C`}
            hint="Thermal tail indicator"
            tone={kpis.p95Temp >= 85 ? "warn" : "neutral"}
          />
          <KpiCard
            title="P95 Power"
            value={`${kpis.p95Power.toFixed(0)} W`}
            hint="Power delivery tail behavior"
            tone={kpis.p95Power >= 420 ? "warn" : "neutral"}
          />
        </section>

        <section className="layout">
          <div className="left">
            <ControlsBar
              statusFilter={statusFilter}
              failureFilter={failureFilter}
              query={query}
              onChangeStatus={setStatusFilter}
              onChangeFailure={setFailureFilter}
              onChangeQuery={setQuery}
              onRegenerate={onRegenerateTelemetry}
              onRunValidation={onRunValidation}
              onDownloadCsv={onDownloadCsv}
              onDownloadReport={onDownloadReport}
              lastUpdated={formatAgo(snapshot.generated_at)}
              lastRun={lastRun ? formatAgo(lastRun.finished_at) : "—"}
              passFail={lastRun ? (lastRun.summary.overall_pass ? "PASS" : "FAIL") : "—"}
            />

            <div className="panel">
              <div className="panel__header">
                <div className="panel__title">Fleet Table</div>
                <div className="panel__subtitle">
                  Sortable + filterable • {filteredSorted.length.toLocaleString()} rows
                </div>
              </div>

              <DataTable
                rows={filteredSorted}
                sortKey={sortKey}
                sortDir={sortDir}
                onSort={(k) => {
                  if (k === sortKey) setSortDir(sortDir === "asc" ? "desc" : "asc");
                  else {
                    setSortKey(k);
                    setSortDir("asc");
                  }
                }}
              />
            </div>
          </div>

          <aside className="right">
            <Timeline events={events} />
            <div className="panel panel--compact">
              <div className="panel__header">
                <div className="panel__title">Run Context</div>
                <div className="panel__subtitle">What this console simulates</div>
              </div>
              <div className="callout">
                <div className="callout__item">
                  <span className="dot dot--ok" />
                  Fleet telemetry ingestion (synthetic): temp/power/fans + error counters
                </div>
                <div className="callout__item">
                  <span className="dot dot--warn" />
                  Failure classification: thermal throttle, ECC burst, NIC flap, boot loop
                </div>
                <div className="callout__item">
                  <span className="dot dot--crit" />
                  Validation gating: suite checks + PASS/FAIL report export (markdown)
                </div>
              </div>
            </div>
          </aside>
        </section>
      </main>

      <footer className="footer">
        <span className="muted">
          Tip: Use filters + search to triage, then export CSV or validation report for review.
        </span>
      </footer>
    </div>
  );
}
