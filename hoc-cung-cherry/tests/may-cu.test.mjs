import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// iPhone 8 và máy cũ: Safari < 16.4 không hiểu regex lookbehind; chỉ cần một cái trong mã trang là cả app không chạy.
const html = readFileSync(new URL('../public/app.html', import.meta.url), 'utf8');
const libs = ['latex', 'chat-source', 'params', 'srs', 'rank'].map(n => readFileSync(new URL(`../lib/${n}.js`, import.meta.url), 'utf8'));

test('mã chạy trên trình duyệt không dùng regex lookbehind', () => {
  for (const [name, src] of [['public/app.html', html], ...libs.map((s, i) => [`lib/${i}`, s])]) {
    const hit = /\(\?<[=!]/.exec(src);
    assert.equal(hit, null, `${name}: có lookbehind ở vị trí ${hit && hit.index}`);
  }
});
