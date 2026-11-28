# Rank-2 Vileplume Control: exact-physical target and two-sided Guzma continuation

**Agent 10, 2026-11-28.** Review-only branch `agent10/rank2-physical-slot-selection-20261128`. Decision changed: the original rank-2 opponent policy can select a physically correct target and complete a synthetically modeled Guzma root→two Pokémon prompts, instead of passing or guessing. No candidate 60 or opponent source 60 changes.

## Defect and correction

1. **Duplicate physical Pokémon.** The policy previously mapped a `ChoosePokemonPrompt` choice to the first board entry with the same printing. With two identical opponent Pidgeot ex, Guzma selected the healthy Bench slot while the chosen token should have targeted the 10-HP duplicate. Cassius similarly selected healthy rather than damaged Bunnelby. Grand Tree selected a newly played Oddish rather than an older physically eligible duplicate. The corrected `choiceBoardPokemon` resolves `ownerSeat` + `targetZone` + exact `benchIndex`/`slotIndex` in the published actor observation and confirms the printing. Missing/mismatched physical locations fail closed.
2. **Guzma’s dual owner.** Printed Guzma BUS 115 text says to switch an opponent's Benched Pokémon with their Active, *then* switch one's own Active with one of one's own Benched Pokémon. The policy previously required every Guzma Pokémon choice to have `ownerSeat='opponent'`, rejecting the mandatory own-Bench prompt. The corrected policy distinguishes opponent-target scoring from own-pivot scoring. It promotes a visible Stoutland lock pivot when Garbotoxin is absent and prefers Bunnelby under visible Garbotoxin.
3. **Targetless Supporter root.** The action frontier projects `PLAY_CARD_ACTION` and may contain no `target` before Guzma's target-selection prompt. Previously the policy assigned score 0 to such a root and selected Pass. The corrected rule recognizes a legal gustable opponent Bench plus own pivot, retains the explicit-target path, and declines the root when no eligible opponent Bench is visible. The native Store remains the legality authority.

## Executable decision evidence

- Exact mainline original policy evaluated against the branch's full 45-case test suite and current shared protocol: **38/45 passed**, with seven identifiable failing decisions (three wrong physical targets, one nonexistent target wrongly selected, two own-Bench Guzma continuations rejected, and one legal targetless Guzma root incorrectly passed). The eighth new case, no opponent Bench → Pass, already worked on main.
- Corrected exact branch source plus the complete 45-case suite: **45/45 passed** under in-memory V8 CommonJS evaluation, using the repository's current `agent49-policy-protocol.cjs` `validateRequest` and `validateDecision`. Mainline baseline `37/41` on duplicate-target additions; intermediate branch `41/43` before own-Bench correction; last intermediate branch `44/45` before targetless-root correction. These individually reproduced failures all reversed after the respective patches.
- Source: `simulation/evaluation/2026-11/agent10-rank2-vileplume-control-opponent-policy.cjs`, branch blob `7f45cce6b58c7575fb3e7f1189874308e4be09dd`.
- Test: `tests/2026-11/agent10-rank2-vileplume-control-opponent-policy.test.cjs`, branch blob `bac17f594d3d35688294891c3f13b5aef4acad6b`.
- Shared protocol used unchanged: `simulation/evaluation/2026-11/agent49-policy-protocol.cjs`, main blob `d8349ae6f3537816b357b8309e9ab140ddec51eb`.
- Host metadata checked against `simulation/evaluation/2026-11/agent36-prompt-projection.cjs` `projectChoosePokemon`: exact `benchIndex` or `slotIndex`; actor-owned observation only. No private zones used.

## Limits and follow-up

These are **synthetic actor-only decisions**, not native Store state transitions, a valid three-prompt sequence driven by the actual engine, full Node worker IPC, game traces, paper adjudication, opponent competence or field win-rate evidence. The mock root→two-prompt test is an ordered synthetic choice sequence, not a physical settlement receipt. Independent review should challenge one actual native rank-2 Guzma continuation when permitted; no new workflow or game authorization is implied. The separate rank-2 v2 worker was not modified or tested.

The code branch is intentionally unmerged pending the existing owner/reviewer decisions. No Stage-A, V3, CI, official benchmark, frozen policy or deck status changes.


## Engine setup: complete actor-only opening decisions (28 November extension)

The same v1 worker previously lacked all three authenticated host engine setup prompts: `CHOOSE_STARTING_POKEMONS` (Basic selection or no-Basic mulligan), `GO_FIRST` and `WANT_TO_DRAW_CARDS`. A normal opponent worker therefore could abstain before the first legal turn. The updated branch handles exactly those three prompt descriptions, requires phase 1, the trusted engine provenance, exact typed options, and rejects malformed provenance or out-of-phase attempts. All other prompt types—including historical tests that use generic engine source labels—continue through their existing code without interception.

- Starting Basics: preserve native sorted physical hand indices and select up to the native maximum. If the legal prompt presents no Basic and permits zero, select the native empty-selection token.
- Coin-flip winner choice: choose going **second** to retain the option for the rank-2 Bunnelby Barrage + TM: Evolution first-turn attack. This is a **policy heuristic**, not a measured performance advantage.
- Opponent mulligan bonus: choose the largest offered native draw count using the typed `choiceIndex` and exact `Draw N card(s)` label.
- Negative controls include phase-2 lookalike and a forged card-effect source with matching description.

**Exact before/after:** same previous branch source and six new tests: **46/51** protocol-validated V8 decisions; updated branch source and unchanged 51-test suite: **51/51**. The prepatch branch fails five cases, passing the going-second choice accidentally by generic fallback. This is a synthetic actor-protocol test, not physical game setup, native Store settlement, or an authorized game. Current branch policy blob `6861ff6730f15b8f58dfcf8567721bf7f2ffc8bd`, test blob `80b6d8c3b065afd05141e6b27b8cbec31623213b`, both readback verified. No deck or source change.

