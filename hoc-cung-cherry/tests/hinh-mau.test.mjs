import test from 'node:test';
import assert from 'node:assert/strict';
import { catTuyen } from '../client/hinhmau.js';

test('hình mặc định có tám góc chạm, góc A1 ở dưới-trái', () => {
  const svg=catTuyen({'song-song':'0',c:'trai'},{},{tap:true});
  const keys=[...svg.matchAll(/data-angle="([AB][1-4])"/g)].map(match=>match[1]).sort();
  assert.deepEqual(keys,['A1','A2','A3','A4','B1','B2','B3','B4']);
  const a1=/data-angle="A1" d="M([\d.]+) ([\d.]+)L([\d.]+) ([\d.]+)A56 56 0 0 0 ([\d.]+) ([\d.]+)/.exec(svg);
  assert.ok(a1);
  const [cx,cy,sx,sy,ex,ey]=a1.slice(1).map(Number);
  const radius=56, angleStart=Math.atan2(cy-sy,sx-cx),angleEnd=Math.atan2(cy-ey,ex-cx);
  const end=angleEnd<angleStart?angleEnd+2*Math.PI:angleEnd;
  const center=(angleStart+end)/2;
  assert.ok(cx+radius*Math.cos(center)<cx);
  assert.ok(cy-radius*Math.sin(center)>cy);
});

test('hình hỗ trợ đổi vùng, ẩn số, tô màu và ghi số đo', () => {
  const svg=catTuyen({diem:['P','Q'],c:'phai','song-song':1},
    {so:'an',vung:'giua',to:{P1:'cam'},do:{Q3:'60°'}},{region:true});
  assert.equal([...svg.matchAll(/data-region=/g)].length,3);
  assert.doesNotMatch(svg,/<text class="cat-number"/);
  assert.match(svg,/#ffe08a/);
  assert.match(svg,/#f28c28/);
  assert.match(svg,/>60°<\/text>/);
  assert.match(svg,/tại P và Q/);
});

test('hình dùng nhãn hai đầu và giữ nhóm trượt ở vị trí cuối', () => {
  const svg=catTuyen({duong:['x-y',"x'-y'",'z-k']},{},{slide:'to'});
  for(const label of ['x','y','x&#39;','y&#39;','z','k']){
    assert.ok(svg.includes('>'+label+'</text>'),label);
  }
  assert.match(svg,/class="cat-slide" data-dx="[^"]+" data-dy="[^"]+" style="transform:translate/);
});
