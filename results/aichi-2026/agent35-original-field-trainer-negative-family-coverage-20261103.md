# Original Aichi 29-deck Trainer negative-rule family census

**Agent 35 | 3 November 2026 | source-locked, pure audit | no competitive-game evidence**

## Question and source

Which *exact English name + set* Trainer cards in the authenticated 29 original Aichi Open League Top 32 60-card lists already have a registered negative necessary-condition certificate in the four existing reusable paper-rules components? This gives a reproducible cross-field index for generic owner-only Trainer policy work. The missing original ranks 23, 25, 28 remain excluded; no substitute inventories are fabricated.

Inputs are `results/aichi-2026/full-decklists.json` (Git blob `ae773f6201d7aa69d31914dbfee66f3fba692200`) and the committed modules `agent27-owner-trainer-discard-contention.cjs` (exact-print hand payment), `agent4-owner-paper-trainer-necessary-screen.cjs` (first-owner-turn restriction), `agent30-public-prize-trainer-necessary.cjs` (public Prize predicates), and `agent6-public-removal-target-certificate.cjs` (public removal target). Their read-time literal maps are imported as-is. The script does **not** introspect every other card-specific implementation elsewhere in the repository. It checks that each original deck contains 60 cards and that all 29 ranks are distinct.

## Reproducible field-wide output

| Inventory or matching property | Physical Trainer copies across the 29 original sixties |
| --- | ---: |
| Total Trainer cards | **1,035** |
| At least one of these four specific negative-rule families | **287 (27.73%)** |
| No matching entry in these four specific families | **748 (72.27%)** |
| Exact-print hand-payment definition (including zero-discard modes) | 259 |
| At least one positive hand-discard mode | 184 |
| Exact first-owner-turn printed restriction | 43 |
| Public Prize predicate | 15 |
| Public Tool/Stadium removal target definition | 12 |

There are **125 distinct Trainer name+set identifiers** in these original source lists; **18** identifiers match at least one of the four maps. Individual family tallies overlap, so they cannot be added to obtain the 287 count. An optional enhanced cost counts under “at least one positive discard mode”; that does not make discarding mandatory. The JSON also exposes `unavoidableHandDiscardCopies` where *every* registered cost mode requires a discard.

**Highest-frequency Trainer printings without a match to these four maps:**

| Printing | Physical copies | Original lists including it |
| --- | ---: | ---: |
| VS Seeker PHF | 59 | 23 |
| Guzma BUS | 48 | 25 |
| Battle Compressor PHF | 33 | 17 |
| Hisuian Heavy Ball ASR | 25 | 20 |
| Float Stone BKT | 24 | 12 |
| Muscle Band XY | 23 | 15 |
| Lillie's Determination MEG | 19 | 16 |
| Rescue Carrier EVS | 17 | 5 |
| Sky Field ROS | 17 | 7 |
| Marnie SSH | 16 | 13 |

The unmatched counts are a **prioritization map for which printed-specific necessary conditions to investigate next**. They do not show that these cards are unimplemented or necessarily hard to play. For example, the generic rules layer already screens Supporter quotas, Tool recipient slots, Stadium replacement and public Item lock independently of those four exact-printing maps. Several unmatched cards have existing individual tactically specialized modules elsewhere in the repository.

As an upper-bound view of where the four-map negative-rule descriptions remain thin, original Iron Thorns rank 6 and Snorlax Stall rank 7 each have 38 unmatched Trainer copies. These are deck inventory figures, not actual in-hand playable decision opportunities and not estimates of game loss.

## Why this matters to the shared policy

The [Critic generic Trainer decision directive](../../communications/broadcast/20261103T1010Z_critic_general_trainer_planning_over_per_card_bridges.md) and [Agent29 two-seat owner-root census](agent29-canonical-bilateral-generic-trainer-frontier-native-20261103.md) expose terminal unsupported Passes as a policy bottleneck. [Agent50's generic native fallback](agent50-generic-native-trainer-aba-20261103.md) demonstrates that a root can be accepted by Store while source payment, target custody and opportunity cost remain unresolved. The four-map census shows which existing negative-rule components a genuinely general paper-safe planner can call and how much source inventory they touch.

A decision-useful next step is to implement and evaluate owner-only **candidate generation and same-root competition** for common high-incidence Trainer lanes (VS Seeker, Guzma, Battle Compressor, and known discard-paid search), with exact printed preconditions and physical resource conservation. That policy should separately account for held, known necessary-ineligible, unresolved, payable and selected options, preserve alternate uses of the same connector, and verify an actual characteristic payoff plus opponent reply. Native enumerator offers must remain advisory. Freeze this as one symmetric profile and test real physical deals in both seats before interpreting any game result.

## Execution and limits

Pure CommonJS script [`scripts/agent35-field-trainer-negative-family-coverage.cjs`](../../scripts/agent35-field-trainer-negative-family-coverage.cjs); three cases [`tests/agent35-field-trainer-negative-family-coverage.test.cjs`](../../tests/agent35-field-trainer-negative-family-coverage.test.cjs). Existing **manual-only** [`aichi-card-audit.yml`](../../.github/workflows/aichi-card-audit.yml) includes an opt-in two-minute, no-submodule-compile census job with the machine-readable full per-deck counts and top unmatched printings.

The initial pure CI [41734829610](https://github.com/FlareZ123/experiment-01/actions/runs/41734829610) failed due a returned-property variable typo; the report never treated it as validated. Corrected at commit `9dd58a030e6bc904298c66008b358ad7757d538f`. **Compiled Node 22 pure CI [41735125091](https://github.com/FlareZ123/experiment-01/actions/runs/41735125091) succeeded (3/3 tests)**, with artifact `agent35-original29-trainer-negative-gate-census` ID **13277313795**, ZIP SHA-256 `7fd3c4918c6056ab60a2acbd0d60cf3f92ca10c4aa1270417ab6a06475240ed4`, commit `9dd58a0`. No game simulation or native Store execution took place. All printed-card rule coverage conclusions are restricted to these four negative-certificate families.

**Competitive status unchanged:** 29/32 exact originals, 0 qualified competitive games, no selected fixed 60, no demonstrated 99.5% win rate.
