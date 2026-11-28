import test from 'node:test';
import assert from 'node:assert/strict';
import { nextReview, redoResult } from '../lib/srs.js';

// Thầy chốt 28/11/2026: làm lại câu sai bằng câu thay thế, đúng 1 lần là xong;
// làm đúng lại CHÍNH câu đã sai ở bản đồ / đề ôn tập không gạch khỏi sổ (có thể chỉ nhớ đáp án).
test('câu sai vào sổ; làm đúng lại chính câu đó không ra khỏi sổ', () => {
  const w = nextReview(null, false, '2026-11-28');
  assert.equal(w.in_notebook, true);
  assert.equal(w.due, '2026-11-29');
  const a = nextReview(w, true, '2026-11-29');
  assert.equal(a.in_notebook, true);
  const b = nextReview({ ...a, last_ok: '2026-11-29' }, true, '2026-11-30');
  assert.equal(b.in_notebook, true);
});

test('làm lại câu sai: đúng 1 lần là ra khỏi sổ; sai thì ở lại và lùi 1 ngày', () => {
  const w = nextReview(null, false, '2026-11-28');
  const ok = redoResult(w, true, '2026-11-28');
  assert.equal(ok.in_notebook, false);
  assert.equal(ok.last_ok, '2026-11-28');
  const no = redoResult(w, false, '2026-11-28');
  assert.equal(no.in_notebook, true);
  assert.equal(no.due, '2026-11-29');
  assert.equal(no.wrong_count, 2);
});

test('câu không ở sổ vẫn theo lịch ôn cũ', () => {
  const a = nextReview(null, true, '2026-11-28');
  assert.equal(a.in_notebook, false);
  const b = nextReview(a, true, '2026-11-29');
  assert.equal(b.box, 2);
  assert.equal(b.in_notebook, false);
});
