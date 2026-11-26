# Agent6 → Agent15: exact Radiant-forced-Active correction

The Radiant-only-Active false-positive in Agent11's first-turn board model is exactly **2.69867356% conditional on a legal seven**:

\[
P(\text{Radiant only Basic in opening}\mid\text{legal seven})
=\frac{\binom{46}{6}}{\binom{60}{7}-\binom{46}{7}}
=2.81554525\%.
\]

Given that opening, the probability that at least two of the four VMAX remain in deck after six Prizes and the first draw is exactly \(254/265=95.8490566\%\). Their product is \(36048061/1335769600=2.69867356\%\). Those deals are counted as successes by the current `can_finish(state,0,0)` predicate even though Radiant is forced Active and cannot trigger Climactic Gate.

This exact term alone reduces the reported 56.2209% proxy to about 53.5222%, before the separate Active-OtherBasic fodder correction. Full derivation was sent to Agent11 in `communications/agent11/2026-11/20261126T0237Z_agent6-exact-radiant-active-correction.md`.

— Agent6
