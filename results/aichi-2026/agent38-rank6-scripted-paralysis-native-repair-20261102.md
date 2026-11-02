# Scripted rank6 Volt Cyclone illegally attacked a Paralyzed Iron Thorns: original Store repro and opt-in repair

**Agent38 | 2 November 2026 | native Store and rules-backed defect | zero qualified games**

## Discovery

The separate [prospectively frozen rank6 native payment experiment](agent38-native-plumeria-cost-conservation-20261102.md) retained one original Store error in **both** payment-policy settings on registered trial `6:0:B:new-moon-lockbreaker-v1`. This was source seed **3406624545**, original Aichi rank6 **Iron Thorns ex source seat0**, New Moon Lockbreaker opposing seat1. The reason was `BLOCKED_BY_SPECIAL_CONDITION`, exactly after 40 native actions. The failed trial was retained in all original counts; later investigation and repair do not retroactively qualify it.

The [separate two-attempt read-only native diagnostic CI 41405685213](https://github.com/FlareZ123/experiment-01/actions/runs/41405685213) recorded native abort evidence without the original comparison's compact-result field omissions. [Artifact 13123331771](https://github.com/FlareZ123/experiment-01/actions/runs/41405685213/artifacts/13123331771) ZIP SHA256 `53fd040f1c29cdaac5685c3eb172d07f5021a2c104fb84e6822195869045d8b7`.

The source opponent **Solrock** used its printed **Scorching Light** on global turn2. This attack flips a coin, Paralyzing on heads or Burning on tails in the supplied Expanded card database (Celestial Storm Solrock SM7 #62, identically worded EX Deoxys ex8 #47). The old opening-line wrapper then forced its own source's turn3 `Tag Call -> Guzma & Hala -> Thunder Mountain Prism Star -> Double Colorless Energy -> Volt Cyclone`. The original Store rejected the final `AttackAction('Volt Cyclone')` from original source seat0, turn3, action40. The observed conditions are consistent with Paralysis from Scorching Light. The compact public abort board did not itself expose condition enum values, so the coin outcome is inferred from the original legal effect and rejection.

The ordinary `agent34-actor-only-root-policy.cjs` already correctly checks native `SpecialCondition.PARALYZED=0` and `ASLEEP=2`. The defect is isolated to the separate rank6 `simulation/twinleaf/rank6-broad-thorns-policy.cjs` scripted source opening, which originally contained **three unguarded direct** Volt Cyclone `new AttackAction` branches. The Advanced Player's Rulebook supplied with the repository (A-01, first attack step) prohibits announcing an attack while Asleep or Paralyzed. The pinned native enum may be found in `vendor/twinleaf/ptcg-server/src/game/store/card/card-types.ts`.

## Source repair and scope

Commit `9a5e83a33cd640fe4036e36e4cfc6f880f883055` introduced a shared **`chooseNativeAttackOrPass`** helper for all three scripted Volt Cyclone sources, calling exact pinned native `SpecialCondition` enum constants. Under a clearly versioned default-off opt-in `nativeSpecialConditionAttackGuard` (also environment flag `AGENT38_RANK6_SCRIPTED_SPECIAL_CONDITION_GUARD_DEV=true`), if the source's Active is Asleep or Paralyzed it emits an authenticated native `PassTurnAction`, marks scripted opening incomplete, and records the guard's reason. If no incapacitating condition is present, it emits the same native Volt Cyclone action as the old code.

The primary bilateral runner now also has an explicit default-off `rank6ScriptedSpecialConditionGuard` option, passed to both the turn2 and turn3 original source wrappers, and it emits `rank6ScriptedSpecialConditionGuardOptIn` in the top-level run provenance. This provenance plumbing was added after the first proof and is subject to its own repeat. Original fixed registrations and old native archived comparisons have not been modified.

Pure regression `tests/agent38-rank6-scripted-condition-guard.test.cjs` covers numeric 0 and 2 blocking, Confused/Poisoned/Burned remaining attack-eligible, and all three direct scripted Volt Cyclone paths routing through the guard. Existing CI runs on pinned Twinleaf submodule rather than modifying upstream.

## Four-attempt native Store causal replay

The [first retrospective four-attempt native pair CI 41406487487](https://github.com/FlareZ123/experiment-01/actions/runs/41406487487) ran the original two candidate 60s with policy guard OFF and ON under the same seed **3406624545**, original rank6 source seat0, using the existing frozen-source registration. It is a targeted failure reproduction, *not* a newly sampled competition study.

The CI completed successfully: [artifact 13123742033](https://github.com/FlareZ123/experiment-01/actions/runs/41406487487/artifacts/13123742033), ZIP SHA256 `fe9ae08e039cb124a3d7e6c87c4b8fb46281f274b8c9fb747a23ef49d205f352`.

- The original source physical first-deal digest **`83f83d7bb429a6c288716414a8071998ac832910cdbde1a03bab8cd9a694ad97`** matched exactly between the native failed OFF arm and accepted ON arm. The original companion champion-reference comparison also retained its full source initial digest.
- **All 40 prior accepted public native Store actions matched exactly in ordinal, player, public card, action and turn.** Before the repair, action40 was rejected `AttackAction('Volt Cyclone')` from source seat0, turn3. After enabling the guard, actual Store action40 was source seat0 `PassTurnAction`.
- The ON Store continued without the original paralysis exception. Its native action-input witness had 251 matched action-object dispatches and zero rejected matched dispatches. A source pass is a legal but usually strategically suboptimal fallback when a real switching or recovery line exists. The repair addresses legality; it does not make the player strong.
- Every native test in this document is developmental. **Zero competitively qualified games** and no tournament-clock inference, no claim of improved rank6 versus New Moon match win rate.

The original prospectively frozen 32-attempt Plumeria study remains **15 physically matched pairs plus one retained double error**, rather than being retroactively reclassified as 16 valid. A new registration and different independent seeds would be needed to compare alternative source tactics and their performance.

## Handoff

The dedicated failure diagnosis runs in `simulation/evaluation/agent38-source-special-condition-native-diagnostic.cjs`. The exact comparison verifier is `simulation/evaluation/agent38-native-scripted-condition-recovery-pair.cjs`, with the native workflow input `test_native_scripted_condition_repair:true` in `.github/workflows/agent41-rank6-grouped-denial-source-panel.yml`.

[Agent4 informed](../../communications/agent4/20261102T073142Z_agent38_rank6_paralysis_scripted-attack-repair.md). The next research should test broader native opponent-triggered statuses (including Confusion coin flips and other active-dependent locks), verify source attack availability before spending Tag Call and Guzma & Hala, and avoid prematurely default-enabling a new policy in historical comparisons.
