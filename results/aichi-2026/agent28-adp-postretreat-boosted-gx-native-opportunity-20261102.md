# Agent 28: native rank-19 ADP post-retreat boosted GX opportunity and printed metadata discrepancy

**2 November 2026.** Historical, source-dealt development evidence plus staged pinned-Store card execution. **Zero competitively qualified games or changed fixed-60 candidate rankings.**

## Why the existing Raging-only priority was insufficient

Agent 50's authentic original-rank-19 Float Stone comparison [physically promoted Arceus & Dialga & Palkia-GX](agent50-original-rank19-floatstone-adp-tempo-paired-20261102.md), rather than Raging Bolt ex, from Ho-Oh EX Active in two prior exact source-seat-0 deals. Both treated games immediately selected Ultimate Ray and later took all six Prizes in the native Store. An earlier [rank-19 Altered Creation resource study](rank19-direct-adp-altered-creation-opening.md) correctly identified a distinct boosted GX route: one functioning Double Dragon Energy on this Dragon-type ADP provides the attack's Metal requirement and its additional Water condition. That opening-only enumeration could not establish that an actually attained ADP board offered the GX alternative.

## New read-only native post-retreat observation

Added `simulation/twinleaf/agent28-adp-post-retreat-gx-window.cjs`, using only the acting player's detached public board/own-turn resources. It detects the exact printed Altered Creation-GX attack, active Double Dragon Energy cards, unused public GX quota, relevant public attack restrictions, and Temple of Sinnoh. `simulation/twinleaf/agent28-rank19-native-source-root-readonly.cjs` now attaches this observational record **after a real RetreatAction has settled**, when the original source player remains able to choose an owner-root action and no native prompt remains unresolved. It never changes any action, target, policy, shuffle, or card identity.

The first compiled read-only run [41432422920](https://github.com/FlareZ123/experiment-01/actions/runs/41432422920) exposed a misleading native metadata condition: the actual printed ADP attack list includes `Altered Creation-GX`, but its emitted `gxAttack` annotation is **false**. The initial strict annotation filter therefore reported a false-negative opportunity. Pinned upstream ADP implementation has a correctly named GX attack and explicitly calls `BLOCK_IF_GX_ATTACK_USED`; `gxAttack` is not the authoritative identification for this printing. The observer now recognizes the **exact printed attack name**, retaining `engineGxAttackAnnotation:false` as diagnostic evidence. This matches the previously identified general suffix/metadata distinction in [Agent 30's printed-GX audit](../twinleaf/../aichi-2026/agent30-powerglass-printed-gx-corrected-sourcefirst-completion-20261021.md).

The corrected compiled, manually dispatched [CI **41433111664**](https://github.com/FlareZ123/experiment-01/actions/runs/41433111664), at head `b8bd5920682e39fa3ef9f6aa85253b65f1a5c399`, passed all four pure preflight cases. It re-ran the same four previously registered original-source opponent/candidate games, retaining both development policies, both candidate 60s, all physical source seats and seeds. All **four** baseline/treatment source-deal fingerprints matched. Results:

| Original rank19 trial | Source Float Stone treatment: real post-retreat State | ADP attached Energy | GX spent? | Nominal boosted GX window |
| --- | --- | --- | --- | --- |
| Candidate A, champion reference | No ADP retreat | Not applicable | Not observed | Not observed |
| Candidate A, New Moon | No ADP retreat | Not applicable | Not observed | Not observed |
| Candidate B, champion reference | Turn **14**, ADP Active after genuine retreat | **2 Double Dragon Energy** | **No** | **Yes** |
| Candidate B, New Moon | Turn **16**, ADP Active after genuine retreat | **2 Double Dragon Energy** | **No** | **Yes** |

In both positive records, `printedGxFound:true`, `printedCost:[8]` (pinned Metal enum), `engineGxAttackAnnotation:false`, and `gxLocked:false`, `attackLocked:false`, `templeOfSinnoh:false`. The observation certifies **a visible resource/choice window**, not an actual Altered Creation announcement, native action legality at those exact late-game roots, lasting damage/Prize outcome, or improved game strength.

## Independent native Store attack effect execution

Added `tests/agent28-rank19-adp-boosted-gx-native.test.cjs` using the real pinned CardManager, Player, Store, State, original ADP CEC printing, both physical player seats, one or two Double Dragon Energy **physical objects shared by the slot and Energy index**, six real Prize cards per player, and a legal expanded-format board. [Manual CI **41433504487**](https://github.com/FlareZ123/experiment-01/actions/runs/41433504487), head `2fda219f53d220f21eb5fb9f82acb072e720ba90`, compiled pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05` and **passed all four native cases**:

- Exact `AttackAction('Altered Creation-GX')` was accepted on both seats with one attached Double Dragon Energy and with two.
- The source's actual `usedGX` became `true`.
- The source's actual `alteredCreationDamage` became `true`.
- The source's actual `usedAlteredCreation` became `true`, reflecting the boosted Water condition.
- Native Prize counts remained six each immediately after this zero-damage GX activation, and attached Double Dragon cards remained on ADP.

These are **bounded, staged native reducer receipts**. They demonstrate effect flags and valid GX invocation for the specified native board. They do **not** prove a subsequent 30-damage boost, extra Prize from a real KO, continuation after opponent action, immunity/lock interactions, or full paper fidelity. In particular, replacing the current source's first Ultimate Ray with Altered Creation-GX forfeits immediate 150 base damage, changes subsequent opponent replies and may expose a three-Prize TAG TEAM. Winning policy cannot be concluded from flags alone.

## Research consequence

A rank-19 source policy that automatically prioritizes Raging Bolt's Bellowing Thunder or counts only Raging Active roots can miss **both** real ADP offensive tempo and the existing boosted GX alternative. The next discriminating experiment should use the **same real source deal**, genuine owner-visible first-ADP root and actual Store attacks: compare `Ultimate Ray` to `Altered Creation-GX` without changing either 60, record prompt-closed effect/payout, subsequent attacking turns, post-ADP persistence and opponent responses. Keep every unsuccessful, censored or error arm in evidence.

The single-deck benchmark still has **29/32 original published Top32 60s**, with ranks 23, 25 and 28 missing. There are **zero qualified competitive games and no demonstrated 99.5% win rate**.
