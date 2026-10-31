// node test/model.test.js — エニグマ計算モデルの検算
const M = require('../src/model.js');
const assert = require('assert');
const base = { order: ['I', 'II', 'III'], reflector: 'B', rings: [0, 0, 0], plugs: '' };
assert.strictEqual(M.run(base, [0, 0, 0], 'AAAAA').out, 'BDZGO');
assert.strictEqual(M.run({ ...base, rings: [1, 1, 1] }, [0, 0, 0], 'AAAAA').out, 'EWTYX');
let p = [0, 3, 20]; const s = [];
for (let i = 0; i < 3; i++) { p = M.step(base, p); s.push(p.map(x => M.A[x]).join('')); }
assert.deepStrictEqual(s, ['ADV', 'AEW', 'BFX']);
let q = [0, 0, 0], n = 0; do { q = M.step(base, q); n++; } while (q.join() !== '0,0,0');
assert.strictEqual(n, 16900);
const c = { ...base, plugs: 'AJ SO' };
assert.strictEqual(M.run(c, [0, 0, 0], M.run(c, [0, 0, 0], 'ENIGMA').out).out, 'ENIGMA');
let pos = [0, 0, 0];
for (let k = 0; k < 2000; k++) { pos = M.step(c, pos); const t = M.table(c, pos); t.forEach((v, i) => { assert.notStrictEqual(v, i); assert.strictEqual(t[v], i); }); }
console.log('all checks passed');
