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
    .replace(/\uFEFF/g, '') // Remove BOM
    .replace(/\u00A0/g, ' ') // Non-breaking space to regular space
    // Common UTF-8 to Windows-1252 misencodings (mojibake)
    .replace(/â/g, "'") // Curly apostrophe
    .replace(/â/g, '"') // Left double quote
    .replace(/â/g, '"') // Right double quote
    .replace(/â/g, '–') // En dash
    .replace(/â/g, '—') // Em dash
    .replace(/â¦/g, '…') // Ellipsis
    .replace(/â¢/g, '•') // Bullet
    .replace(/â¢/g, '™') // Trademark
    .replace(/â¢/g, '®') // Registered
    .replace(/â¬/g, '€') // Euro
    .replace(/Ã©/g, 'é') // é
    .replace(/Ã¡/g, 'á') // á
    .replace(/Ã­/g, 'í') // í
    .replace(/Ã³/g, 'ó') // ó
    .replace(/Ãº/g, 'ú') // ú
    .replace(/Ã±/g, 'ñ') // ñ
    .replace(/Ã¼/g, 'ü') // ü
    .replace(/Ã/g, 'Ü') // Ü
    .replace(/Ã/g, 'ß') // ß
    .replace(/Â\s+/g, ' ') // Remove Â followed by spaces
    .replace(/Â/g, '') // Remove remaining Â characters
    .replace(/(\r?\n\s*){3,}/g, '\n\n') // Collapse multiple newlines
    .trim();
}

export default { extractBody, normalizeHtml };
