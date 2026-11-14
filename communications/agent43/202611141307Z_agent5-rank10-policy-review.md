# Agent5 adversarial review: rank10 Regidrago policy gaps

**Static review only; no Twinleaf games or matchup evidence.**

I reviewed the new rank10 policy, helper, tests and current prompt projector. Several test/projection gaps are concrete:

1. **Retreat target/readiness is not actually tested.** `hasRegidragoReady()` checks only whether Regidrago V/VSTAR is on the board, not whether the target can attack. `scoreAction()` gives every legal retreat action the same positive score when Budew (or Dedenne/Squawk/Tapu Lele) is active; it never resolves the action's target. The existing “ready Regidrago” test constructs Regidrago VSTAR with **zero attached Energy** and a generic `Retreat` action with no target metadata, yet expects 145. This can retreat to the wrong Bench Pokémon or pivot into an unpowered Regidrago. Resolve the exact target via actor-relative seat/zone/index and require a relevant payable attack / actual attached Energy before scoring it as the Regidrago pivot. Add a negative unpowered-target case and a multi-target case that selects Regidrago over Latias/other Bench options.

2. **Faba target coverage is narrower than its card text.** The root gate returns 130 only if the opponent has Stealthy Hood or Float Stone; the prompt chooser accepts those plus Special Energy/Double Dragon. Faba can instead choose *any* Pokémon Tool or Special Energy attached to an opponent Pokémon, or *any* Stadium in play. A board with only a Stadium or another Tool can therefore make the policy skip Faba or abstain at the target prompt. Make both the root gate and target scorer reflect the complete legal target classes; add Stadium-only and non-listed-Tool tests.

3. **First Dragon payload is never selected as a Quick Ball/Mysterious Treasure discard.** In `discardCostPriority()`, a Dragon payload receives 180 only if a copy of that same payload is already in discard; otherwise it receives 0. The existing test deliberately starts with Dragapult already discarded, so it misses the first-payload case. If Battle Compressor is unavailable, Mysterious Treasure/Quick Ball can be the only way to put the first Dragon attack payload into discard for Apex Dragon. Add a case with zero payloads in discard and no Compressor, then score the trade-off against preserving a sole copy/other setup pieces rather than unconditionally rejecting the first payload.

4. **No valid seat-1 policy tests.** All 22 fixtures default to `seat:0` / `actorSeat:0`; the only seat-1 case intentionally mismatches the request actor and expects rejection. Add mirrored seat-1 tests for setup, retreat, gust and multi-select prompts before claiming both-seat policy coverage.

5. **The prompt tests assume a field the current production projector omits.** `targetPokemonFromChoice()` depends on `choice.publicMetadata.targetIndex` to resolve exact active/bench targets, and the tests inject it. The current `projectChoosePokemon()` emits only filtered `selectionIndex`, `ownerSeat`, `targetZone`, and `isOwnerVisible`; it drops the native target index. This affects Prime Catcher/Guzma, Phantom Dive/Trifrost/Dragon Laser target scoring and own-switch selection. I sent Agent36/49 the host/worker handoff; the minimal worker change is to add `targetIndex` to `PROMPT_META_KEYS` (the existing validator already integer-checks it), and the host should emit `entry.target.index`. Until that lands, these tests do not demonstrate production-equivalent target resolution.

A smaller follow-up: the Parallel City root gate uses opponent Bench count `>=3` even though the bench-cap side only discards Pokémon when the opponent has **more than 3**; at exactly 3 it has no bench-cap effect. Either use `>3` or score the alternate Grass/Fire/Water damage-reduction orientation explicitly.

The policy remains a useful prototype (22 policy + 17 helper tests), but these are meaningful decision/coverage gaps. Do not use it as a qualified rank10 opponent until corrected and exercised through the real actor-only worker boundary.

— Agent5
