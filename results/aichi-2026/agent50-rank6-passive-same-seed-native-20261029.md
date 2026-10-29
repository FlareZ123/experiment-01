# Rank 6 Iron Thorns: native passive Initialization despite zero attacks

**Agent 50 | 29 October 2026 | retrospective read-only original-Store analysis.** This study changes no candidate 60, source 60, decision policy or original seed. It does not establish competitive wins.

## Question

The precommitted [32-arm canonical scout](agent41-prospective-canonical-scout-native-20261029.md) saw only five opponent AttackActions in its 16 rank-6 arms. The exact Aichi rank-6 source has **four Iron Thorns ex and no other Pokémon**. Its Initialization is a continuous Active-Spot Ability that may suppress non-Future Rule Box Abilities **even if the source never attacks**. How many genuine rank-6 game observations show native candidate Power suppression under a noninterfering read-only observer?

## Executed experiment

The [CJS runner](../../simulation/evaluation/agent50-rank6-passive-32same-seed-replay.cjs) verifies the precommitted [29 October source/candidate and seed registration](registrations/agent41-prospective-canonical-32-20261029.json) against Git blob SHA1 `8c54d8497f9927b04d501237462f64a42173d33d`, selects exactly its **16 original rank-6 arms**, then executes each in the real pinned Twinleaf Store **twice**. The control keeps `nativePressureWindows=false`; the observational replay uses `nativePressureWindows=true` and the pre-existing [read-only Initialization native observer](../../simulation/twinleaf/agent39-live-initialization-window.cjs). Both retain the same frozen actor-policy bundle and two exact fixed 60s.

Actual engine pin: `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. The observer/control comparison checks source and full physical deal fingerprints, source and candidate deck fingerprints, actor/start identity, SHA256 of every game's root-action ledger, root count, action/turn counts, terminal/cap/error status, winner, end reason and initial draw verification. It fails after archiving on any mismatch. [Pure classifier tests](../../tests/agent50-rank6-passive-32same-seed-replay.test.cjs) also test mutation, status and physical-deal mismatch detection.

**Reproducibility:** [manual CI run 40923313838 passed](https://github.com/FlareZ123/experiment-01/actions/runs/40923313838), checked out the pinned engine and archived the full per-arm [artifact 12919721942](https://github.com/FlareZ123/experiment-01/actions/runs/40923313838/artifacts/12919721942), file `agent50-rank6-passive-same-seed.json`. Its 16 arm records retain source fingerprints, root digests, candidate Ability names, attack counts, errors and every mismatch key. Archive retention is 30 days; source and preregistration remain in the repo. The run used research checkout `ac7c8cc066c775a6cd0e8b9bccf3a4f32cadd7ea`.

## Results

| Real source/Ability state at candidate entry | Original arms | With zero source attacks |
| --- | ---: | ---: |
| Source first, visible candidate Power **natively suppressed** with rooted return | **8** | **6** |
| Source first, **no eligible visible Power** | **6** | **3** |
| Source **did not start first** | **2** | **2** |
| **Total** | **16** | **11** |

All **16/16** observer/control pairs were noninterfering across all compared fields: **32 real Store executions, 0 exceptions**, 10 game terminals and six 260-root caps in each 16-arm condition. The 16 original rank-6 arms included five source attack declarations, all preserved.

Among **14 source-first arms**, Active Iron Thorns ex survived to the candidate-turn observation in **14/14**, with native blocked printed Powers in **8**. Examples include Fairy Zone, Skyliner, Squawk and Seize, Wonder Tag and Perfection. **Six of those eight suppressed-Power observations occurred in whole games with zero source attacks.** The remaining six source-first arms had no eligible visible non-Future Rule Box Power, consistent with candidate-specific inapplicability rather than an absent passive lock.

For each frozen candidate 60, statuses were four native suppression, three no-visible-Power, and one source-second. Both candidate 60s shared the starting source-deal fingerprint in seven of the eight corresponding trial pairs; the remaining pair differed despite the same integer seed. Every *control/observer* pair did preserve its own complete physical deal.

## Inference and strict limits

The original low opponent attack count remains a concern about **offensive tempo**. It cannot by itself establish absent source pressure: the observer confirms six zero-attack arms with native Power suppression. Continuous source lock, candidate-specific applicable Powers, tactical action actually denied, source attacks, and Prize/winner consequences are separate evidence dimensions. Merely checking the native `IS_ABILITY_BLOCKED` predicate does **not** certify that a beneficial Ability use was attempted, that the complete 2026 paper rules were faithfully modeled, or that the opponent was piloted competently.

The original rank-6 seeds had only one actually source-second **distinct** deal in eight. [Agent8's separately derived source-second resource access calculation](agent8-rank6-second-start-attack-access-20261029.md) motivates a future balanced cohort with new preregistered seeds. Do not replace or selectively exclude any original arm here. The 16 old seeds are reobserved, **never** promoted into a fresh prospective strength trial.

**Benchmark stays at 29/32 exact original 60s, zero competitively qualified games and no demonstrated final 99.5% fixed deck.**
