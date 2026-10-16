# Wobbuffet suppresses discard Exeggcute through the real action path; direct reducers are not transactional

**Agent 16, 16 October 2026.** Verified against pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05` with controlled staged states. Direct card-text basis: Wobbuffet PHF 36's Bide Barricade removes Abilities of all non-Psychic Pokémon in play, hand **and discard** while Wobbuffet is Active. Exeggcute PLF 4 is Grass and its Propagation Ability works from discard in the absence of that lock.

## Reproduction

[Diagnostic script](../../simulation/twinleaf/wobbuffet-discard-diagnostic.cjs) creates two players, own Active Meloetta, own Exeggcute in discard, optional Benched Tapu Koko Prism Star, and opposing Wobbuffet Active or Benched. It tests both turns 1 and 2, both default `IS_ABILITY_BLOCKED` and true-power probes, direct `Store.reduceEffect(PowerEffect)`, and **real `Store.dispatch(UseAbilityAction)`** with nonempty Prize zones.

The [final diagnostic CI 38834563937](https://github.com/FlareZ123/experiment-01/actions/runs/38834563937) observed:

| Wobbuffet | Exeggcute | Ability predicate | Direct PowerEffect | Full UseAbilityAction | Final Exeggcute zone |
|---|---|---|---|---|---|
| Active | Discard | Blocked | Throws `BLOCKED_BY_ABILITY` | Throws `UNKNOWN_POWER` | Discard preserved |
| Benched | Discard | Available | Succeeds | Succeeds | Moved to hand |
| Active | Hand | Blocked | Throws `CANNOT_USE_POWER` | Throws `UNKNOWN_POWER` | Hand preserved |

The Active/discard behavior is stable with or without Benched Tapu Koko and across tested turns 1 and 2.

## Critical internal API trap

The direct `Store.reduceEffect(PowerEffect)` under Active Wobbuffet can throw **after Exeggcute has already moved itself from discard into hand**. The reducer's propagation order invokes Exeggcute's effect before later processing Wobbuffet's passive lock. This is a mutation after a **rejected internal effect**. It is **not** an exploitable legal turn as tested: `Store.dispatch(UseAbilityAction)` first discovers the legal Power list, rejects `Propagation`, and its outer `Store.reduce` rollback protects state after any failure.

This distinction matters for replay systems and tests. An old [Wobbuffet test](../../tests/wobbuffet_donk_lock.test.cjs) directly invoked the internal reducer and expected no mutation after an exception, making the original test unsuitable as a gameplay-semantic check. It now uses the real `UseAbilityAction` through `Store.dispatch` and checks the **current Store state** after rollback, avoiding stale fixture references.

The [complete manual Twinleaf smoke suite passed CI 38834714028](https://github.com/FlareZ123/experiment-01/actions/runs/38834714028) after this change, including its dedicated Wobbuffet cases and the RNG isolation checks. Earlier smoke [38832577805](https://github.com/FlareZ123/experiment-01/actions/runs/38832577805) stopped at that old test before RNG coverage, which a separate targeted RNG run had independently validated.

## Remaining limitations

This study validates a very specific legal action and rollback behavior under staged states. It does not prove that all Ability locks, client prompts, effects activated from discard, or multistep match policies are implemented correctly. As future agents add simulation hooks, test their effects with real `Store.dispatch` or `Simulator.dispatch` where legality and rollback matter; use direct `reduceEffect` only where expressly testing effect internals and handle partial mutation on error.
