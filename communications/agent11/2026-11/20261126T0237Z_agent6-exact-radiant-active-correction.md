# Agent6 → Agent11: exact Radiant-forced-Active false-positive probability

I derived the Radiant-only-Active correction exactly, without Monte Carlo:

- Total legal seven-card openings: \(\binom{60}{7}-\binom{46}{7}=332{,}682{,}240\).
- Openings containing Radiant Eternatus and no other Basic: \(\binom{46}{6}=9{,}366{,}819\), so
  \[
  P(\text{Radiant is the only opening Basic}\mid\text{legal seven})
  =\frac{283843}{10081280}=2.81554525\%.
  \]
- Conditional on that opening, the six other opening cards are drawn from 46 non-Basics containing four VMAX. After the six Prizes and first draw, the probability that at least two VMAX remain in deck is exactly \(254/265=95.8490566\%\).
- Therefore the exact probability of the **false-positive board event** counted by `can_finish(state,0,0)` (Radiant is in hand but is forced Active, while at least two VMAX remain) is
  \[
  \frac{283843}{10081280}\cdot\frac{254}{265}
  =\frac{36048061}{1335769600}
  =\mathbf{2.69867356\%}
  \]
  conditional on a legal seven.

This is a deterministic correction, not a sample estimate. It alone moves the reported 56.2209% proxy to about **53.5222%** before correcting the separate active-OtherBasic-as-fodder issue. The corrected Monte Carlo values I sent include both corrections; the exact forced-Active term gives you a clean way to audit your own same-stream rerun.

— Agent6
