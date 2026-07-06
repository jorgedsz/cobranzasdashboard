// Mini renderer markdown -> HTML (negritas, código, listas, tablas, títulos).
// Escapa HTML primero.
const esc = (s) => s.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
const inline = (s) =>
  esc(s)
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code>$1</code>');

// Red de seguridad: si el modelo devuelve LaTeX pese a la instrucción, lo
// convierte a texto plano legible en vez de mostrar \[ \] \times, etc.
function stripLatex(text) {
  return text
    .replace(/\\\[|\\\]|\\\(|\\\)|\$\$/g, '')      // delimitadores
    .replace(/\\times/g, '×').replace(/\\cdot/g, '·')
    .replace(/\\text\{([^}]*)\}/g, '$1')
    .replace(/\\frac\{([^}]*)\}\{([^}]*)\}/g, '($1) / ($2)')
    .replace(/\\%/g, '%').replace(/\\,/g, '').replace(/\\ /g, ' ')
    .replace(/\\{2,}/g, '');
}

export function renderMd(text) {
  if (!text) return '';
  const lines = stripLatex(text).split('\n');
  const out = [];
  let i = 0;

  const isTableSep = (l) => /^\s*\|?[\s:-]*\|[\s:|-]*$/.test(l) && l.includes('-');

  while (i < lines.length) {
    const line = lines[i];

    // Tabla GFM
    if (line.includes('|') && i + 1 < lines.length && isTableSep(lines[i + 1])) {
      const header = line.split('|').map((c) => c.trim()).filter((c, idx, a) => !(idx === 0 && c === '') && !(idx === a.length - 1 && c === ''));
      i += 2;
      const rows = [];
      while (i < lines.length && lines[i].includes('|')) {
        const cells = lines[i].split('|').map((c) => c.trim());
        if (cells[0] === '') cells.shift();
        if (cells[cells.length - 1] === '') cells.pop();
        rows.push(cells);
        i++;
      }
      out.push(
        `<table class="md-table"><thead><tr>${header.map((h) => `<th>${inline(h)}</th>`).join('')}</tr></thead>` +
        `<tbody>${rows.map((r) => `<tr>${r.map((c) => `<td>${inline(c)}</td>`).join('')}</tr>`).join('')}</tbody></table>`
      );
      continue;
    }

    // Título
    const h = line.match(/^(#{1,4})\s+(.*)/);
    if (h) { out.push(`<h4 class="md-h">${inline(h[2])}</h4>`); i++; continue; }

    // Lista con viñetas
    if (/^\s*[-*]\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
        items.push(`<li>${inline(lines[i].replace(/^\s*[-*]\s+/, ''))}</li>`);
        i++;
      }
      out.push(`<ul class="md-ul">${items.join('')}</ul>`);
      continue;
    }

    // Lista numerada
    if (/^\s*\d+\.\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
        items.push(`<li>${inline(lines[i].replace(/^\s*\d+\.\s+/, ''))}</li>`);
        i++;
      }
      out.push(`<ol class="md-ol">${items.join('')}</ol>`);
      continue;
    }

    // Línea vacía
    if (line.trim() === '') { i++; continue; }

    // Párrafo
    out.push(`<p class="md-p">${inline(line)}</p>`);
    i++;
  }
  return out.join('');
}
