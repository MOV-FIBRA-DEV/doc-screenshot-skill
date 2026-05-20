// __docAnnotate(spec) — desenha um overlay de anotação sobre a página.
// Injetado via evaluate_script do MCP chrome-devtools. Ver SKILL.md.
function __docAnnotate(spec) {
  const OVERLAY_ID = '__doc_annotate_overlay__';
  const PALETTE = ['#22c55e', '#4f9cf9', '#f59e0b', '#ef4444', '#a855f7', '#06b6d4'];
  const svgNS = 'http://www.w3.org/2000/svg';

  // remove overlay anterior (idempotente)
  document.getElementById(OVERLAY_ID)?.remove();
  if (spec && spec.clear) return { drawn: 0, missing: [] };

  const overlay = document.createElement('div');
  overlay.id = OVERLAY_ID;
  Object.assign(overlay.style, {
    position: 'fixed', inset: '0', zIndex: '2147483647', pointerEvents: 'none'
  });
  const svg = document.createElementNS(svgNS, 'svg');
  Object.assign(svg.style, {
    position: 'fixed', inset: '0', width: '100%', height: '100%', pointerEvents: 'none'
  });
  const defs = document.createElementNS(svgNS, 'defs');
  svg.appendChild(defs);
  overlay.appendChild(svg);
  document.body.appendChild(overlay);

  const missing = [];
  const drawn = [];

  const box = (styles, text) => {
    const e = document.createElement('div');
    Object.assign(e.style, styles);
    if (text != null) e.textContent = text;
    overlay.appendChild(e);
    return e;
  };

  function drawBox(r, color) {
    const p = 6;
    box({
      position: 'fixed', left: (r.left - p) + 'px', top: (r.top - p) + 'px',
      width: (r.width + p * 2) + 'px', height: (r.height + p * 2) + 'px',
      border: '3px solid ' + color, borderRadius: '8px',
      boxShadow: '0 0 0 3px rgba(0,0,0,0.35)'
    });
  }

  function drawPin(r, n, color, position) {
    const s = 30;
    // position: 'top-left' (default), 'center', 'top-right', 'bottom-left', 'bottom-right',
    //           'top', 'bottom', 'left', 'right'
    const pos = position || 'top-left';
    let px, py;
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    if (pos === 'center')        { px = cx - s / 2; py = cy - s / 2; }
    else if (pos === 'top')      { px = cx - s / 2; py = r.top - s / 2; }
    else if (pos === 'bottom')   { px = cx - s / 2; py = r.bottom - s / 2; }
    else if (pos === 'left')     { px = r.left - s / 2; py = cy - s / 2; }
    else if (pos === 'right')    { px = r.right - s / 2; py = cy - s / 2; }
    else if (pos === 'top-right')    { px = r.right - s / 2; py = r.top - s / 2; }
    else if (pos === 'bottom-left')  { px = r.left - s / 2; py = r.bottom - s / 2; }
    else if (pos === 'bottom-right') { px = r.right - s / 2; py = r.bottom - s / 2; }
    else /* top-left */          { px = r.left - s / 2; py = r.top - s / 2; }
    box({
      position: 'fixed', left: px + 'px', top: py + 'px',
      width: s + 'px', height: s + 'px', borderRadius: '50%',
      background: color, color: '#000', font: '700 16px system-ui, sans-serif',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: '0 2px 6px rgba(0,0,0,0.6)', border: '2px solid #000'
    }, String(n));
  }

  function drawCallout(r, text, color) {
    const p = 6;
    drawBox(r, color);
    // rótulo acima da caixa; se cortar no topo da viewport, joga para baixo
    let labelTop = r.top - p - 28;
    if (labelTop < 4) labelTop = r.bottom + p + 4;
    box({
      position: 'fixed', left: (r.left - p) + 'px', top: labelTop + 'px',
      background: color, color: '#000', font: '700 13px system-ui, sans-serif',
      padding: '3px 9px', borderRadius: '6px', whiteSpace: 'nowrap',
      boxShadow: '0 2px 6px rgba(0,0,0,0.5)'
    }, text);
  }

  function arrowMarker(color) {
    const id = 'docarrow-' + color.replace(/[^a-z0-9]/gi, '');
    if (!defs.querySelector('#' + id)) {
      const m = document.createElementNS(svgNS, 'marker');
      m.setAttribute('id', id);
      m.setAttribute('viewBox', '0 0 10 10');
      m.setAttribute('refX', '8'); m.setAttribute('refY', '5');
      m.setAttribute('markerWidth', '6'); m.setAttribute('markerHeight', '6');
      m.setAttribute('orient', 'auto-start-reverse');
      const path = document.createElementNS(svgNS, 'path');
      path.setAttribute('d', 'M0,0 L10,5 L0,10 z');
      path.setAttribute('fill', color);
      m.appendChild(path);
      defs.appendChild(m);
    }
    return id;
  }

  function drawArrow(r, item, color) {
    const sides = ['top', 'bottom', 'left', 'right'];
    const side = sides.includes(item.fromSide) ? item.fromSide : 'top';
    const len = item.length || 80;
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    let sx, sy, tx, ty;
    if (side === 'top')    { tx = cx; ty = r.top - 8;    sx = cx; sy = r.top - 8 - len; }
    if (side === 'bottom') { tx = cx; ty = r.bottom + 8; sx = cx; sy = r.bottom + 8 + len; }
    if (side === 'left')   { tx = r.left - 8;  ty = cy;  sx = r.left - 8 - len;  sy = cy; }
    if (side === 'right')  { tx = r.right + 8; ty = cy;  sx = r.right + 8 + len; sy = cy; }
    const mid = arrowMarker(color);
    const line = document.createElementNS(svgNS, 'line');
    line.setAttribute('x1', sx); line.setAttribute('y1', sy);
    line.setAttribute('x2', tx); line.setAttribute('y2', ty);
    line.setAttribute('stroke', color);
    line.setAttribute('stroke-width', '4');
    line.setAttribute('marker-end', 'url(#' + mid + ')');
    svg.appendChild(line);
  }

  function drawSpotlight(r) {
    const p = 4;
    box({
      position: 'fixed', left: (r.left - p) + 'px', top: (r.top - p) + 'px',
      width: (r.width + p * 2) + 'px', height: (r.height + p * 2) + 'px',
      borderRadius: '8px', boxShadow: '0 0 0 9999px rgba(0,0,0,0.72)'
    });
  }

  function drawBlur(r) {
    box({
      position: 'fixed', left: r.left + 'px', top: r.top + 'px',
      width: r.width + 'px', height: r.height + 'px',
      borderRadius: '4px', background: 'rgba(127,127,127,0.25)',
      backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)'
    });
  }

  // Two-pass rendering: backgrounds first (box, spotlight, blur), then
  // foreground elements (pin, callout, arrow) so pins are never hidden
  // behind boxes.
  const bgTypes = new Set(['box', 'spotlight', 'blur']);
  const resolved = (spec?.items || []).map((item, i) => {
    const color = item.color || PALETTE[i % PALETTE.length];
    const el = item.selector ? document.querySelector(item.selector) : null;
    const r = el ? el.getBoundingClientRect() : null;
    if (!r) { missing.push(item.selector || '(item sem seletor)'); return null; }
    return { item, i, color, r };
  }).filter(Boolean);

  // Pass 1: backgrounds
  resolved.filter(e => bgTypes.has(e.item.type)).forEach(({ item, color, r }) => {
    switch (item.type) {
      case 'box':       drawBox(r, color); break;
      case 'spotlight': drawSpotlight(r); break;
      case 'blur':      drawBlur(r); break;
    }
    drawn.push(item.type);
  });
  // Pass 2: foreground (rendered on top)
  resolved.filter(e => !bgTypes.has(e.item.type)).forEach(({ item, i, color, r }) => {
    switch (item.type) {
      case 'pin':       drawPin(r, item.number != null ? item.number : i + 1, color, item.position); break;
      case 'callout':   drawCallout(r, item.text || '', color); break;
      case 'arrow':     drawArrow(r, item, color); break;
    }
    drawn.push(item.type);
  });

  return { drawn: drawn.length, missing };
}
