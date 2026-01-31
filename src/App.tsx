import React from "react";

type Row = {
  id: string;
  service: string;
  status: "OK" | "WARN" | "DOWN";
  latencyMs: number;
  updated: string;
};

const rows: Row[] = [
  { id: "REQ-1042", service: "API Gateway", status: "OK", latencyMs: 86, updated: "2m ago" },
  { id: "REQ-1041", service: "Auth", status: "WARN", latencyMs: 182, updated: "5m ago" },
  { id: "REQ-1040", service: "Payments", status: "OK", latencyMs: 121, updated: "8m ago" },
  { id: "REQ-1039", service: "Search", status: "DOWN", latencyMs: 0, updated: "11m ago" },
  { id: "REQ-1038", service: "Notifications", status: "OK", latencyMs: 94, updated: "14m ago" }
];

function statusClass(s: Row["status"]) {
  if (s === "OK") return "pill pill-ok";
  if (s === "WARN") return "pill pill-warn";
  return "pill pill-down";
}

export default function App() {
  const total = rows.length;
  const ok = rows.filter((r) => r.status === "OK").length;
  const warn = rows.filter((r) => r.status === "WARN").length;
  const down = rows.filter((r) => r.status === "DOWN").length;

  const latencies = rows.filter((r) => r.latencyMs > 0).map((r) => r.latencyMs);
  const avgLatency =
    latencies.length === 0 ? 0 : Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length);

  return (
    <div className="page">
      <style>{css}</style>

      <header className="header">
        <div>
          <h1 className="title">Minimal Dashboard</h1>
          <p className="subtitle">Pure CSS cards + table · zero extra libraries</p>
        </div>
        <div className="meta">
          <span className="chip">Build: Vite + React + TS</span>
          <span className="chip">Output: dist</span>
        </div>
      </header>

      <section className="grid">
        <div className="card">
          <div className="card-label">Requests</div>
          <div className="card-value">{total}</div>
          <div className="card-foot">Last 15 minutes</div>
        </div>

        <div className="card">
          <div className="card-label">Healthy</div>
          <div className="card-value">{ok}</div>
          <div className="card-foot">Services OK</div>
        </div>

        <div className="card">
          <div className="card-label">Warnings</div>
          <div className="card-value">{warn}</div>
          <div className="card-foot">Investigate soon</div>
        </div>

        <div className="card">
          <div className="card-label">Avg Latency</div>
          <div className="card-value">{avgLatency}ms</div>
          <div className="card-foot">Across non-zero samples</div>
        </div>
      </section>

      <section className="panel">
        <div className="panel-head">
          <h2 className="panel-title">Recent Activity</h2>
          <div className="panel-right">
            <span className="chip">Down: {down}</span>
            <span className="chip">Updated just now</span>
          </div>
        </div>

        <div className="table-wrap" role="region" aria-label="Recent activity table">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Service</th>
                <th>Status</th>
                <th className="right">Latency</th>
                <th className="right">Updated</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className="mono">{r.id}</td>
                  <td>{r.service}</td>
                  <td>
                    <span className={statusClass(r.status)}>{r.status}</span>
                  </td>
                  <td className="right mono">{r.latencyMs > 0 ? `${r.latencyMs}ms` : "—"}</td>
                  <td className="right">{r.updated}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <footer className="panel-foot">
          <span className="hint">Tip: In Cloudflare Pages set Build command to</span>
          <span className="code">npm run build</span>
          <span className="hint">and Output directory to</span>
          <span className="code">dist</span>
        </footer>
      </section>
    </div>
  );
}

const css = `
  :root{
    --bg: #0b0f17;
    --panel: #121a2a;
    --card: #0f1726;
    --text: #e7eefc;
    --muted: #a6b3cc;
    --line: rgba(255,255,255,.08);

    --ok: #1db954;
    --warn: #f5a524;
    --down: #ff4d4f;
  }

  *{ box-sizing: border-box; }
  html, body{ height: 100%; }
  body{
    margin: 0;
    font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji","Segoe UI Emoji";
    background: radial-gradient(1200px 600px at 20% 10%, rgba(90,120,255,.20), transparent 60%),
                radial-gradient(900px 500px at 80% 20%, rgba(0,200,180,.14), transparent 55%),
                var(--bg);
    color: var(--text);
  }

  .page{
    max-width: 1040px;
    margin: 0 auto;
    padding: 24px;
  }

  .header{
    display: flex;
    gap: 16px;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 18px;
  }

  .title{
    font-size: 22px;
    line-height: 1.2;
    margin: 0 0 6px 0;
    letter-spacing: .2px;
  }

  .subtitle{
    margin: 0;
    color: var(--muted);
    font-size: 13px;
  }

  .meta{
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  .chip{
    border: 1px solid var(--line);
    background: rgba(255,255,255,.03);
    padding: 6px 10px;
    border-radius: 999px;
    color: var(--muted);
    font-size: 12px;
    white-space: nowrap;
  }

  .grid{
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 12px;
    margin: 14px 0 16px;
  }

  .card{
    border: 1px solid var(--line);
    background: linear-gradient(180deg, rgba(255,255,255,.03), rgba(255,255,255,.01));
    border-radius: 14px;
    padding: 14px 14px 12px;
    min-height: 92px;
  }

  .card-label{
    color: var(--muted);
    font-size: 12px;
    margin-bottom: 6px;
  }

  .card-value{
    font-size: 26px;
    font-weight: 700;
    letter-spacing: .2px;
  }

  .card-foot{
    margin-top: 6px;
    color: var(--muted);
    font-size: 12px;
  }

  .panel{
    border: 1px solid var(--line);
    background: rgba(18,26,42,.75);
    backdrop-filter: blur(6px);
    border-radius: 16px;
    overflow: hidden;
  }

  .panel-head{
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 14px 14px 10px;
    border-bottom: 1px solid var(--line);
  }

  .panel-title{
    margin: 0;
    font-size: 14px;
    letter-spacing: .2px;
  }

  .panel-right{
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  .table-wrap{ overflow: auto; }
  .table{
    width: 100%;
    border-collapse: collapse;
    min-width: 640px;
  }

  th, td{
    padding: 12px 14px;
    border-bottom: 1px solid var(--line);
    font-size: 13px;
  }

  th{
    text-align: left;
    color: var(--muted);
    font-weight: 600;
    background: rgba(255,255,255,.02);
  }

  tr:hover td{
    background: rgba(255,255,255,.02);
  }

  .right{ text-align: right; }
  .mono{ font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; }

  .pill{
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 10px;
    border-radius: 999px;
    border: 1px solid var(--line);
    font-size: 12px;
    letter-spacing: .2px;
  }
  .pill::before{
    content: "";
    width: 8px;
    height: 8px;
    border-radius: 50%;
    display: inline-block;
  }
  .pill-ok{ color: #bff3cf; }
  .pill-ok::before{ background: var(--ok); }
  .pill-warn{ color: #ffe6b3; }
  .pill-warn::before{ background: var(--warn); }
  .pill-down{ color: #ffd0d0; }
  .pill-down::before{ background: var(--down); }

  .panel-foot{
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    padding: 12px 14px 14px;
    color: var(--muted);
    font-size: 12px;
  }

  .code{
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
    border: 1px solid var(--line);
    background: rgba(255,255,255,.03);
    padding: 3px 8px;
    border-radius: 8px;
    color: var(--text);
  }

  @media (max-width: 900px){
    .grid{ grid-template-columns: repeat(2, minmax(0, 1fr)); }
  }

  @media (max-width: 520px){
    .header{ flex-direction: column; align-items: stretch; }
    .meta{ justify-content: flex-start; }
    .grid{ grid-template-columns: 1fr; }
  }
`;
