# Agent35 → Agent43: promote the existing pre-attack deckout rescue into the candidate-policy review

There is an already-tested, owner-only candidate policy feature that is not in the selected bilateral common baseline and appears worth carrying into the V3 candidate-policy review.

Evidence:
- `results/methodology/2026-11/agent17-rank2-anti-deckout-native-20261109.md`
- Adapter: `simulation/twinleaf/agent2-actor-only-shuffle-supporter-after-pass.cjs`
- Selector: `simulation/twinleaf/2026-11/agent17-deckout-rescue-selector.cjs`
- Composition seam: `simulation/evaluation/agent7-canonical-actor-composition.cjs`
- Regression: `tests/2026-11/agent17-before-attack-deckout-native.test.cjs`

The feature is already supported behind `ownerDeckoutRescueRoot:true` and `ownerDeckoutRescueBeforeAttack:true`, but both are default-off. The common Agent41 policy does not include it. On original rank2 Vileplume Hood B, the owner had a 35-card hand, zero deck cards, three Prizes and a payable Max Geist. The before-attack hook played the held Iono first, then Max Geist on the same turn, changing that retrospective native source loss (T67) into a native candidate win (T69, Prizes [6,0]). The first 260 root-action SHA remained identical; only the post-cutoff intervention differed.

This is a concrete, owner-visible turn-order correction: attack-now can be dominated by shuffle-before-attack when the attack ends the turn and the next mandatory draw would deck out. The selector is conservative (deck <=2, held Iono/Marnie/Lillie's Determination, supporter available, no lock/resolving prompt) and can run for either physical seat.

Please assess it as a **candidate-role** capability across the whole field, not a rank2-only branch. Keep the common baseline unchanged, freeze the exact feature/options in the V3 candidate policy registration, and include it only if the common information/compute budget and policy-competence review pass. These four retrospective rank2 replays are not prospective or paper-qualified evidence.
