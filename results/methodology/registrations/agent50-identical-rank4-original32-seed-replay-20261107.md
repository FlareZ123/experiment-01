# Agent50: same-seed identical-rank4 setup-shuffle replay

**Registered 7 November 2026, before implementing this replay.** This is a retrospective diagnostic of a known anomalous seed cohort. It is not a fresh-seed or competitive game experiment.

## Falsifiable question

The original rank4-versus-rank1 32-seed first-turn cohort, under Twinleaf's legacy shared shuffle stream, recorded eight physical-seat-0 mulligan hands and zero seat-1 mulligans. Does that imbalance persist on **exactly the original 32 seeds and source-first seat assignments** when both physical players use the same authenticated original rank4 60?

Unlike the previous identical-rank4 32-seed control, this replay changes deck identity on the previously rank1 seat while holding the seed/seat cohort fixed. The changing opposing deck alters RNG consumption and therefore changes the deals: compare outcome distributions and per-seed changes, not physical-deal-causal effects.

## Locked design

- Parent original 32-seed preregistration: [rank4 original source-first](agent50-rank4-dedechange-natural32-sourcefirst-20261106.md), exact trial seed/seat pairs in that file and in `tests/agent50-rank4-dedechange-natural32.native.test.cjs`. No new sampling or seed selection.
- Original source printed deck: authenticated original Aichi rank4 fixed 60, 13 Basic Pokémon, physical card SHA-256 `3f82c3a7c43d62979ea2196b74bffd22fc51d6e7cc11cc27be9daad10d02b423`; use it for **both seats**, unchanged.
- Same 32 seed/seat registrations and source-first setup as the original rank4/rank1 study. Exactly 16 first-player seat0 and 16 first-player seat1.
- Two prespecified shuffle protocols for each registration: `legacy-shared`, followed by `per-seat` with Agent26's unchanged 0x243f6a88/0x85a308d3 salts. Total 64 setup attempts; these protocols are distinct physical-deal populations.
- Reuse the existing owner-only prompt acknowledgements, Dedenne-preserving single-Basic entry-priority setup, native owner `SelectPrompt` choice, actual Store observer and raw-State fallback quarantine from `tests/agent50-identical-rank4-mulligan-seat-symmetry.native.test.cjs`.
- Run until the owner's first turn reaches the quarantine. Do not play or score full games.
- Required archive: per-attempt physical seat, seed, protocol, recorded own-deck SHA, all public mulligan acknowledgements, mulligan counts for both seats, recipient/draw, exact physically matched deck-to-hand compensation move, any engine failures, and protocol-specific shuffle receipts.
- Compare per-seed original rank4/rank1 legacy mulligan pair against same-seed identical rank4 legacy pair, plus the new same-seed per-seat pair. Report all 32 rows and aggregates, including whether seat0-only 8/0 persists. No reclassification of the original data, no seed filtering.
- Keep native tests fail-closed on owner identity, exact compensation movement, raw-State quarantine, all registrations returned, full 16/16 seat balance and actual source turn1. Preserve failed rows and raw receipts.

## Interpretation boundaries

This diagnostic can reject a universal claim of seat0-only bias under the original seeds if the new same-deck cohort differs. It cannot distinguish deck composition from RNG consumption order without a separate controlled permutation/shuffle analysis, and it cannot establish either shuffle protocol as paper-exact. It has no opponent-policy competence, terminal games, 25-minute paper clock, fixed-deck contest, or 99.5% win-rate inference.

Linked original research: [rank4/rank1 original32](../agent50-rank4-dedechange-natural32-sourcefirst-20261106.md), [per-seat protocol replay](../agent50-rank4-dedechange-perseat32-sourcefirst-20261106.md), and [fresh identical-rank4 cohort](../agent50-identical-rank4-mulligan-seat-symmetry-20261106.md).
