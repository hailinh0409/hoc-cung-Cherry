// Hình TikZ: mỗi khối \begin{tikzpicture}...\end{tikzpicture} được dịch sẵn thành SVG
// và lưu ở bảng ltt_figures, nhận diện bằng sha1 của nguyên văn khối (sau khi bỏ chú thích %).
export const TIKZ = /\\begin\{tikzpicture\}[\s\S]*?\\end\{tikzpicture\}/g;

import { HINHBUOC, parseHinhBuoc, GIAIMAU, parseGiaiMau } from './latex.js';

export const normalizeSource = s => String(s || '').replace(/\r/g, '').replace(/(^|[^\\])%.*$/gm, '$1');
// Hình thường: mỗi tikzpicture là một khối. Hình từng bước (\begin{hinhbuoc}): mỗi bước là một khối riêng
// (mã khung = \lttbuoc{k} + tikzpicture, xem hbFrame trong latex.js); bản tikzpicture gốc bên trong không dịch riêng.
export function figBlocks(src) {
  const s = normalizeSource(src), out = [];
  for (const m of s.matchAll(HINHBUOC)) { const h = parseHinhBuoc(m[1]); if (h.tikz) out.push(...h.frames); }
  // Bài giải mẫu: mỗi màn một khung (gmFrame), hình gốc bên trong không dịch riêng
  for (const m of s.matchAll(GIAIMAU)) out.push(...parseGiaiMau(m[1]).frames);
  out.push(...(s.replace(HINHBUOC, '').replace(GIAIMAU, '').match(TIKZ) || []));
  return [...new Set(out)];
}

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
\newcount\lttstep \lttstep=99
\newcommand\lttbuoc[1]{\global\lttstep=#1\relax}
\newcommand\hien[2]{\ifnum\lttstep<#1\relax\begin{scope}[opacity=0]#2\end{scope}\else#2\fi}
\newcommand\phu[3]{\ifnum\lttstep<#1\relax\begin{scope}[opacity=0]#3\end{scope}\else\ifnum\lttstep>#2\relax\begin{scope}[opacity=0]#3\end{scope}\else#3\fi\fi}
\definecolor{lttcam}{HTML}{FF5A36}
\newcount\lttsangk \lttsangk=0
\newtoks\lttsangtoks
\newcommand\lttsang[1]{\global\lttsangk=#1\relax\global\lttsangtoks{}}
\newcommand\sang[2]{\begin{scope}[opacity=0]#2\end{scope}\ifnum\lttsangk=#1\relax\global\lttsangtoks\expandafter{\the\lttsangtoks#2}\fi}
\newcommand\lttsangve{\begin{scope}[color=lttcam,line width=1.8pt,every node/.append style={text=lttcam}]\the\lttsangtoks\end{scope}}
\begin{document}
`;
export const wrapFigure = block => PREAMBLE + block + '\n\\end{document}\n';
