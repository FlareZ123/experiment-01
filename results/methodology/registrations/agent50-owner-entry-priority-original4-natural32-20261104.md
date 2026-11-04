# Preregistration: 32 fixed natural rank4 physical-source opening attempts

**Agent 50 | 4 November 2026, before first sample observed**

## Purpose

Produce a native Store-accepted **positive** case where an authenticated original source hand contains both (a) an eligible Basic with a printed in-turn hand-to-Bench Ability and (b) another eligible nontrigger Basic. The selected greedy initial chooser would select both (until max6), entering the support during setup. The opt-in Agent50 priority selector should choose the ordinary Basic as Active and retain the other Pokémon as a physical card in hand through setup. Previous registered natural rank5 two-seat tests passed Store acceptance but had no such positive case.

This is an owner-hand/paper timing fidelity experiment. No observed win rate, simulator-completed match, or field-wide policy benefit is inferred.

## Frozen inputs

- Source: authenticated **Aichi Open League 2026 rank 4, Raichu Electrode Combo**, as registered in original `results/aichi-2026/full-decklists.json`, all 60 unchanged.
- Opponent: canonical fixed rank 1 registered candidate under `planAichi(1)`.
- Engine: pinned Twinleaf gitlink `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, using the exact importer/source-print permissions `allowEquivalentBasicEnergies:true`, `allowBasicEnergyMirrorPrintings:true`, `allowJapanesePromoHooks:true`.
- **Exactly 32 predeclared trials**: every source physical seat **0 and 1** against seeds **20261120 through 20261135 inclusive**, 16 per physical seat. No adaptive seed choice. Use `maxActions=80`, `captureNativeAbortEvidence=true`, and the same live native Store.
- Policy: `simulation/twinleaf/agent50-owner-entry-priority-single-basic.cjs` with owner printed Ability flags, selected Agent4 vetted one-Basic Store bridge, native source-owner setup confirm, canonical actor-only continuation and the outer native raw-State fallback quarantine. Any other player receives identical own-visible policy and no source-rank branch. v3 selected policy is untouched.

## Per-trial required evidence

For each of 32 attempts, preserve seed, physical source seat, source-vs-candidate accepted Store setup count, public printed selected Active, eligible Basic count, recognized printed entry support count, owner identity, next blocked public prompt envelope, native decoder quarantine, paper/model compatibility caveats, and 0 qualified games. The engine must confirm both players' actual Active placement. Record all exceptions and absent-positive cases, without dropping inconvenient trials.

Define an **observed positive preservation opportunity** only when the *rank4 source owner's own* initial legal eligible Basic menu contains at least one in-turn hand-to-Bench Ability Basic and at least one other Basic, and the priority policy chooses an ordinary Basic as Active through an **accepted native Store** action. A merely available named Basic in the decklist, or a printed Ability on the opponent's card, does not qualify. Do not count any event where all eligible Basics are supports or no support is in the hand. This source-owned event should also show native physical Active receipt, the store's published move-only-selected-card semantics, and no generic raw-State fallback execution. The physical hand-after-dispatch witness should be added where practicable.

## Outcome criterion

Require **at least one positive source-owned opportunity across the 32 predeclared attempts** for the study to support the stronger positive-witness claim. If none occurs, report the negative and inspect source randomization or resolution rather than adding adaptive seeds. Also report the complete fraction of 32 attempted hands with a positive qualifying event; this selected-seed fraction is descriptive only and may not be interpreted as a win rate or an unbiased independent empirical estimate if seeding produces correlated hands.

CI job acceptance, actual per-trial receipts and stored artifact are distinct from game qualification. Any failed attempts remain visible and fail the declared full-test gate if a mandatory condition is unmet.

**Agent 50**
