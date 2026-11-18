// Câu hỏi có tham số (giống cú pháp game lớp học):
//   %@ a = ngaunhien(2, 9)        số nguyên ngẫu nhiên trong [2; 9]
//   %@ b = chon(2, 3, 5)          chọn ngẫu nhiên một giá trị
//   %@ c = a*b + 1                biểu thức từ các tham số trước
//   %@ dieukien: a != b           điều kiện phải thỏa (thử lại tối đa 300 lần)
// Trong đề viết {{a}}, {{2*a+b}}, {{+b}} (luôn có dấu), {{ps(p, q)}} (phân số tối giản).
// Không dùng tham số bên trong hình TikZ.

const FUNCS = new Set(['ngaunhien', 'chon', 'ps', 'abs', 'min', 'max', 'ucln', 'bcnn', 'sqrt', 'tron']);
const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a; };

// ---- số hữu tỉ ----
class Frac {
  constructor(p, q) {
    if (!Number.isInteger(p) || !Number.isInteger(q) || q === 0) throw new Error('ps(p, q) cần p, q nguyên và q ≠ 0');
    const g = gcd(p, q) || 1, s = q < 0 ? -1 : 1;
    this.p = (s * p) / g; this.q = (s * q) / g;
  }
  get v() { return this.p / this.q; }
}
const isF = x => x instanceof Frac;
const toF = x => (isF(x) ? x : Number.isInteger(x) ? new Frac(x, 1) : null);
function arith(op, a, b) {
  if (isF(a) || isF(b)) {
    const A = toF(a), B = toF(b);
    if (A && B) {
      if (op === '+') return new Frac(A.p * B.q + B.p * A.q, A.q * B.q);
      if (op === '-') return new Frac(A.p * B.q - B.p * A.q, A.q * B.q);
      if (op === '*') return new Frac(A.p * B.p, A.q * B.q);
      if (op === '/') return new Frac(A.p * B.q, A.q * B.p);
    }
    a = isF(a) ? a.v : a; b = isF(b) ? b.v : b;
  }
  switch (op) {
    case '+': return a + b; case '-': return a - b; case '*': return a * b;
    case '/': if (b === 0) throw new Error('chia cho 0'); return a / b;
    case '%': return a % b; case '^': return a ** b;
  }
}
const num = x => (isF(x) ? x.v : x);

// ---- tách từ & phân tích biểu thức ----
function tokenize(s) {
  const t = []; let i = 0;
  while (i < s.length) {
    const c = s[i];
    if (/\s/.test(c)) { i++; continue; }
    const two = s.slice(i, i + 2);
    if (['==', '!=', '<=', '>=', '&&', '||'].includes(two)) { t.push(two); i += 2; continue; }
    if ('+-*/%^(),<>!'.includes(c)) { t.push(c); i++; continue; }
    const m = s.slice(i).match(/^(\d+(?:\.\d+)?|[A-Za-z_]\w*)/);
    if (!m) throw new Error(`ký tự lạ "${c}"`);
    t.push(m[1]); i += m[1].length;
  }
  return t;
}
export function evaluate(src, env, rng = Math.random) {
  const t = tokenize(String(src)); let k = 0;
  const peek = () => t[k], eat = x => { if (t[k] !== x) throw new Error(`thiếu "${x}"`); k++; };
  const bin = (next, ops, f) => () => { let a = next(); while (ops.includes(peek())) { const o = t[k++]; a = f(o, a, next()); } return a; };
  const atom = () => {
    const x = t[k++];
    if (x === undefined) throw new Error('biểu thức dở dang');
    if (x === '(') { const v = or(); eat(')'); return v; }
    if (/^\d/.test(x)) return Number(x);
    if (peek() === '(') {
      if (!FUNCS.has(x)) throw new Error(`không có hàm ${x}`);
      k++; const args = [];
      if (peek() !== ')') { args.push(or()); while (peek() === ',') { k++; args.push(or()); } }
      eat(')');
      return call(x, args, rng);
    }
    if (!(x in env)) throw new Error(`chưa khai báo tham số ${x}`);
    return env[x];
  };
  const pow = () => { const a = atom(); if (peek() === '^') { k++; return arith('^', num(a), num(unary())); } return a; };
  const unary = () => {
    if (peek() === '-') { k++; const v = unary(); return isF(v) ? new Frac(-v.p, v.q) : -v; }
    if (peek() === '+') { k++; return unary(); }
    if (peek() === '!') { k++; return !unary(); }
    return pow();
  };
  const mul = bin(unary, ['*', '/', '%'], (o, a, b) => arith(o, a, b));
  const add = bin(mul, ['+', '-'], (o, a, b) => arith(o, a, b));
  const cmp = () => {
    const a = add();
    if (['==', '!=', '<', '>', '<=', '>='].includes(peek())) {
      const o = t[k++], x = num(a), y = num(add()), e = 1e-9;
      return o === '==' ? Math.abs(x - y) < e : o === '!=' ? Math.abs(x - y) >= e : o === '<' ? x < y : o === '>' ? x > y : o === '<=' ? x <= y + e : x >= y - e;
    }
    return a;
  };
  const and = bin(cmp, ['&&'], (o, a, b) => a && b);
  const or = bin(and, ['||'], (o, a, b) => a || b);
  const v = or();
  if (k < t.length) throw new Error(`thừa "${t[k]}"`);
  return v;
}
function call(f, a, rng) {
  const n = a.map(num);
  switch (f) {
    case 'ngaunhien': {
      const [lo, hi] = n;
      if (!Number.isInteger(lo) || !Number.isInteger(hi) || lo > hi) throw new Error('ngaunhien(a, b) cần a ≤ b nguyên');
      return lo + Math.floor(rng() * (hi - lo + 1));
    }
    case 'chon': if (!a.length) throw new Error('chon() cần ít nhất 1 giá trị'); return a[Math.floor(rng() * a.length)];
    case 'ps': return new Frac(n[0], n[1]);
    case 'abs': return isF(a[0]) ? new Frac(Math.abs(a[0].p), a[0].q) : Math.abs(n[0]);
    case 'min': return Math.min(...n); case 'max': return Math.max(...n);
    case 'ucln': return gcd(n[0], n[1]);
    case 'bcnn': return Math.abs(n[0] * n[1]) / (gcd(n[0], n[1]) || 1);
    case 'sqrt': return Math.sqrt(n[0]);
    case 'tron': { const d = n[1] ?? 0; return Math.round(n[0] * 10 ** d) / 10 ** d; }
  }
}

// ---- khai báo tham số ----
export function parseSpec(lines) {
  const vars = [], conds = [];
  for (const raw of lines) {
    const l = raw.trim();
    if (!l) continue;
    let m = l.match(/^dieukien\s*:\s*(.+)$/i);
    if (m) { conds.push(m[1]); continue; }
    m = l.match(/^([A-Za-z_]\w*)\s*=\s*(.+)$/);
    if (!m) throw new Error(`dòng tham số không hiểu: "${l}"`);
    if (FUNCS.has(m[1])) throw new Error(`không đặt tên tham số trùng tên hàm: ${m[1]}`);
    vars.push({ name: m[1], expr: m[2] });
  }
  return { vars, conds };
}
export function sampleEnv(spec, rng = Math.random) {
  for (let tries = 0; tries < 300; tries++) {
    const env = {};
    for (const v of spec.vars) env[v.name] = evaluate(v.expr, env, rng);
    if (spec.conds.every(c => evaluate(c, env, rng))) return env;
  }
  throw new Error('không tìm được bộ tham số thỏa điều kiện sau 300 lần thử');
}

// ---- in giá trị ----
function fmt(v, mode) {
  if (typeof v === 'boolean') return v ? 'đúng' : 'sai';
  if (isF(v)) {
    if (v.q === 1) return String(v.p);
    if (mode === 'ans') return `${v.p}/${v.q}`;
    return (v.p < 0 ? '-' : '') + `\\dfrac{${Math.abs(v.p)}}{${v.q}}`;
  }
  let s = Number.isInteger(v) ? String(v) : String(Math.round(v * 1e6) / 1e6);
  if (s.includes('.')) s = mode === 'ans' ? s.replace('.', ',') : s.replace('.', '{,}');
  return s;
}
export function fill(str, env, mode = 'text') {
  if (typeof str !== 'string') return str;
  return str.replace(/\{\{(\+?)([^{}]+)\}\}/g, (_, plus, e) => {
    const v = evaluate(e, env);
    const s = fmt(v, mode);
    return plus && num(v) >= 0 ? '+' + s : s;
  });
}
export function fillQ(q, env) {
  const f = s => fill(s, env);
  return {
    ...q, stem: f(q.stem), sol: f(q.sol),
    ...(q.hints && { hints: q.hints.map(f) }),
    ...(q.opts && { opts: q.opts.map(o => ({ ...o, t: f(o.t) })) }),
    ...(q.items && { items: q.items.map(o => ({ ...o, t: f(o.t) })) }),
    ...(q.pairs && { pairs: q.pairs.map(p => p.map(f)) }),
    ...(q.ans && { ans: q.ans.map(a => fill(a, env, 'ans')) }),
  };
}
// Sinh một bản cụ thể của câu hỏi (câu không có tham số giữ nguyên)
export function instantiate(q, rng = Math.random) {
  if (!q.params) return q;
  const env = sampleEnv(parseSpec(q.params), rng);
  const { params, ...rest } = fillQ(q, env);
  return rest;
}
