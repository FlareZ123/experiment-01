# Agent4: four independent rank6 source seeds reproduce Underworld lock-abort prevention

**2026-11-06 | sixteen fresh-seed paired native games, pinned real Twinleaf, zero independent paper-competitive qualifications.**

[Successful native CI 42309425872](https://github.com/FlareZ123/experiment-01/actions/runs/42309425872), [complete archived output artifact 13548690153](https://github.com/FlareZ123/experiment-01/actions/runs/42309425872/artifacts/13548690153), artifact ZIP SHA256 `4194a6e53b010483e402e9bf9b7099112c0d6bae9c5c340a1adb3566fe0981a9`. Native game engine remains pinned to `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.

The preceding [24-game exact historical seed comparison](agent4-rank6-underworld-owner-visible-veto-24-paired-20261106.md) found 18 actor-visible no-Stadium, untooled Shadow Rider VMAX vs Iron Thorns Initialization vetoes, and avoided six original `UseAbilityAction: Underworld Door` native `UNKNOWN_POWER` aborts. Those were only two unique historical starting seeds repeated over A/B/A policy modes. The next question was whether that narrow rescue continues to operate on **unseen random opening deals**, without hand-picking starts where Underworld was known to fail.

## Truly independent opening-seed registration

Four uniform 32-bit seed draws were **actually executed** once in Python using `secrets.randbits(32)` before registration, with no game results read:

| New source-seed group | Candidate physical slot | Seed integer |
| --- | --- | ---: |
| `6:701:A` | A | 2562060802 |
| `6:702:B` | B | 4002499586 |
| `6:703:A` | A | 3244712031 |
| `6:704:B` | B | 4196756544 |

[Exact preregistration](../aichi-2026/registrations/agent4-rank6-underworld-visible-guard-holdout-16-v1-20261106.json) was committed as `1f0babe709ce1cf9105090827a8a3e21477e60f2` before the [native holdout runner](../../simulation/evaluation/agent4-rank6-underworld-visible-guard-holdout-16.cjs), [tests](../../tests/agent4-rank6-underworld-visible-guard-holdout-16.test.cjs) and successful CI. The authenticated original rank6 **Iron Thorns** 60 and both existing `champion-reference` and `new-moon-lockbreaker-v1` 60s were left unchanged. Four source-seed groups × two candidate 60s × two owner-policy arms (baseline vs exact narrow owner-visible guard) = **16 native games**. The original v3 `selected-v3-paper-plus-funded-mobility` policy was held constant in both arms, with 180 native root cap per game.

## Results

All five declared holdout evidence gates passed: 8 true Store games in each arm, exact full original source+candidate starting-deal fingerprints for each paired game, 8 proper source pairs, 4 unique sampled seeds, owner-guard audits confined to detached actor-visible state. No source seed or opponent deck substitution.

| Random opening group | Candidate 60 | Original native result | Guard native result | Owner-visible guard value |
| --- | --- | --- | --- | --- |
| `6:701:A` | champion | `engine-error` at 93 accepted roots, rejected Underworld Door | No error; native `finished:true`, 96 accepted roots | Named rejection removed |
| `6:701:A` | New Moon | 180 roots, unfinished | 180 roots, unfinished | No named rejection in either |
| `6:702:B` | champion | `engine-error` at 42 accepted roots, rejected Underworld Door | No error; 180 roots, unfinished | Named rejection removed |
| `6:702:B` | New Moon | 180 roots, unfinished | 180 roots, unfinished | No named rejection in either |
| `6:703:A` | champion | 89 roots, native `finished:true` | 89 roots, native `finished:true` | Same native terminal behavior |
| `6:703:A` | New Moon | 180 roots, unfinished | 180 roots, unfinished | No named rejection in either |
| `6:704:B` | champion | 180 roots, unfinished | 180 roots, unfinished | No named rejection in either |
| `6:704:B` | New Moon | 180 roots, unfinished | 180 roots, unfinished | No named rejection in either |

Totals: **2 authentic named Underworld Door `UNKNOWN_POWER` baseline failures, 0 in the guarded arm**; the audit recorded **6 owner-visible veto decisions** across the 8 guarded runs, including any recurring veto within a game. The control had 2 native engine errors, treatment had 0. The guarded `6:701:A` game genuinely reached an engine terminal (`finished:true`) where its original control errored; the player's win/loss, legal paper action payments, clock and opponent policy qualification remain unresolved. The `6:703:A` native terminal is identical in baseline and guard. All remaining native 180-root truncations are **incomplete**, not wins.

These are the complete first four independently sampled seed groups as preregistered, reported including uninteresting null results. Four groups are far too few for a stable rate estimate or confidence interval about any metagame opponent. Although the guard causally changes the native error outcome in two pairs under matched physical starts, it does not demonstrate stronger game tactics, a 99.5% win rate, or Top32 field coverage.

## Immediate implications

The narrow actor-visible public board check fixes a **real recurrent validity failure** on both original and random Iron Thorns source starts. This result supports research on a general, paper-rule-validated owner-available Ability frontier so the actor policy can compare alternate legal roots without repeatedly selecting powers suppressed by opposing locks. It also demonstrates why a native engine-finished terminal must remain separate from an authenticated paper-legal competitive win.

A follow-on [posthistorical-abort action study](agent4-rank6-underworld-owner-guard-genuine-opponent-followthrough-20261106.md) already documents first accepted Psychic Energy plays and actual opposing-side continuations on the two original selected starts. Validate exact native accepted target sidecar and paper Energy payment, and extend to other locking archetypes with authenticated opponent source sixties and fresh random seed groups. None of this changes the unresolved benchmark: 29/32 authenticated opponents, zero competitively qualified games, no demonstrated 99.5% rate.
