# Original Aichi rank17 Alolan Raichu: native Electro Rain damage-type mismatch

**Agent 1 | 2 November 2026 | verified executable engine differential | zero qualified matches.**

## Precise pinned implementation mismatch

Original rank17 Yuya Yamano's authenticated printed 60 contains two **Alolan Raichu UNM 57**. Its printed *Electro Rain* attack says to discard any amount of Lightning Energy, and for each Energy discarded **do 30 damage** to a chosen opponent Pokémon (repeating the same target is allowed; ignore Weakness/Resistance). In the pinned Twinleaf revision `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, `ptcg-server/src/sets/08-sun-and-moon/set-unified-minds/alolan-raichu.ts` instead calls `new PutCountersEffect(effect, result.damage)` after allocation. The engine's `game/store/effect-reducers/attack-effect.ts` handles that class via the **PUT_COUNTERS_EFFECT** branch, incrementing the chosen Pokémon's counters directly. That path is distinct from native `PutDamageEffect` and its damage prevention/reduction/after-damage processing.

The supplied Advanced Player’s Rulebook Section II **B-08** classifies attacks doing damage to a selected Pokémon as **damage**; Section **C-07** explicitly distinguishes *putting damage counters* as an effect outside damage calculations. Thus the class selection in the original card reducer conflicts with printed-paper semantics.

## Reproducible pinned runtime differential

[Manual CI run 41441223466](https://github.com/FlareZ123/experiment-01/actions/runs/41441223466) built the exact pinned server and passed **four targeted tests** in `tests/agent1-alolan-raichu-damage-type-native.test.cjs` on [experimental branch](https://github.com/FlareZ123/experiment-01/tree/agent1-rank17-original-evolution-prospective-20261102), execution head `9d23ad945484eb34ea2db83b9e3385b5b34c9e92`:

1. The exact compiled `AlolanRaichu` callback emits `PutCountersEffect` despite its printed attack specifying damage.
2. With a genuine target's attack-effect immunity state, the native `shouldPreventAttackEffects` gate **blocks** the counter class while **allowing** the damage class.
3. A native `attackReducer` test with the same target's attack damage-prevention state allows the counter class to increment damage by 30 while the damage class correctly adds zero.
4. The real pinned **Mist Energy TEF** card's reducer blocks `PutCountersEffect` as an effect, while correctly allowing `PutDamageEffect` to pass through its protection (which explicitly says damage is not an effect).

These are executable pinned-engine differential tests with actual native effect classes and counter/damage reducers; they are **not** a complete paper-game reproduction. Specifically, some native protection effects, such as Manaphy's Bench-protection prefab, intercept **both** effect classes, so a universal claim that Electro Rain bypasses every damage barrier would be false.

## Research consequence and repair boundary

The original rank17 prospective 16-arm native test recorded exactly **one Electro Rain declaration** with the actor-only natural evolution policy. It is a **real attack declaration**, but its damage/defense semantics are not paper-faithful under this engine pin. Exclude any uncorrected Electro Rain game from qualified paper-Expanded performance evidence.

A research-owned, opt-in reversible correction is being tested at `simulation/twinleaf/agent1-electro-rain-damage-hook.cjs` on the same branch: it replaces only the printed original Alolan Raichu's Electro Rain `PutCountersEffect` with a genuine `PutDamageEffect`, preserving the underlying Store reducer and explicitly ignoring Weakness and Resistance. It leaves upstream Twinleaf untouched. **This hook is not certified until its direct native tests and all target cases pass.** Additional damage modifiers, copied attacks, optional selection, and simultaneous multi-target effects require independent review before any paper-equivalent game claim.

**Benchmark remains:** exact original 60s 29/32; 0 competitively qualified games; 99.5% unproven.
