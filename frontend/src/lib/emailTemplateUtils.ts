// Utilities for extracting and normalizing email template bodies.
// Keep these small and well-tested — used by EmailTemplateEditor and other UI pieces.
export function extractBody(raw: unknown): string {
  if (raw == null) return '';
  if (typeof raw === 'string') {
    const s = raw.trim();
    if (/^[A-Za-z0-9+/]+=*$/.test(s) && s.length % 4 === 0) {
      try {
        return atob(s);
      } catch {
        return s;
      }
    }
    return s;
  }

  if (typeof raw === 'object') {
    const r = raw as Record<string, unknown>;
    if (r.type === 'Buffer' && Array.isArray(r.data)) {
      try {
        return new TextDecoder().decode(Uint8Array.from(r.data as number[]));
      } catch { void 0; }
    }

    for (const key of ['body', 'html', 'content', 'data']) {
      const v = r[key];
      if (typeof v === 'string' && v.trim() !== '') return extractBody(v);
      if (Array.isArray(v) && v.every((n) => typeof n === 'number')) {
        try { return new TextDecoder().decode(Uint8Array.from(v as number[])); } catch { void 0; }
      }
    }

    for (const k of Object.keys(r)) {
      const v = r[k];
      if (typeof v === 'string' && v.trim() !== '') return extractBody(v);
    }

    try { return JSON.stringify(r); } catch { return String(r); }
  }

  return String(raw);
}

export function normalizeHtml(dirty: string): string {
  if (!dirty) return dirty;
  return dirty
    .replace(/\uFEFF/g, '')
    .replace(/\u00A0/g, ' ')
    .replace(/â/g, '–').replace(/â/g, '—').replace(/â¦/g, '…').replace(/â¢/g, '•')
    .replace(/Â\s+/g, ' ')
    .replace(/(\r?\n\s*){3,}/g, '\n\n')
    .trim();
}

export default { extractBody, normalizeHtml };
