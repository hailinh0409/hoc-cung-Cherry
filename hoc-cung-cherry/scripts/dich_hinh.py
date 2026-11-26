# Dịch các khối TikZ trong một file LaTeX chủ đề thành SVG (nén gzip, base64) và in ra câu SQL cho bảng ltt_figures.
# Dùng: python3 dich_hinh.py chu_de.tex > hinh.sql
# Lưu ý: script cũ này KHÔNG tách hình từng bước (hinhbuoc) thành các khung; dùng scripts/dung-hinh.mjs (GitHub Actions).
import re, sys, os, subprocess, tempfile, gzip, base64, hashlib, shutil
PRE = r"""\documentclass[tikz,border=3pt]{standalone}
\usepackage{fontspec}
\usepackage{amsmath,amssymb}
\usepackage{tkz-euclide}
\usepackage{pgfplots}\pgfplotsset{compat=1.18}
\usetikzlibrary{calc,angles,quotes,arrows.meta,patterns,intersections,through}
\tikzset{every picture/.append style={line width=0.6pt}}
\newcount\lttstep \lttstep=99
\newcommand\lttbuoc[1]{\global\lttstep=#1\relax}
\newcommand\hien[2]{\ifnum\lttstep<#1\relax\begin{scope}[opacity=0]#2\end{scope}\else#2\fi}
\begin{document}
"""
src = open(sys.argv[1], encoding='utf-8').read().replace('\r', '')
src = re.sub(r'(^|[^\\])%.*$', r'\1', src, flags=re.M)          # bỏ chú thích giống app
blocks = list(dict.fromkeys(re.findall(r'\\begin\{tikzpicture\}[\s\S]*?\\end\{tikzpicture\}', src)))
out = []
for b in blocks:
    d = tempfile.mkdtemp()
    open(os.path.join(d, 'h.tex'), 'w', encoding='utf-8').write(PRE + b + '\n\\end{document}\n')
    r = subprocess.run(['xelatex', '-interaction=nonstopmode', '-halt-on-error', 'h.tex'], cwd=d, capture_output=True, text=True, timeout=90)
    h = hashlib.sha1(b.encode('utf-8')).hexdigest()
    if r.returncode != 0 or not os.path.exists(os.path.join(d, 'h.pdf')):
        log = open(os.path.join(d, 'h.log'), encoding='utf-8', errors='replace').read() if os.path.exists(os.path.join(d, 'h.log')) else ''
        err = ' '.join([l for l in log.splitlines() if l.startswith('!')][:2])[:300] or 'Lỗi biên dịch TikZ'
        print(f'-- LỖI {h}: {err}', file=sys.stderr)
        svgz, error = None, err
    else:
        subprocess.run(['pdftocairo', '-svg', 'h.pdf', 'h.svg'], cwd=d, check=True)
        svgz, error = base64.b64encode(gzip.compress(open(os.path.join(d, 'h.svg'), 'rb').read(), 9)).decode(), None
        print(f'-- OK {h} ({len(svgz)} ký tự)', file=sys.stderr)
    shutil.rmtree(d, ignore_errors=True)
    assert '$tz$' not in b
    val = f"'{svgz}'" if svgz else 'null'
    eval_ = 'null' if error is None else "'" + error.replace("'", "''") + "'"
    out.append(f"delete from public.ltt_figures where hash = '{h}';\ninsert into public.ltt_figures (tikz, svgz, error) values ($tz${b}$tz$, {val}, {eval_});")
print('\n'.join(out) if out else '-- Không có hình TikZ')
