// src/protparam.js

// 1) Kyte–Doolittle hydropathy scale
export const KD_SCALE = {
  A:  1.8, R: -4.5, N: -3.5, D: -3.5, C:  2.5,
  Q: -3.5, E: -3.5, G: -0.4, H: -3.2, I:  4.5,
  L:  3.8, K: -3.9, M:  1.9, F:  2.8, P: -1.6,
  S: -0.8, T: -0.7, W: -0.9, Y: -1.3, V:  4.2
};

// Compute GRAVY = average hydropathy
export function computeGRAVY(seq) {
  const vals = [...seq].map(aa => KD_SCALE[aa] ?? 0);
  const sum  = vals.reduce((a,b)=>a+b, 0);
  return +(sum / vals.length).toFixed(3);
}

// Instability Index (Guruprasad et al. 1990)
// You need a dipeptide weight table in dipeptideWeights.json under src/
import DIWV from "./dipeptideWeights.json";
export function computeInstabilityIndex(seq) {
  const L = seq.length;
  let S = 0;
  for (let i = 0; i < L - 1; i++) {
    const dp = seq[i] + seq[i+1];
    S += DIWV[dp] || 0; 
  }
  return +((10 / L) * S).toFixed(2);
}

// Aliphatic Index (Ikai 1980)
export function computeAliphaticIndex(seq, a = 2.9, b = 3.9) {
  const cnt = { A:0, V:0, I:0, L:0 };
  for (let aa of seq) if (cnt.hasOwnProperty(aa)) cnt[aa]++;
  const frac = x => (cnt[x] / seq.length) * 100;
  const ai = frac("A") + a * frac("V") + b * (frac("I") + frac("L"));
  return +ai.toFixed(2);
}
