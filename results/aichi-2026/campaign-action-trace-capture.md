# Chronological action capture: source-locked Aichi rank-6 six-trial pilot

**Agent 30, 16 October 2026.** Status: committed measurement-infrastructure improvement and one completed **generic-policy diagnostic**, without competitive-policy qualification or a claimed win rate.

## Source, provenance and checks

- Exact three fixed inventories and seeded first/second engine-slot assignments from the [common campaign](fair-comparison-campaign.md), with actual first-turn verification.
- Pinned Twinleaf engine `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`; standard diagnostic corrections for strict prompts, Forest Seal Stone, Double Dragon attachment, Supporter proposal and separate bot random streams.
- [Manual CI 38840293363](https://github.com/FlareZ123/experiment-01/actions/runs/38840293363) passes source-identity and new trace-capture tests.
- [Manual compiled-engine CI 38840332579](https://github.com/FlareZ123/experiment-01/actions/runs/38840332579), commit `ff07ce6cdcbba2b61335680c7c4717abb8b02ad7`, passes and uploads artifact `aichi-campaign-diagnostic` (artifact ID `12020597476`, ZIP SHA-256 `de3d9b8916e76549549c56bcc795b5356901a10fbf91dc8f29864dfd934cfb30`).
- The downloaded artifact contains `aichi-campaign-diagnostic.json`, 307,757 bytes. Each of the six chronological action arrays was independently SHA-256 recomputed from compact JSON and matched its stored digest. The arrays have strictly increasing `actionOrdinal`, turn and post-action field shape validations, and no source/seed mismatches were reported.

The runner now requests the existing `captureDecisionTrace` hook and preserves the ordered log of **played cards, attacks, abilities, passing, retreat and Stadium activations**. Each entry retains the global action ordinal, global turn before/after, acting player slot and subsequent Prize/deck counts. If tracing was requested but absent or malformed, a nominally completed engine game is classified `unverified-decision-trace` instead. Existing source-plan/deck/seed and first-turn gates remain in force.

## Observed six-game archive

| Fixed candidate | Candidate slot | True candidate turn | Candidate attacks | Iron Thorns attacks | Captured meaningful actions | Terminal result |
| --- | --- | --- | ---: | ---: | ---: | --- |
| Champion reference | A | first | 0 | 1 | 121 | candidate A engine winner, opponent deck empty |
| Champion reference | B | second | 6 | 1 | 87 | candidate B engine winner, opponent has zero Prizes |
| Hood Shield v1 | A | first | 1 | 2 | 117 | candidate A engine winner, opponent deck empty |
| Hood Shield v1 | B | second | 0 | 5 | 152 | candidate B engine winner, opponent deck empty |
| Temple v1 | A | first | 4 | 7 | 127 | opponent B engine winner, both decks empty |
| Temple v1 | B | second | 3 | 8 | 117 | opponent A engine winner, opponent has zero Prizes |

**721 meaningful action entries** are now preserved, across **1,916 engine-dispatched actions**. All six games ended by the engine; **two candidate seats never attacked**. The bot's decisions are unqualified and no candidate ranking should be deduced from the nominal winners.

## Rank-6 archetype-line diagnostic

The Iron Thorns fast-attack ALS calls for Tag Call / Guzma & Hala, Double Colorless Energy, Thunder Mountain and Volt Cyclone on the first attacking turn when going second. In these three matches with Iron Thorns going second (candidate A), its **first recorded Volt Cyclone attack happened on global engine turn 10, 16 and 10**, respectively. In the other three matches where Iron Thorns went first, its first attack occurred on global engine turn **5** in each.

This is a **small diagnostic sample**, not an estimate of first-turn attack frequency. It identifies a concrete replay-analysis target: examine the opening hands, exact missing DCE/Stadium/search pieces, two-card discard choices, current attack cost and competing Supporter choices before labeling the observed delay a policy defect. The present log cannot disambiguate those alternatives.

## Important limits and next step

The `chronologicalActionTrace` is **not a complete deterministic replay**. The current headless instrumentation omits prompt resolutions such as searched/discarded card selections, full shuffle outcomes, player-visible information sets, and many game-state deltas. The SHA-256 digest checks payload identity and order; it does not certify rule fidelity. Simulator winner labels, deck-out conditions and the absence of real human decision skill remain independent concerns.

Next, add narrowly targeted prompt-selection trace data (especially Guzma & Hala's two discarded cards and the Special Energy/Stadium search outcomes), while preserving hidden-information semantics. Compare the actual available discard budgets to the [exact DCI sensitivity scenarios](iron-thorns-discard-sensitivity.md). Only then can the first-turn ALS policy be diagnosed without guessing from aggregate card plays.

**No quantitative competitive win-rate evidence was produced.**
