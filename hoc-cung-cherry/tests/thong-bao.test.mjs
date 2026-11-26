import test from 'node:test';
import assert from 'node:assert/strict';
import { daXong, conNhac, tinNhac, tinBaiMoi, NHAC_CHO_GIO } from '../lib/push-core.mjs';

const H = 36e5, now = Date.parse('2026-11-26T12:00:00Z');
test('daXong: giống asgStatus (pt hoặc best của chặng 0)', () => {
  assert.equal(daXong({ pt: { 'a|0': '2026-11-25' } }, 'a'), true);
  assert.equal(daXong({ best: { 'a|0': 2 } }, 'a'), true);
  assert.equal(daXong({ best: { 'a|0': 0 } }, 'a'), false);
  assert.equal(daXong(undefined, 'a'), false);
});
test('conNhac: chờ vài giờ sau khi giao, nhắc tới 2 ngày sau hạn, bài không hạn nhắc 7 ngày', () => {
  assert.equal(conNhac({ created_at: new Date(now - (NHAC_CHO_GIO - 1) * H).toISOString() }, now), false);
  assert.equal(conNhac({ created_at: new Date(now - 24 * H).toISOString() }, now), true);
  assert.equal(conNhac({ created_at: new Date(now - 8 * 24 * H).toISOString() }, now), false);
  assert.equal(conNhac({ created_at: new Date(now - 10 * 24 * H).toISOString(), due_at: new Date(now - 24 * H).toISOString() }, now), true);
  assert.equal(conNhac({ created_at: new Date(now - 10 * 24 * H).toISOString(), due_at: new Date(now - 3 * 24 * H).toISOString() }, now), false);
});
test('nội dung thông báo không chứa tên học sinh', () => {
  const m = tinNhac([{ title: 'Tập hợp', due_at: '2026-11-27T15:00:00Z' }, { title: 'Phân số', due_at: '2026-11-20T15:00:00Z' }], now);
  assert.match(m.title, /2 bài/);
  assert.match(m.body, /quá hạn/);
  assert.match(m.body, /22:00 ngày 27\/11/);
  assert.match(tinBaiMoi('7', 'Số hữu tỉ', null).body, /Khối 7: Số hữu tỉ \(không có hạn\)/);
});
