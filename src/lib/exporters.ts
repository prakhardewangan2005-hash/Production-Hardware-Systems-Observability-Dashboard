import { FleetNode } from "./fleet";

/**
 * Download fleet data as CSV
 */
export function downloadCSV(filename: string, rows: FleetNode[]) {
  if (!rows || rows.length === 0) return;

  const headers = Object.keys(rows[0]) as Array<keyof FleetNode>;

  const escape = (value: unknown) => {
    const str = String(value ?? "");
    if (str.includes(",") || str.includes("\n") || str.includes('"')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const lines: string[] = [];
  lines.push(headers.join(","));

  for (const row of rows) {
    lines.push(headers.map((h) => escape((row as any)[h])).join(","));
  }

  const blob = new Blob([lines.join("\n")], {
    type: "text/csv;charset=utf-8",
  });

  triggerDownload(filename, blob);
}

/**
 * Download validation report as Markdown
 */
export function downloadMarkdown(filename: string, markdown: string) {
  const blob = new Blob([markdown], {
    type: "text/markdown;charset=utf-8",
  });

  triggerDownload(filename, blob);
}

/**
 * Browser download helper
 */
function triggerDownload(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");

  a.href = url;
  a.download = filename;
  document.body.appendChild(a);

  a.click();

  a.remove();
  URL.revokeObjectURL(url);
}
