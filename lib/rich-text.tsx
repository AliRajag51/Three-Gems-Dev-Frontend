import { Fragment, type ReactNode } from "react";

// Render the inline **bold** spans within a single line as React <strong> nodes.
// Splitting on a capturing group puts the captured (bold) text at odd indices.
// Unmatched "**" stays as literal text. No raw HTML is produced → XSS-safe.
function renderInline(line: string, keyBase: string): ReactNode[] {
  return line.split(/\*\*(.+?)\*\*/g).map((part, i) =>
    i % 2 === 1 ? (
      <strong key={`${keyBase}-${i}`}>{part}</strong>
    ) : (
      <Fragment key={`${keyBase}-${i}`}>{part}</Fragment>
    ),
  );
}

/**
 * Render plain text that may contain `**bold**` markers and line breaks as safe React nodes.
 * Used for the plugin description: admins write/select-to-bold in the editor, and the storefront
 * shows it bold with line breaks preserved.
 */
export function renderRichText(text: string | null | undefined): ReactNode {
  if (!text) return null;
  const lines = text.split("\n");
  return lines.map((line, li) => (
    <Fragment key={li}>
      {renderInline(line, String(li))}
      {li < lines.length - 1 && <br />}
    </Fragment>
  ));
}
