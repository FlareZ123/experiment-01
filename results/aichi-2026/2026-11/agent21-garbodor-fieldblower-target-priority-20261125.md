# Agent21: Garbodor Field Blower target-priority gap in PR #69

**Date:** 25 November 2026  
**Decision relevance:** candidate-policy competence for the fixed Hood Shield 60. This is a source-bound policy review, not a native game or matchup result.

## Finding

PR #69 correctly recognizes a Tool-equipped Garbodor as an Ability-lock source for Radiant Eternatus's Climactic Gate. However, its Field Blower target policy does not prioritize removing the Tool from an effective Garbotoxin source over unrelated opponent Tools.

At branch `agent46/candidate-policy-competence-20261124`, head `e7c4d9032fbb0ee162028d744f2bab1debd7a52e`:

- `collectAbilityLockSources()` adds each Tool-equipped Garbodor with `all-tool-attached` scope; `hasRadiantGateLock()` therefore continues to report a lock while any effective Garbotoxin source remains.
- `hasOpponentToolRemovalTarget()` returns true for any opponent Tool-bearing Pokémon, not specifically a Garbodor sustaining Garbotoxin.
- `chooseFieldBlowerPokemon()` scores any opponent Active Tool-holder at 1000 plus generic Tool value and any Benched Tool-holder at 700 plus generic Tool value. Its only special target bonus is for a Stealthy Hood that blocks Fairy Zone. There is no Garbodor/Garbotoxin source bonus.
- `fieldBlowerToolRemovalScore()` similarly prefers Active targets and selected Tool names; it has no Garbotoxin-specific priority.
- Existing tests cover generic Active/Bench Tool holders, Stealthy Hood, and Garbotoxin's suppression effect separately. They do not test selecting Garbodor's Tool over an unrelated Active Tool when both are present.

The relevant implementation is in `simulation/evaluation/2026-11/agent46-candidate-policy.cjs` around `chooseFieldBlowerPokemon` (1125–1156), `fieldBlowerToolRemovalScore` (1366–1376), `hasOpponentToolRemovalTarget` (2267–2270), and `hasRadiantGateLock` (2182–2202). The focused tests are in `tests/2026-11/agent46-candidate-policy.test.cjs` around the Field Blower target-selection cases (3515–3725) and the Garbotoxin lock cases (4262–4319).

## Why it is field-relevant

The four authenticated Aichi Garbodor lists are ranks **8, 11, 16 and 22**. Their source inventories contain:

| Rank | Garbodor copies | Float Stone | Muscle Band | Stadiums |
| ---: | ---: | ---: | ---: | ---: |
| 8 | 2 | 4 | 1 | 0 |
| 11 | 2 | 3 | 1 | 0 |
| 16 | 3 | 4 | 1 | 0 |
| 22 | 2 | 4 | 1 | 0 |

The fixed Hood Shield candidate has one Field Blower. These four opponent lists have no Stadium, so the Field Blower two-Tool mode is the relevant route in the simple case.

A concrete reachable counterexample is an opponent Active attacker with Float Stone and two Benched Garbodor, each with Float Stone. With a maximum-two Pokémon-target prompt, the current policy ranks the unrelated Active Tool-holder first and then one Bench Tool-holder. At least one Garbodor remains Tool-equipped, so Garbotoxin remains effective and Radiant Gate is still blocked. With three Garbodor Tool sources (the rank-16 list contains three copies), even choosing two Garbodor tools cannot clear all sources in one Field Blower. The exact board is a counterexample state, not a claim that every game reaches it.

This matters because Garbotoxin is a Bench/global Ability: removing a Tool from an unrelated Active Pokémon does not deactivate it. The candidate cannot attach Stealthy Hood to Radiant Eternatus before the on-play Gate trigger, so the relevant source must be disabled before attempting that Gate line. The existing Gate lock resolver correctly treats any remaining Tool-equipped Garbodor as effective.

## The one Field Blower can also be spent before a lock source appears

The root play score is broad as well: `scoreTrainerPlay()` gives Field Blower its play score whenever `hasStadiumRemovalTarget()` **or** `hasOpponentToolRemovalTarget()` is true, and the latter is true for any opponent Tool. The Lockbridge/Hood candidate has one Field Blower. In a turn with only an unrelated Active Float Stone and no live Garbodor/Stealthy Hood/Stadium lock target, the worker can still spend its only copy; it does not price the opportunity cost of saving it for a later Gate blocker. Removing a Float Stone can be useful, so this is not automatically a bad play, but the current trigger is not source- or plan-aware.

## Guzma does not currently prioritize the remaining lock source

The same gap continues after Field Blower. The candidate has one Guzma, but `canGuzmaForAttack()` returns true if **any** Benched opponent Pokémon is KO-able, and the `Guzma` target rank is based on attack score, Prize liability, and remaining HP. It has no bonus for KO'ing a Tool-equipped Garbodor whose removal would deactivate the last Garbotoxin source. In rank 16's three-Garbodor case, a useful combined line may be Field Blower on two sources plus Guzma/attack on the third; the current policy has no explicit source-removal objective to ensure it takes that line instead of gusting another attractive Prize target. This is a policy-priority gap, not a claim that the line is always available.

## Narrow remediation if separately authorized

1. Give a visible Tool attached to an effective Garbotoxin source priority over unrelated Tool-bearing Pokémon when selecting Field Blower targets.
2. If multiple Garbodor sources are present, prioritize all effective sources; do not treat Field Blower as having cleared the lock while any source remains.
3. Add both-seat regressions with (a) an unrelated Active Tool-holder plus two Benched Tool-equipped Garbodor and max-two selection, (b) max-one selection, and (c) three effective Garbodor sources. Assert that `hasRadiantGateLock()` remains true until the last effective Garbotoxin source loses its Tool or is otherwise suppressed.
4. Keep the existing Stealthy Hood/Fairy Zone priority and Stadium-removal behavior; the new priority must be source-specific rather than a blanket preference for all Garbodor cards.

No PR #69 code or tests were changed. The branch remains frozen pending owner/Critic scope; this finding should be reviewed before any claim that its Field Blower line is competent against the authenticated Garbodor field.

## Current PR #69 head recheck — 2026-11-25 08:13Z

Rechecked the current PR #69 head `b29cb03e3845acfd2e4dfe4a6f9a0627882a1eae` after the earlier report was written against `e7c4d9032fbb0ee162028d744f2bab1debd7a52e`. The same source-priority gap remains:

- `chooseFieldBlowerPokemon()` at line 1125 still gives an unrelated Active Tool-holder a +1000 Active bonus and a Benched Tool-holder +700, with no Garbodor/Garbotoxin-source bonus.
- `fieldBlowerToolRemovalScore()` at line 1366 still has no effective-Garbotoxin-source priority.
- `hasOpponentToolRemovalTarget()` at line 2267 still returns true for any opponent Tool, so `scoreTrainerPlay()` at line 2332 can spend the one Field Blower on an unrelated Tool before a live Garbotoxin source appears.
- `hasRadiantGateLock()` at line 2182 still recognizes a remaining Tool-equipped Garbodor as a lock source.
- Current tests at lines 3581–3710 cover generic Tool choice / Active-vs-Bench indexes; the Garbodor lock tests around 4264–4330 cover lock state separately. There is still no combined regression where an unrelated Active Tool-holder competes with two Benched Tool-equipped Garbodor, nor a Guzma follow-through that removes the last source.

The Aichi Garbodor inventories in the table above have **zero Stadiums**, so the relevant Field Blower mode is Tool-only; the current defect is target priority, not Stadium-vs-Tool mode selection. The rank-16 list has three Garbodor, so even correct two-target selection cannot clear all three at once; policy must preserve the lock state until the last source is removed or KO'd.

No code or test was changed. This recheck updates the evidence for the existing policy-competence blocker only.
