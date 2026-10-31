// ===== Enigma I — pure model. Every 3D part, panel and label reads from here. =====
const A = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const ROTORS = {
  I:   { w: 'EKMFLGDQVZNTOWYHXUSPAIBRCJ', notch: 'Q' },
  II:  { w: 'AJDKSIRUXBLHWTMCQGZNPYFVOE', notch: 'E' },
  III: { w: 'BDFHJLCPRTXVZNYEIWGAKMUSQO', notch: 'V' },
  IV:  { w: 'ESOVPZJAYQUIRHXLNFTGKDCMWB', notch: 'J' },
  V:   { w: 'VZBRGITYUPSDNHLXAWMJQOFECK', notch: 'Z' },
};
const REFLECTORS = { B: 'YRUHQSLDPXNGOKMIEBFZCWVJAT', C: 'FVPJIAOYEDRZXWGCTKUQSBNMHL' };
const idx = c => A.indexOf(c);
const mod = n => ((n % 26) + 26) % 26;
const fwdTable = w => [...w].map(idx);
const invTable = w => { const t = Array(26); [...w].forEach((c, i) => t[idx(c)] = i); return t; };

// plugboard string "AJ SO" -> permutation array
function plugPerm(str) {
  const p = [...Array(26).keys()];
  (str.toUpperCase().match(/[A-Z]{2}/g) || []).forEach(([a, b]) => {
    const x = idx(a), y = idx(b);
    if (x !== y && p[x] === x && p[y] === y) { p[x] = y; p[y] = x; }
  });
  return p;
}

// one rotor pass. c = absolute contact (ETW frame). returns absolute contact out.
function pass(table, c, pos, ring) { const s = pos - ring; return mod(table[mod(c + s)] - s); }

// stepping (incl. double-step of the middle rotor). pos = [L, M, R]
function step(cfg, pos) {
  const [Lr, Mr, Rr] = cfg.order.map(n => ROTORS[n]);
  let [l, m, r] = pos;
  const rAtNotch = r === idx(Rr.notch), mAtNotch = m === idx(Mr.notch);
  if (mAtNotch) { m = mod(m + 1); l = mod(l + 1); }
  else if (rAtNotch) { m = mod(m + 1); }
  r = mod(r + 1);
  return [l, m, r];
}

// full path for one letter at given (already stepped) positions.
// contacts: [c0 ETW in, c1 after R, c2 after M, c3 after L, c4 after UKW, c5 after L, c6 after M, c7 after R]
function encipher(cfg, pos, letter) {
  const plug = plugPerm(cfg.plugs);
  const T = cfg.order.map(n => ({ f: fwdTable(ROTORS[n].w), b: invTable(ROTORS[n].w) }));
  const U = fwdTable(REFLECTORS[cfg.reflector]);
  const [rl, rm, rr] = cfg.rings;
  const [pl, pm, pr] = pos;
  const c = [];
  c[0] = plug[letter];
  c[1] = pass(T[2].f, c[0], pr, rr);
  c[2] = pass(T[1].f, c[1], pm, rm);
  c[3] = pass(T[0].f, c[2], pl, rl);
  c[4] = U[c[3]];
  c[5] = pass(T[0].b, c[4], pl, rl);
  c[6] = pass(T[1].b, c[5], pm, rm);
  c[7] = pass(T[2].b, c[6], pr, rr);
  return { input: letter, contacts: c, output: plug[c[7]] };
}

// the whole substitution at these positions (no stepping): 26 -> 26
function table(cfg, pos) { return [...Array(26).keys()].map(i => encipher(cfg, pos, i).output); }

// press = step then encipher. returns new state + path.
function press(cfg, pos, letter) { const np = step(cfg, pos); return { pos: np, ...encipher(cfg, np, letter) }; }

function run(cfg, start, text) {
  let pos = start, out = '';
  for (const ch of text) { const r = press(cfg, pos, idx(ch)); pos = r.pos; out += A[r.output]; }
  return { out, pos };
}

if (typeof module !== 'undefined') module.exports = { A, ROTORS, REFLECTORS, step, encipher, press, run, table, plugPerm, idx };
