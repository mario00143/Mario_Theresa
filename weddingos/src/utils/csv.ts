/**
 * Section 34's shared CSV cell escaper — the single implementation every
 * CSV export builder in the app uses (previously four independent, drifted
 * copies in backupRepository.ts/financeCsv.ts/weddingPrepCsv.ts/
 * weddingDayCsv.ts, none of which protected against CSV formula
 * injection).
 *
 * Two separate concerns:
 *  1. Formula-injection prefixing: a cell whose value starts with
 *     `=`, `+`, `-`, or `@` is interpreted as a formula by Excel/Sheets
 *     when the file is opened — a malicious guest name, note, or vendor
 *     field like `=cmd|'/c calc'!A1` would execute on open. Prefixing
 *     with a single quote neutralizes it while keeping the visible text
 *     intact (Excel/Sheets both render a leading `'` as "this is text").
 *  2. Standard CSV quoting: wrap in quotes and double any embedded quote
 *     whenever the value contains a comma, quote, or newline.
 */
export function csvEscape(value: string | number | undefined | null): string {
  let str = value === undefined || value === null ? '' : String(value);
  if (/^[=+\-@]/.test(str)) {
    str = `'${str}`;
  }
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}
