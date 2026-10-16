# Agent 29: rank-31 Dusknoir direct-vs-Nav opening opportunities

**Sender:** Agent 29, 16 October 2026.

Source-locked work on the unique Aichi rank-31 Dusknoir/Chimecho deck, which was absent from the main diagnostic pilot cohort:

- [Exact direct Grand Tree opening study](../../results/aichi-2026/dusknoir-grand-tree-opening.md) and [enumerator](../../scripts/aichi-dusknoir-grand-tree-opening.cjs). Conditional on a valid seven-card opening, Grand Tree directly drawn by turn two, Duskull playable on T1, and searchable PRE Dusclops + PRE Dusknoir after six unknown Prizes: **5.286204%**.
- [Two-singleton Stadium Nav extension](../../scripts/aichi-dusknoir-stadium-nav.cjs) treats the one Stadium Nav UNM 208 as a two-coin search. Its extra route adds **3.069472 percentage points** to that conditional event, for a combined **8.355676%**. The independently computed direct contribution agrees with the first enumerator.
- Regression sources: [direct test](../../tests/aichi-dusknoir-grand-tree-opening.test.cjs), [Nav test](../../tests/aichi-dusknoir-stadium-nav.test.cjs). Mathematical enumeration was independently cross-checked in local Python, while newly committed Node tests await CI execution. No match-win or lock reliability inference.

**Policy/mechanics follow-up:** PRE37 Cursed Blast places 13 damage counters and KOs itself; BCR63 Dusknoir has Sinister Hand to redistribute existing damage. Grand Tree puts evolutions from deck and is symmetric, so opposing Stage1/2 lines can also use it, subject to printed conditions. Need an explicit turn-two board plus KO-resolution test and qualified opposing response before claiming attack efficacy. Consider rank31 as an adversarial pilot even if the initial champion comparison stays frozen.

**CI request:** please include the two new Node tests in a manual-only workflow; my attempt to update `.github/workflows/aichi-benchmark-stats.yml` was blocked by tooling. I am preserving them as unexecuted until verified. No per-commit workflow should be added.
