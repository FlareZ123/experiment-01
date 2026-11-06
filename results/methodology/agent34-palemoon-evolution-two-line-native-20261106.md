# Paper Pale Moon-GX delayed KO after defending evolution: VSTAR and Stage1 replication plus existing reversible repair

**Agent34 | 6 November 2026 | pinned Twinleaf native Store effects, two defending evolution families, two attacking seats.**

## Finding

The pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05` retains a `Pale Moon-GX` pending end-of-opponent-next-turn `knock_out` on the original Defending Pokémon even **after that Pokémon evolves** on its following turn. Native `PlayPokemonEffect` successfully changes the defending card and clears its local attack effects, but the pending target stored on the owning Player still references the same `PokemonCardList`. Native end-of-turn resolution therefore Knocks Out **both the evolved card and its Basic**. This conflicts with the supplied advanced manual **A-05 Evolution** (attack effects disappear on evolution); it is independent of the already confirmed Active→Bench switch failure.

Existing **Agent36** research-owned [reversible evolution cleanup hook](../../simulation/twinleaf/pending-end-turn-evolution-cleanup.cjs) intercepts `Player.removePokemonEffects` during evolution, removes queued target effects, and restores the method afterward. Its authored provenance predates this experiment. Rather than duplicating the hook, this run provided a new **two-family, two-seat native negative/positive regression** of the existing correction.

## Native tests

[Unified staged GX native test](../../tests/agent34-pale-moon-gx-native-gate.test.cjs) adds two legal evolutionary chains:

- **Regidrago V SIT → Regidrago VSTAR SIT** (native VSTAR evolution).
- **Charmander MEW → Charmeleon MEW** (standard native Stage1 evolution).

For each chain and each physical seat 0 or 1:

1. The attacker uses native `AttackAction(Pale Moon-GX)` with exactly two Basic Psychic. Native Store queues one future `knock_out`.
2. The next owner turn is staged with valid evolution window and an actual copy of its Evolution card in its hand. Native `PlayPokemonEffect` evolves the current defender.
3. **Uncorrected**: `pendingEndOfTurnEffects.length === 1`; direct native pending resolver places both Evolution and Basic in the owner's discard pile and empties the Active.
4. **Existing Agent36 cleanup enabled**: after the same native evolution, exactly one `Pale Moon-GX` target entry is removed; no future queued KO applies and the evolved defender survives. `Player.prototype.removePokemonEffects` is restored exactly on completion.

All four uncorrected cases and four existing-hook positive controls **passed**. They use one staged position per condition, not full legal 60-card match openings or original Aichi source turns. The prior switch-only hook is separately tested against real original rank3 Guzma in [this historical 4-arm report](agent34-frozen-skyliner-guzma-gx-paper-switch-20261106.md); the evolution hook does not automatically apply to switching.

## Receipts

- [CI 42142775096](https://github.com/FlareZ123/experiment-01/actions/runs/42142775096), **SUCCESS**, initial two-seat native Regidrago VSTAR negative control. The direct GX fixture passed 16/16 dedicated tests at that commit.
- [CI 42143371995](https://github.com/FlareZ123/experiment-01/actions/runs/42143371995), **SUCCESS**, full staged suite passed **22/22** dedicated tests. Job log includes `AGENT34_PALE_MOON_EVOLUTION_NATIVE` for all four uncorrected cases and `AGENT34_PALE_MOON_EVOLUTION_RESCUE` for all four corrected cases. After the hook, exactly **one** `Pale Moon-GX` pending target is removed per case; prototype method restored.
- All tests are in the existing manual-only `.github/workflows/agent34-underworld-owner-prompt-native.yml`, pinned source and research adapters only. No vendor edit or automatic long-running CI.

## Research implications and limits

A delayed-attack-effect queue needs lifecycle invalidation on **evolution** as well as **Active→Bench movement**. Current root papers can overestimate a delayed-GX prize outcome if the opponent can evolve or switch before that queued effect resolves. The provided paper manual does not prove that a particular opponent can execute the needed evolution chain on time; actual owner hand, evolution timing, abilities and choice must still be established.

The source-level `DEVOLVE_POKEMON` helper clears `target.clearEffects()` without obviously invoking `Player.removePokemonEffects`; whether it also leaves stale pending entries needs a separate native test. More generally, delayed target lifecycles after devolution, leave-play or a replacement are unqualified. Both available research cleanup hooks are explicit opt-ins and narrowly verified on tested cases.

**Benchmark impact:** paper-fidelity failure and repair evidence only. Aichi source original inventories remain **29/32**, ranks 23/25/28 missing; **zero competitively qualified games**, no fixed 60 champion and no demonstrated 99.5% game win rate.
