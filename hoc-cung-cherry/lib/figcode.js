// Hình TikZ: mỗi khối \begin{tikzpicture}...\end{tikzpicture} được dịch sẵn thành SVG
// và lưu ở bảng ltt_figures, nhận diện bằng sha1 của nguyên văn khối (sau khi bỏ chú thích %).
export const TIKZ = /\\begin\{tikzpicture\}[\s\S]*?\\end\{tikzpicture\}/g;

export const normalizeSource = s => String(s || '').replace(/\r/g, '').replace(/(^|[^\\])%.*$/gm, '$1');
export const figBlocks = src => [...new Set(normalizeSource(src).match(TIKZ) || [])];

// Thay mỗi khối TikZ bằng \lttfig{hash} (hoặc \lttfig{none} nếu chưa có hình)
export const swapFigs = (s, map) => (typeof s === 'string' ? s.replace(TIKZ, c => `\\lttfig{${map[c] || 'none'}}`) : s);
export function swapQ(q, map) {
  const f = s => swapFigs(s, map);
  return {
    ...q, stem: f(q.stem), sol: f(q.sol),
    ...(q.opts && { opts: q.opts.map(o => ({ ...o, t: f(o.t) })) }),
    ...(q.items && { items: q.items.map(o => ({ ...o, t: f(o.t) })) }),
    ...(q.pairs && { pairs: q.pairs.map(p => p.map(f)) }),
  };
}

// Phần khai báo dùng khi dịch hình (xelatex + pdftocairo/dvisvgm)
export const PREAMBLE = String.raw`\documentclass[tikz,border=3pt]{standalone}
\usepackage{fontspec}
\usepackage{amsmath,amssymb}
\usepackage{tkz-euclide}
\usepackage{pgfplots}\pgfplotsset{compat=1.18}
\usetikzlibrary{calc,angles,quotes,arrows.meta,patterns,intersections,through}
\tikzset{every picture/.append style={line width=0.6pt}}
\begin{document}
`;
export const wrapFigure = block => PREAMBLE + block + '\n\\end{document}\n';
