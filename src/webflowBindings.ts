/**
 * Finds Webflow CMS binding spans: {{wf { ... } }}
 * Source text is never modified; ranges refer to the original document offsets.
 */

export interface WebflowBindingMatch {
  /** Start offset in the document (inclusive) */
  start: number;
  /** End offset in the document (exclusive) */
  end: number;
  /** Decoded CMS field path when parseable */
  path?: string;
  /** Decoded Webflow field type when parseable */
  fieldType?: string;
}

const WF_OPEN = "{{wf";

export function getBindingDisplayName(match: WebflowBindingMatch): string {
  return match.path ?? match.fieldType ?? "Webflow field";
}

/**
 * Scan `text` for `{{wf ...}}` bindings and return match metadata for decorations/hover.
 */
export function findWebflowBindings(text: string): WebflowBindingMatch[] {
  const results: WebflowBindingMatch[] = [];
  let i = 0;

  while (i < text.length) {
    const open = text.indexOf(WF_OPEN, i);
    if (open === -1) {
      break;
    }

    const span = tryParseBindingAt(text, open);
    if (span) {
      results.push(span);
      i = span.end;
    } else {
      i = open + WF_OPEN.length;
    }
  }

  return results;
}

/**
 * Attempt to parse a binding starting at `open` where text.substring(open) begins with `{{wf`.
 */
export function tryParseBindingAt(text: string, open: number): WebflowBindingMatch | null {
  let pos = open + WF_OPEN.length;
  pos = skipWs(text, pos);

  if (pos >= text.length || text[pos] !== "{") {
    return null;
  }

  const innerStart = pos;
  const innerEndExclusive = scanEncodedJsonObjectEnd(text, innerStart);
  if (innerEndExclusive === null) {
    return null;
  }

  pos = skipWs(text, innerEndExclusive);
  if (pos + 1 >= text.length || text[pos] !== "}" || text[pos + 1] !== "}") {
    return null;
  }

  const end = pos + 2;
  const innerSlice = text.slice(innerStart, innerEndExclusive);
  const meta = extractPathAndType(innerSlice);

  return {
    start: open,
    end,
    path: meta.path,
    fieldType: meta.fieldType,
  };
}

function skipWs(text: string, start: number): number {
  let i = start;
  while (i < text.length && /\s/.test(text[i])) {
    i++;
  }
  return i;
}

/**
 * Given position at `{` opening the inner JSON-like object, find the index after the closing `}`.
 * Handles `&quot;` strings and `\}` as escaped `}` (Webflow export style).
 */
export function scanEncodedJsonObjectEnd(text: string, braceOpenIndex: number): number | null {
  if (braceOpenIndex >= text.length || text[braceOpenIndex] !== "{") {
    return null;
  }

  let depth = 1;
  let i = braceOpenIndex + 1;
  let inString = false;

  while (i < text.length && depth > 0) {
    if (!inString) {
      if (text.startsWith("&quot;", i)) {
        inString = true;
        i += "&quot;".length;
        continue;
      }
      if (text[i] === "\\" && i + 1 < text.length && text[i + 1] === "}") {
        i += 2;
        depth--;
        if (depth === 0) {
          return i;
        }
        continue;
      }
      if (text[i] === "{") {
        depth++;
        i++;
        continue;
      }
      if (text[i] === "}") {
        depth--;
        i++;
        if (depth === 0) {
          return i;
        }
        continue;
      }
      i++;
      continue;
    }

    // inString: find next &quot; or end
    const q = text.indexOf("&quot;", i);
    if (q === -1) {
      return null;
    }
    inString = false;
    i = q + "&quot;".length;
  }

  return null;
}

/**
 * Best-effort decode of path/type from inner `{...}` fragment for hover text.
 */
export function extractPathAndType(innerWithEntities: string): {
  path?: string;
  fieldType?: string;
} {
  let normalized = innerWithEntities.replace(/&quot;/g, '"');
  normalized = normalized.replace(/\\\}/g, "}");

  try {
    const parsed = JSON.parse(normalized) as Record<string, unknown>;
    const path = typeof parsed.path === "string" ? parsed.path : undefined;
    const fieldType = typeof parsed.type === "string" ? parsed.type : undefined;
    return { path, fieldType };
  } catch {
    const pathMatch = /"path"\s*:\s*"([^"]*)"/.exec(normalized);
    const typeMatch = /"type"\s*:\s*"([^"]*)"/.exec(normalized);
    return {
      path: pathMatch?.[1],
      fieldType: typeMatch?.[1],
    };
  }
}
