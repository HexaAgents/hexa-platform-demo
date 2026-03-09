export type AttachmentKind = "image" | "pdf" | "csv" | "html" | "unknown";

export function getAttachmentKind(
  mimeType: string,
  fileName: string
): AttachmentKind {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType === "application/pdf") return "pdf";
  if (
    mimeType === "text/csv" ||
    mimeType === "application/csv" ||
    fileName.toLowerCase().endsWith(".csv")
  )
    return "csv";
  if (
    mimeType === "text/html" ||
    mimeType === "application/html" ||
    fileName.toLowerCase().endsWith(".html") ||
    fileName.toLowerCase().endsWith(".htm")
  )
    return "html";
  return "unknown";
}

export function decodeBase64Content(base64: string): string {
  if (typeof window !== "undefined") {
    return atob(base64);
  }
  return Buffer.from(base64, "base64").toString("utf-8");
}

export interface CsvData {
  headers: string[];
  rows: string[][];
}

export function parseCsv(raw: string): CsvData {
  const lines = raw
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length === 0) return { headers: [], rows: [] };

  const parse = (line: string): string[] => {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (ch === "," && !inQuotes) {
        result.push(current.trim());
        current = "";
      } else {
        current += ch;
      }
    }
    result.push(current.trim());
    return result;
  };

  const headers = parse(lines[0]);
  const rows = lines.slice(1).map(parse);

  return { headers, rows };
}
