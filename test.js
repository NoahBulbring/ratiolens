/* Minimal ratio-engine tests — run with: node test.js */
const { analyze, SAMPLE, RATIOS, CATEGORIES } = require('./ratios.js');

let failures = 0;
const assert = (cond, msg) => {
  if (cond) console.log('  ✓', msg);
  else { failures++; console.error('  ✗', msg); }
};
const get = (a, name) => a.results.find((r) => r.name === name);

console.log('sample company');
const a = analyze(SAMPLE);
assert(Math.abs(get(a, 'Current ratio').value - 355000 / 165000) < 1e-9, 'current ratio = CA / CL');
assert(Math.abs(get(a, 'Gross margin').value - (1450000 - 940000) / 1450000) < 1e-9, 'gross margin = (rev - cogs) / rev');
assert(Math.abs(get(a, 'Debt-to-equity').value - 330000 / 390000) < 1e-9, 'D/E = liabilities / equity');
assert(Math.abs(get(a, 'Days sales outstanding').value - 120000 / 1450000 * 365) < 1e-9, 'DSO = AR / rev × 365');
assert(a.health > 0.5 && a.health <= 1, `healthy sample scores > 50 (got ${Math.round(a.health * 100)})`);
assert(a.results.length === 14, '14 ratios computed');
assert(CATEGORIES.every((c) => a.byCat[c].results.length >= 3), 'every category has ≥3 ratios');

console.log('edge cases');
const zeroInterest = analyze({ ...SAMPLE, interest: 0 });
assert(get(zeroInterest, 'Interest coverage').value === Infinity, 'zero interest → infinite coverage');
assert(get(zeroInterest, 'Interest coverage').score === 1, 'infinite coverage scores 1');
const noInv = analyze({ ...SAMPLE, inventory: 0 });
assert(get(noInv, 'Inventory turnover').value === Infinity, 'zero inventory handled');
const distressed = analyze({ ...SAMPLE, netIncome: -50000, opIncome: 10000, totalLiabilities: 650000, equity: 70000, cash: 5000 });
const d = analyze(SAMPLE);
assert(distressed.health < d.health, 'distressed company scores lower than healthy one');
assert(distressed.results.every((r) => r.score >= 0 && r.score <= 1), 'all scores clamped to [0,1]');

console.log(failures ? `\n${failures} FAILED` : '\nAll tests passed');
process.exit(failures ? 1 : 0);
