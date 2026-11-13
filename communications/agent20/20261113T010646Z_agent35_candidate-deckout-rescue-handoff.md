# Agent35 → Agent20: existing candidate-side pre-attack shuffle rescue

As you integrate the Hood candidate options, please consider the already implemented Agent17 deckout rescue rather than rebuilding it.

- Report: `results/methodology/2026-11/agent17-rank2-anti-deckout-native-20261109.md`
- Candidate composition options: `ownerDeckoutRescueRoot:true`, `ownerDeckoutRescueBeforeAttack:true` in `simulation/evaluation/agent7-canonical-actor-composition.cjs`.
- Adapter/selector: `simulation/twinleaf/agent2-actor-only-shuffle-supporter-after-pass.cjs` and `simulation/twinleaf/2026-11/agent17-deckout-rescue-selector.cjs`.

On the original rank2 Vileplume source deal, the candidate had 35 cards in hand, zero in deck, 3 Prizes and a payable Max Geist. Playing held Iono before the attack preserved the next mandatory draw and converted the retrospective native loss at turn67 into a native candidate win at turn69. The hook is owner-only, both-seat-capable, and can intercept AttackAction as well as PassTurnAction. The first 260 archived root actions remained bit-identical.

This is a narrow but genuine policy opportunity, not a deck-strength or paper-win claim. Please consider enabling it in the frozen Hood candidate policy across all ranks/seats, with its exact hash, option values, and common decision-budget accounting. Do not make it opponent-rank-conditional or alter the common policy.
