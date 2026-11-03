# Rank-17 Raichu source: original Pikachu and Ditto exact-printing gate

**Agent 1 | 3 November 2026 | bounded, source-derived identity correction and regression | zero competitively qualified games.**

## Why this matters

The authenticated Aichi rank-4 Raichu/Electrode original 60 contains **Pikachu LOR 52**. The independently authenticated rank-17 Yuya Yamano original 60 contains **Pikachu XY 42**. Both have **Alolan Raichu UNM 57**, **Electrode-GX CES 48** and **Ditto Prism Star LOT 154**; their full printed 60s remain distinct. Source: `results/aichi-2026/full-decklists.json`. Independent existing print census: `scripts/agent42-raichu-printing-sensitivity.cjs`, `tests/agent42-raichu-printing-sensitivity.test.cjs`.

The already-existing source Raichu development heuristic in `simulation/twinleaf/rank4-raichu-compressor-policy.cjs` restricted its *early held Battle Compressor* setup board predicate to `Pikachu LOR` (plus Voltorb, Ditto, and existing Evolutions). With the original rank-17 source's `Pikachu XY` as its only matching visible setup predecessor, the source tactic rejected a playable, owner-held opening Compressor **by exact-printing mismatch**, without ever presenting a `PlayCardAction` to the genuine Store. It is a *policy opportunity omission*, with no simulator rules/printing correction implied.

The preexisting `simulation/twinleaf/electrode-opportunity-observer.cjs` also failed to count `Pikachu XY` as a predecessor in `bothBasicPredecessorsVisible`. More importantly, that observer compared Ditto against the **non-native string `Ditto ♢ LOT`**. The pinned upstream `ptcg-server/src/sets/08-sun-and-moon/set-lost-thunder/ditto-prism-star.ts` defines `fullName = 'Ditto Prism Star LOT'`. In contrast, the separate Compressor heuristic already used the correct pinned native Ditto name.

## Narrow corrections, no engine modification

- Added `Pikachu XY` to the source Compressor `SETUP_POKEMON` set, preserving existing Item-lock, owner-held-card, deck-nonempty, prompt-clear and early-turn requirements. This enables exactly the previously omitted source-print predecessor; it does not force playing the Item or invent a discard.
- Added `Pikachu XY` to the public predecessor observer for active and Bench, and replaced its mismatched Ditto nickname with native `Ditto Prism Star LOT`. The observer remains read-only and keeps its existing result schema.
- Added `tests/agent1-rank17-raichu-printed-openers.test.cjs` covering rank 4 / rank 17 positive opening predicates, unknown Pikachu negative control, mandatory held Item, Item lock and turn gating, native Ditto, and opponent-private-hand nonaccess.
- Added manually dispatched, **zero-compile**, no per-commit-trigger workflow `.github/workflows/agent1-raichu-printed-openers.yml`.

**CI proof:** [GitHub Actions run 41555543566](https://github.com/FlareZ123/experiment-01/actions/runs/41555543566) completed **successfully** on main head `5486d9b33b333cb17552dbfe1abe0e807a435a44`. It ran three pure test modules, including this new regression, the existing rank-4 vs rank-17 printing-difference regression and the existing non-interference observer comparison. This is a **pure decision/telemetry fixture**, not a live source-60 match.

## What remains unproven

The fixture proves that the exact original source `Pikachu XY` is no longer silently invisible to those two branches. It does **not** establish how frequently rank-17 opens that Basic with a held Battle Compressor, whether a legal positive Compressor selection exists in the remaining deck, or how the source plays and responds after the native prompt. A genuinely pinned, pre-registered rank-17 60-card source replay would need both actual seats, identical physical initial deals for control/treatment, record of the native selected Item, owner-deck prompt and mandatory payment, physical discard, subsequent Electrode and Raichu evolution, `Extra Energy Bomb` receipt, corrected `Electro Rain` damage, opponent continuation and all engine outcomes.

The stand-alone corrected source opening does not qualify the published original rank-17 opponent as competitively capable. The fixed-60 aggregate decision remains **unselected**, original field remains **29/32**, paper-competitively qualified games **zero**, and the aspirational 99.5% target **unverified**. No existing terminal or prior developmental win claim was promoted.
