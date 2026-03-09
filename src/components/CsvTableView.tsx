"use client";

import type { CsvData } from "@/lib/attachment-utils";

export function CsvTableView({ data }: { data: CsvData }) {
  if (data.headers.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center text-muted-foreground">
        <p className="text-[13px]">Empty CSV file.</p>
      </div>
    );
  }

  return (
    <div className="overflow-auto">
      <table className="w-full border-collapse text-[12px]">
        <thead>
          <tr className="border-b border-border bg-muted/60">
            {data.headers.map((header, i) => (
              <th
                key={i}
                className="whitespace-nowrap px-3 py-2 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.rows.map((row, ri) => (
            <tr
              key={ri}
              className="border-b border-border transition-colors hover:bg-primary/5"
            >
              {row.map((cell, ci) => (
                <td
                  key={ci}
                  className="whitespace-nowrap px-3 py-2 text-foreground/80"
                >
                  {cell || (
                    <span className="text-muted-foreground/50">—</span>
                  )}
                </td>
              ))}
              {row.length < data.headers.length &&
                Array.from({ length: data.headers.length - row.length }).map(
                  (_, ci) => (
                    <td key={`pad-${ci}`} className="px-3 py-2">
                      <span className="text-muted-foreground/50">—</span>
                    </td>
                  )
                )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
