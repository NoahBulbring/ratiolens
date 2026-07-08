/* ── RatioLens — ratio definitions + scoring ──────────────────
   Each ratio: compute from inputs, benchmark bands, and a
   plain-English interpretation. Bands: [poor|watch|good]      */

const INPUT_FIELDS = [
  { group: 'Balance sheet', fields: [
    { id: 'cash',        label: 'Cash & equivalents' },
    { id: 'receivables', label: 'Accounts receivable' },
    { id: 'inventory',   label: 'Inventory' },
    { id: 'currentAssets',      label: 'Total current assets' },
    { id: 'totalAssets',        label: 'Total assets' },
    { id: 'currentLiabilities', label: 'Total current liabilities' },
    { id: 'totalLiabilities',   label: 'Total liabilities' },
    { id: 'equity',             label: 'Shareholders’ equity' },
  ]},
  { group: 'Income statement', fields: [
    { id: 'revenue',   label: 'Revenue' },
    { id: 'cogs',      label: 'Cost of goods sold' },
    { id: 'opIncome',  label: 'Operating income (EBIT)' },
    { id: 'interest',  label: 'Interest expense' },
    { id: 'netIncome', label: 'Net income' },
  ]},
];

/* Demo figures: a healthy small distribution business */
const SAMPLE = {
  cash: 85000, receivables: 120000, inventory: 140000,
  currentAssets: 355000, totalAssets: 720000,
  currentLiabilities: 165000, totalLiabilities: 330000, equity: 390000,
  revenue: 1450000, cogs: 940000, opIncome: 155000,
  interest: 18000, netIncome: 98000,
};

const fmtX = (v) => v.toFixed(2) + '×';
const fmtPct = (v) => (v * 100).toFixed(1) + '%';
const fmtDays = (v) => Math.round(v) + ' days';

/* status: score 0 (poor) → 1 (strong), linear between bounds  */
function bandScore(v, poor, good, invert = false) {
  let s = (v - poor) / (good - poor);
  s = Math.max(0, Math.min(1, s));
  return invert ? 1 - s : s;
}

const RATIOS = [
  { cat: 'Liquidity', name: 'Current ratio', fmt: fmtX,
    calc: (d) => d.currentAssets / d.currentLiabilities,
    score: (v) => bandScore(v, 0.8, 2.0),
    explain: (v) => v >= 2 ? 'Current assets comfortably cover short-term obligations.'
      : v >= 1.2 ? 'Adequate short-term coverage, but keep an eye on the cushion.'
      : 'Current liabilities are close to (or exceed) current assets — a liquidity squeeze risk.' },
  { cat: 'Liquidity', name: 'Quick ratio', fmt: fmtX,
    calc: (d) => (d.currentAssets - d.inventory) / d.currentLiabilities,
    score: (v) => bandScore(v, 0.5, 1.2),
    explain: (v) => v >= 1 ? 'Liabilities are covered without needing to sell inventory.'
      : v >= 0.7 ? 'Partial coverage without inventory — workable, not comfortable.'
      : 'Heavy reliance on inventory turning into cash to pay bills.' },
  { cat: 'Liquidity', name: 'Cash ratio', fmt: fmtX,
    calc: (d) => d.cash / d.currentLiabilities,
    score: (v) => bandScore(v, 0.1, 0.5),
    explain: (v) => v >= 0.5 ? 'Strong immediate cash cushion.'
      : v >= 0.2 ? 'Reasonable cash on hand for near-term obligations.'
      : 'Thin cash buffer — timing of collections matters a lot.' },

  { cat: 'Profitability', name: 'Gross margin', fmt: fmtPct,
    calc: (d) => (d.revenue - d.cogs) / d.revenue,
    score: (v) => bandScore(v, 0.10, 0.40),
    explain: (v) => v >= 0.4 ? 'Excellent pricing power or cost control on direct costs.'
      : v >= 0.25 ? 'Healthy gross margin for most industries.'
      : 'Thin gross margin — little room for operating costs below the line.' },
  { cat: 'Profitability', name: 'Operating margin', fmt: fmtPct,
    calc: (d) => d.opIncome / d.revenue,
    score: (v) => bandScore(v, 0.02, 0.15),
    explain: (v) => v >= 0.15 ? 'Core operations are strongly profitable.'
      : v >= 0.07 ? 'Solid operating profitability.'
      : 'Operations barely cover overhead — margin improvement is priority one.' },
  { cat: 'Profitability', name: 'Net margin', fmt: fmtPct,
    calc: (d) => d.netIncome / d.revenue,
    score: (v) => bandScore(v, 0.01, 0.10),
    explain: (v) => v >= 0.10 ? 'Strong bottom-line conversion of revenue into profit.'
      : v >= 0.05 ? 'Respectable net profitability.'
      : 'Very little of each revenue dollar reaches the bottom line.' },
  { cat: 'Profitability', name: 'Return on equity', fmt: fmtPct,
    calc: (d) => d.netIncome / d.equity,
    score: (v) => bandScore(v, 0.05, 0.20),
    explain: (v) => v >= 0.20 ? 'Shareholders are earning an excellent return.'
      : v >= 0.10 ? 'Reasonable return on the owners’ capital.'
      : 'Equity is working below typical hurdle rates.' },
  { cat: 'Profitability', name: 'Return on assets', fmt: fmtPct,
    calc: (d) => d.netIncome / d.totalAssets,
    score: (v) => bandScore(v, 0.02, 0.10),
    explain: (v) => v >= 0.10 ? 'Assets are generating profit very efficiently.'
      : v >= 0.05 ? 'Decent asset productivity.'
      : 'A large asset base is producing little profit.' },

  { cat: 'Leverage', name: 'Debt-to-equity', fmt: fmtX,
    calc: (d) => d.totalLiabilities / d.equity,
    score: (v) => bandScore(v, 2.5, 0.8),
    explain: (v) => v <= 1 ? 'Conservative capital structure — more owner money than borrowed.'
      : v <= 2 ? 'Moderate leverage; manageable if earnings are steady.'
      : 'Heavily leveraged — small earnings dips get amplified.' },
  { cat: 'Leverage', name: 'Debt ratio', fmt: fmtPct,
    calc: (d) => d.totalLiabilities / d.totalAssets,
    score: (v) => bandScore(v, 0.75, 0.35),
    explain: (v) => v <= 0.4 ? 'Assets are mostly equity-funded.'
      : v <= 0.6 ? 'Balanced mix of debt and equity funding.'
      : 'Most of the asset base is financed with debt.' },
  { cat: 'Leverage', name: 'Interest coverage', fmt: fmtX,
    calc: (d) => d.interest > 0 ? d.opIncome / d.interest : Infinity,
    score: (v) => v === Infinity ? 1 : bandScore(v, 1.5, 6),
    explain: (v) => v === Infinity ? 'No interest expense — nothing to cover.'
      : v >= 5 ? 'Operating profit covers interest many times over.'
      : v >= 2.5 ? 'Comfortable interest coverage.'
      : 'Earnings barely cover interest — refinancing or rate risk is serious.' },

  { cat: 'Efficiency', name: 'Asset turnover', fmt: fmtX,
    calc: (d) => d.revenue / d.totalAssets,
    score: (v) => bandScore(v, 0.5, 2.0),
    explain: (v) => v >= 2 ? 'Every asset dollar generates $2+ of revenue — very efficient.'
      : v >= 1 ? 'Typical asset utilization.'
      : 'Assets are turning over slowly relative to sales.' },
  { cat: 'Efficiency', name: 'Inventory turnover', fmt: fmtX,
    calc: (d) => d.inventory > 0 ? d.cogs / d.inventory : Infinity,
    score: (v) => v === Infinity ? 1 : bandScore(v, 2, 8),
    explain: (v) => v === Infinity ? 'No inventory held.'
      : v >= 6 ? 'Inventory moves fast — low carrying cost and obsolescence risk.'
      : v >= 4 ? 'Reasonable inventory velocity.'
      : 'Stock sits a long time — cash is tied up on the shelf.' },
  { cat: 'Efficiency', name: 'Days sales outstanding', fmt: fmtDays,
    calc: (d) => d.revenue > 0 ? d.receivables / d.revenue * 365 : 0,
    score: (v) => bandScore(v, 75, 30),
    explain: (v) => v <= 35 ? 'Customers pay quickly — collections are in great shape.'
      : v <= 55 ? 'Average collection period; standard net-30/net-45 behaviour.'
      : 'Receivables take a long time to collect — chase overdue accounts.' },
];

const CATEGORIES = ['Liquidity', 'Profitability', 'Leverage', 'Efficiency'];

function analyze(d) {
  const results = RATIOS.map((r) => {
    const value = r.calc(d);
    const ok = isFinite(value) || value === Infinity;
    const score = ok ? r.score(value) : 0;
    return { ...r, value, score, text: ok ? r.explain(value) : 'Not computable from the inputs given.' };
  });
  const byCat = {};
  for (const cat of CATEGORIES) {
    const rs = results.filter((r) => r.cat === cat);
    byCat[cat] = { results: rs, score: rs.reduce((s, r) => s + r.score, 0) / rs.length };
  }
  const health = CATEGORIES.reduce((s, c) => s + byCat[c].score, 0) / CATEGORIES.length;
  return { results, byCat, health };
}

if (typeof module !== 'undefined') module.exports = { analyze, SAMPLE, RATIOS, CATEGORIES };
