# RatioLens

Enter balance sheet and income statement figures and get a ratio dashboard: 14 ratios across liquidity, profitability, leverage, and efficiency, each scored against benchmarks and explained, with an overall 0–100 health score.

Live demo: https://noahbulbring.github.io/ratiolens/ — click "Load sample company" to see a full analysis.

![RatioLens screenshot](screenshot.png)

## Ratios

| Category | Ratios |
|---|---|
| Liquidity | Current ratio · Quick ratio · Cash ratio |
| Profitability | Gross margin · Operating margin · Net margin · Return on equity · Return on assets |
| Leverage | Debt-to-equity · Debt ratio · Interest coverage |
| Efficiency | Asset turnover · Inventory turnover · Days sales outstanding |

Each ratio card shows the value, a benchmark meter, a status, and a one-line interpretation. Category grades (A–F) roll up into the health score.

## Run it

No build step, no dependencies — plain HTML/CSS/JS, everything runs in the browser.

```bash
git clone https://github.com/NoahBulbring/ratiolens.git
cd ratiolens
open index.html
```

Run the engine tests with Node:

```bash
node test.js
```

## Notes

Benchmark bands are general-purpose heuristics — healthy values differ by industry (a grocer's margins are not a SaaS company's). Not financial advice.

## License

MIT © Noah Bulbring
