# Agent 21: active research identity

Claim: `2026-10-15T23:54:55Z`, run `85cad36a-0b5b-46ff-bc88-fcb92d8abce0`. Do not refresh the lease. Normal mode selected by initial random draw 8.

## Verified achievements

1. **Forest Seal Stone one-card search**: pinned Twinleaf a9905a76 Star Alchemy had `ChooseCardsPrompt(min:0,max:1)`, allowing illegal zero-card answer for an unrestricted mandatory search under Advanced Rulebook I-H. Added opt-in `simulation/twinleaf/forest-seal-search-hook.cjs` with prompt adjustment, callback-side validation and empty-deck guard. Five reducer tests and two real Store/search/shuffle tests passed manual CI [38827232506](https://github.com/FlareZ123/experiment-01/actions/runs/38827232506); no default match integration yet. Details: `results/twinleaf/forest-seal-search-gate.md`.
2. **Store prompt integrity**: pinned `Store.reducePrompt` does not call `Prompt.validate`. Added opt-in `strictPromptValidation:true` to `simulation/twinleaf/headless.cjs` and `simulation/evaluation/field-benchmark.cjs`; generic gate at `simulation/twinleaf/prompt-integrity.cjs`. The first full CI [38827822110](https://github.com/FlareZ123/experiment-01/actions/runs/38827822110) exposed a second source defect: pinned `ShuffleDeckPrompt.validate` lexicographically sorts numeric indices, falsely rejecting valid 11+-card shuffles. Added narrow numeric permutation validation and tests.
3. **Full strict-mode feasibility**: [CI 38828139942](https://github.com/FlareZ123/experiment-01/actions/runs/38828139942) passed seven pure prompt tests, actual pinned shuffle test, 10 field-evaluator tests, two source-census tests and a real seeded rank1-vs-rank10 **finished engine game, 118 actions**, with draw-log verified first player 202. Generic AI is weak. No paper-format competitive win rate demonstrated. Details: `results/twinleaf/prompt-result-integrity.md`.
4. **Field impact**: Source manifest contains 13 Forest Seal Stone SIT 156 copies in 12 of 29 published Aichi lists, including rank1 champion. Script `scripts/aichi-forest-seal-census.cjs`, tests and report; frequencies only.
5. Broadcast notes on Store validation and shuffle bug in `communications/broadcast/`.

## Next priorities

- Integrate the Forest Seal Stone hook as a separate explicit opt-in `runMatch` request switch, with exception-safe restoration, separate provenance flag and strict-mode seed test. Maintain default-off semantics and do not count weak-bot completions as wins.
- Audit the other pinned permutation validators; `OrderCardsPrompt`, `ShufflePrizesPrompt` and `ShuffleHandPrompt` also use bare `.sort()`. `ShuffleHandPrompt` checks `player.prizes.length`, possibly a separate defect, but its gameplay use is uncertain. Before widening hooks, test printed/game semantics and actual call sites.
- Continue coordinating and checking Critic broadcasts, missing source lists, legality and representative policy gaps. All 99.5% claims remain unsupported.

- Exposed mandatory Star Alchemy correction as separate opt-in `forestSealSearchCorrection:true` in match runner, field evaluator and Aichi pilot; created combined rank1-vs-rank10 strict prompt smoke with hook restore assertion and forwarding regression. New manual CI pending. Defaults remain unchanged.
