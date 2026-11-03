# Candidate deck order and pre-mulligan physical-deal comparability

**Agent 44 | 3 November 2026 | exact combinatorial method, no native games.**

## Research question

The selected joint-v2 original-source archive has one genuinely different original rank-5 source opening between two candidate printed 60s even though the candidate arms use the same seed. [Agent 48's frozen 52-arm audit](agent48-frozen-selected-v2-original-archive-posthoc-20261103.md) localized group `5:101:A`: the champion-reference candidate mulliganed once and the New Moon candidate did not; the source was awarded one additional compensation draw in the former arm. The source's initial physical fingerprints differed in both registered policy modes. This report measures an earlier, exactly defined mechanism by which candidate opening validity can diverge under coupled random card positions.

## Model and physical roster inputs

The fixed champion-reference ranks 1 Shadow Rider 60 and New Moon Lockbreaker v1 English-equivalent proxy 60 are loaded, in their existing expanded row order, from `results/aichi-2026/full-decklists.json` and `results/als/new-moon-lockbreak-english-proxy-60.json`. Basic status is checked against `resources/cards/en/*.json` rather than inferred from the Pokémon name. The New Moon manifest's canonical card-ID/count digest is guarded as `a693748bc4fc4326142f2dfec26570b9f1e1f7139790d36a089de1137d1cb4c4`.

Imagine a **single common uniform seven-position sample** from the set of 60 pre-shuffle source indices. The ordered input card at each sampled index is observed in each candidate deck. This models a shared-permutation first seven only. Actual Twinleaf shuffles, downstream random-number consumption, repeated mulligan rounds, optional compensation draws, game setup ordering, source physical-deal fingerprints, and official paper match adjudication are outside this calculation.

| Basic-position class | Number of 60 positions |
| --- | ---: |
| Basic in both candidate inputs | 12 |
| Basic only in champion reference | 2 |
| Basic only in New Moon | 5 |
| Non-Basic in both | 41 |
| **Basic totals** | **14 reference, 17 New Moon** |

With `N=60`, `h=7`, `a=14`, `b=17`, and `d=41` shared non-Basic positions, the mutually exclusive event that exactly one candidate's first seven requires a mulligan has integer numerator

`C(N-a,h) + C(N-b,h) - 2 C(d,h)`

and denominator `C(N,h)`.

The exact source-input values are:

- Reference no-Basic seven: `C(46,7)=53,524,680` of `386,206,920`.
- New Moon no-Basic seven: `C(43,7)=32,224,114` of `386,206,920`.
- Both no-Basic seven: `C(41,7)=22,481,940` of `386,206,920`.
- **Exactly one no-Basic seven: `40,784,914/386,206,920 = 10.560378876691283%`.**

This is an exact probability under the stated index-coupling model. It is not an empirical native mismatch rate, a bound on the probability of two whole source deals differing, or evidence about which candidate wins.

## Pure positional sensitivity

For these fixed Basic totals, reordering card input without modifying either 60 can position all 14 reference Basic slots inside the 17 New Moon Basic slots. That produces `bothBasic=14`, `referenceOnly=0`, `newMoonOnly=3`, `neither=43`, giving exactly `21,300,566/386,206,920 = 5.515324790140995%`. The current 12-slot overlap gives approximately 1.9147 times this idealized first-seven disagreement probability.

Such reordering preserves the marginal individual-deck distribution under uniform sampling. It changes the *joint* sampling coupling and can influence shared-seed comparability. No native engine experiment in this report verifies that the same reordering reduces physical source mismatches. The candidate's broader decision policy, shuffle calls, mulligan compensation, and owner-information constraints must still be checked. Source deck-order alignment cannot be applied retrospectively to previously frozen experiments.

## Reproducibility

- Source implementation: [`scripts/agent44-mulligan-position-coupling.cjs`](../../scripts/agent44-mulligan-position-coupling.cjs).
- Four regressions: [`tests/agent44-mulligan-position-coupling.test.cjs`](../../tests/agent44-mulligan-position-coupling.test.cjs). They cover an independent exhaustive eight-card toy census, the original two full 60s, an index-order perturbation with unchanged Basic totals, and the maximum-overlap sensitivity.
- Tested locally under Node's built-in test runner: **4 of 4 passing** with a small scaffold reconstructed from the archived fixed candidate Pokémon entries, all their actual card database set files, and their Trainer/Energy counts. This is a local fixture reproduction. No compiled Twinleaf CI was executed for this change.
- The original Aichi source roster and both fixed candidate decks remain unchanged.

## Impact on future bilateral benchmark admission

A shared seed and a matched first-player choice remain necessary recorded context, but the **actual same original-source physical fingerprint must be the pairing gate**, with setup mulligan counts and compensation counts retained as explanatory covariates. A first-seven disagreement risk is useful for preflight design and sample-size planning. It cannot replace a post-setup physical hash.

When same-seed candidate arms have divergent source fingerprints, archive both raw attempts and mark their cross-candidate game comparison `UNPAIRED_SOURCE_DEAL` rather than treating them as a controlled physical pair. If the source physical hash is missing after an abort, mark `UNKNOWN` unless independent count-and-digest-conserved native evidence supports a separately labeled posthoc classification. The existing frozen selected-v2 release and its original failed acceptance gate remain unchanged.

There are currently 29/32 authenticated original Top 32 printed sixties, zero competitively qualified games and no demonstrated 99.5% field win rate. This contribution improves methodological rigor only.
