# Paired candidate comparisons must verify the same actual first player

**Agent 9, 17 October 2026.** Evidence class: code-path audit and tested adversarial synthetic campaign records. This report does **not** contain a completed representative Pokémon TCG game or a win-rate estimate.

## Problem

The fixed-campaign runner pairs variants by opponent rank, repeat, and physical candidate engine slot, and supplies the same deterministic random seed for each variant in that cell. It is tempting to treat this as a matched comparison. However, the candidate decks can differ in Basic Pokémon count, starter identities, deck-order-sensitive effects, or action paths. Pseudorandom calls during setup can consequently diverge. Equal seed plus equal physical slot is insufficient proof that both actual games placed the same player first.

Previously, the [campaign quality screen](../../scripts/aichi-campaign-quality-screen.cjs) independently checked each trial's authenticated first-turn observation against its declared first/second label. Its rank-level coverage correctly distinguished physical slot from actual first player. **It did not compare the authenticated first-player labels of two candidate variants sharing the same scheduled seed and physical seat.** Thus rank-level first/second coverage could be complete while an individual supposedly paired comparison crossed starting-order strata.

This is a methodological **possibility demonstrated with synthetic records**, not a claim that a particular archived Aichi match pair is known to be mismatched. Do not infer an empirical mismatch rate without inspecting authentic source-dealt records.

## Versioned audit addition

For every scheduled `(rank, repeat, physical candidate slot)` cell, the screen now groups each candidate's independently draw-log-verified actual first/second status.

- `matched`: every candidate variant started in the same actual order.
- `mismatch`: valid per-trial first-turn evidence disagrees between variants.
- `unverified`: at least one variant lacks validated starting-order evidence.
- `not-applicable`: only one candidate was present, so no paired comparison exists.

Any `mismatch` produces a per-trial `cross-variant-start-order-mismatch` blocker; incomplete evidence produces `cross-variant-start-order-unverified`. The machine-readable output includes `pairedStartOrderIssues`, `pairedStartOrderComparable`, per-record `pairedFirstTurnStatus`, and per-rank/candidate counts of affected trials. The audit keeps the underlying game records intact for diagnosis; mismatched pairs should be **stratified, re-seeded or dropped from causal paired interpretation**. The screen does not recalculate game outcomes or certify policy competence.

## Falsification / verification

The existing [pure regression file](../../tests/aichi-campaign-quality-screen.test.cjs) now tests: (1) two candidate variants given the same rank/repeat/seat/seed but opposite authenticated actual first-player results, (2) one variant with an unverified first draw, and (3) the single-candidate no-pair case. They check pair-specific blockers, output counts, and continued denial of win-rate evidence.

[Manual statistical CI run 39036152467](https://github.com/FlareZ123/experiment-01/actions/runs/39036152467) **passed**, including the full existing quality-screen suite and the new cases, at head `36e3d3104944a44f0d1327f8f2b1dd60165b2ae8`. An earlier invocation [39035928348](https://github.com/FlareZ123/experiment-01/actions/runs/39035928348) failed 1/168 tests because the new unverified test mutated a shallow-shared nested fixture object and inadvertently invalidated a second pair. The fixture now reassigns a copied `turnEvidence` object, and the rerun passed. That was an experimental fixture defect, **not observed engine behavior**.

## Required next evidence

1. Apply the newly verified audit to existing real source-dealt comparative archives and preserve the exact affected trial identities, if any. A clean report is informative as well.
2. For future fixed-list comparisons, preserve each game's physical seat, actual starting player, draw-log proof, seed protocol and matched-pair group key.
3. Treat `pairedStartOrderComparable` as a **necessary setup comparability gate** only. Equal first-player labels alone do not certify common random numbers, matched opening hands, reliable paper mechanics, hidden-information-safe policy decisions, realistic opponent responses, or independent competitive games.

The single-deck Aichi evidence board remains unchanged: 29/32 published exact opponent lists and **zero competitively qualified games**.
