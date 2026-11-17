const $ = (id) => document.getElementById(id);

function buildInputs() {
  const wrap = $('inputs');
  for (const g of INPUT_FIELDS) {
    const h = document.createElement('h3');
    h.className = 'group-title';
    h.textContent = g.group;
    wrap.appendChild(h);
    for (const f of g.fields) {
      const div = document.createElement('div');
      div.className = 'field';
      div.innerHTML = `<label for="${f.id}">${f.label}</label>
        <div class="money"><span>$</span><input type="number" id="${f.id}" value="0" step="1000" /></div>`;
      wrap.appendChild(div);
    }
  }
  wrap.addEventListener('input', render);
}

function readInputs() {
  const d = {};
  for (const g of INPUT_FIELDS)
    for (const f of g.fields) d[f.id] = parseFloat($(f.id).value) || 0;
  return d;
}

function loadSample() {
  for (const g of INPUT_FIELDS)
    for (const f of g.fields) $(f.id).value = SAMPLE[f.id];
  render();
}

function grade(score) {
  if (score >= 0.85) return 'A';
  if (score >= 0.7) return 'B';
  if (score >= 0.5) return 'C';
  if (score >= 0.3) return 'D';
  return 'F';
}
function statusCls(score) {
  return score >= 0.66 ? 'good' : score >= 0.4 ? 'watch' : 'poor';
}

function drawGauge(score) {
  const pctVal = Math.round(score * 100);
  const r = 52, c = 2 * Math.PI * r;
  $('gauge-arc').style.strokeDasharray = `${c * score} ${c}`;
  $('gauge-num').textContent = pctVal;
  $('gauge-grade').textContent = grade(score);
}

function render() {
  const d = readInputs();
  const hasData = d.revenue > 0 || d.totalAssets > 0;
  $('empty-note').hidden = hasData;
  $('dashboard').hidden = !hasData;
  if (!hasData) return;

  const a = analyze(d);
  drawGauge(a.health);

  $('cat-scores').innerHTML = CATEGORIES.map((c) => {
    const s = a.byCat[c].score;
    return `<div class="cat-chip ${statusCls(s)}">
      <span class="cat-name">${c}</span><span class="cat-grade">${grade(s)}</span>
      <div class="cat-bar"><div style="width:${Math.round(s * 100)}%"></div></div>
    </div>`;
  }).join('');

  $('ratio-groups').innerHTML = CATEGORIES.map((c) => `
    <h2 class="sub">${c}</h2>
    <div class="ratio-grid">
      ${a.byCat[c].results.map((r) => `
        <div class="ratio-card ${statusCls(r.score)}">
          <div class="ratio-top">
            <span class="ratio-name">${r.name}</span>
            <span class="ratio-value">${r.value === Infinity ? '∞' : r.fmt(r.value)}</span>
          </div>
          <div class="meter"><div style="width:${Math.round(r.score * 100)}%"></div></div>
          <p class="ratio-text">${r.text}</p>
        </div>`).join('')}
    </div>`).join('');
}

buildInputs();
$('sample').addEventListener('click', loadSample);
$('reset').addEventListener('click', () => {
  for (const g of INPUT_FIELDS) for (const f of g.fields) $(f.id).value = 0;
  render();
});
render();
