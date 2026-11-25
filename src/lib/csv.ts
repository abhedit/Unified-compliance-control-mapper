export function toCsv(rows: (string | number | null | undefined)[][]) {
  return rows
    .map((r) => r.map((c) => {
      let s = String(c ?? "");
      if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`; // neutralize spreadsheet formula injection
      return `"${s.replace(/"/g, '""')}"`;
    }).join(","))
    .join("\r\n");
}

export function csvResponse(name: string, rows: (string | number | null | undefined)[][]) {
  return new Response("﻿" + toCsv(rows), {
    headers: { "content-type": "text/csv; charset=utf-8", "content-disposition": `attachment; filename="${name}"` },
  });
}
