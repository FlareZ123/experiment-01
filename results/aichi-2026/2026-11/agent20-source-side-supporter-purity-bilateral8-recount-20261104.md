# Agent 20: archived bilateral Supporter-purity source-side recount

**4 November 2026 | Independent inspection of preserved native JSON.** This is an audit of previously executed, preregistered development games, with **no new games** and **zero competitively qualified games**. It does not nominate a final 60 or establish a win rate.

## Evidence and provenance

- Original preregistration: [eight-source bilateral A/B/A registration](../registrations/agent20-native-supporter-proposal-purity-bilateral-8original-20261103.json) on the [Agent20 research branch](https://github.com/FlareZ123/experiment-01/blob/research/agent20-rank6-guzma-counterreply-20261103/results/aichi-2026/registrations/agent20-native-supporter-proposal-purity-bilateral-8original-20261103.json).
- Corrected v2 native run: [GitHub Actions 41736046880](https://github.com/FlareZ123/experiment-01/actions/runs/41736046880), artifact [13278698258](https://github.com/FlareZ123/experiment-01/actions/runs/41736046880/artifacts/13278698258), ZIP SHA-256 `4c02659b637f7293fb4d03d1c2949a81fee869e7a06ebb4b91f79a874d52f63a`. Archived JSON entry `agent20-supporter-proposer-purity-bilateral8-native.json`, uncompressed SHA-256 `d97821d33f060c660e130f023581c3dbcfc4e3779c3521d67a64c398717709ea` (2,408,024 bytes). Runner head `509634ebc7a423486db7c7120f9c6df5a292d815`; pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.
- Source files: [reversible Supporter proposal hook](https://github.com/FlareZ123/experiment-01/blob/research/agent20-rank6-guzma-counterreply-20261103/simulation/twinleaf/agent20-native-supporter-proposal-purity.cjs), [bilateral A/B/A runner](https://github.com/FlareZ123/experiment-01/blob/research/agent20-rank6-guzma-counterreply-20261103/simulation/evaluation/agent20-supporter-proposer-purity-bilateral8-native.cjs), and [adversarial two-Store tests](https://github.com/FlareZ123/experiment-01/blob/research/agent20-rank6-guzma-counterreply-20261103/tests/agent20-native-supporter-proposal-purity.test.cjs).
- [Agent41's independent original-v1/v2 comparison](../../../communications/agent20/20261103T2316Z_agent41_independent_v1v2_38real_38clones.md) confirms all 24 root ledgers byte-identical across instrumentation versions. V1 doubled its acceptance count because the same Action object underwent speculative Simulator validation. V2 separately records **38 real Store accepts** and **38 speculative Store accepts**. Only the former count as physical native actions.

## Complete registered-group recount

Each row has three actual attempts: unaltered control, corrected policy on **both** seats, and repeated unaltered control. All 24 attempts executed without engine errors. Every row matches all three initial full-physical-deal fingerprints. Every repeated control matches its original control exactly.

The source deck is the first rank in each pairing (rank 6 or rank 5); the second is its original Aichi opponent (rank 9 or rank 11). `A/B` denotes whether the source occupies native seat 0 or 1. The accepted counts are from `purityAudit.previouslyRestoredProposals`, classified against that row's `primarySeat`. **These are specific real native Store acceptances and not paper-game qualification.**

| Pair, seed kind, source seat | Source accepted | Opponent accepted | First changed root | Control vs treatment ending |
| --- | ---: | ---: | --- | --- |
| 6v9 historic A, seat 0 | 5 | 2 | source Pass → Eri, turn 2 | both capped 90 |
| 6v9 historic B, seat 1 | 2 | 4 | opponent Pass → Guzma, turn 2 | both capped 90 |
| 5v11 historic A, seat 0 | 1 | 2 | opponent Pass → Guzma, turn 2 | both native winner seat 1, 73 vs 52 roots |
| 5v11 historic B, seat 1 | 3 | 2 | source Pass → Guzma, turn 2 | control native winner seat 0 at 78; treatment capped 90 |
| 6v9 fresh A, seat 0 | 6 | 0 | source Pass → Guzma, turn 2 | both capped 90 |
| 6v9 fresh B, seat 1 | 4 | 2 | source Pass → Team Flare Grunt, turn 2 | both capped 90 |
| 5v11 fresh A, seat 0 | 2 | 2 | opponent Pass → Guzma, turn 4 | both capped 90 |
| 5v11 fresh B, seat 1 | 1 | 0 | source Pass → Guzma, turn 2 | both capped 90 |
| **Totals** | **24** | **14** | **8/8 first-root changes: 5 source, 3 opponent** | **0 qualified games** |

The eight treatment runs accepted at least one previously obstructed source Supporter, for a combined **24**. Five rows first diverge on the source seat; in three the opponent's newly accepted Supporter changes the original control's next root. The original unaltered controls accepted **zero** of these specific restored-proposal actions; this is an attribution to the hooked proposal subset, not a statement that original games could never play a Supporter.

## Downstream action evidence and limitation

Within the **fixed 90-Store-action prefix** of each arm, counting only actual `rootActionLedger` `AttackAction` entries:

- Source seats: unaltered controls **1**, treatment **4**.
- Other seats: unaltered controls **16**, treatment **10**.

These are **root action counts over diverging and censored timelines**, with prompt-resolution actions included in the 90-action budget. They cannot be compared as completed-game attack rates, evidence of tactical superiority, or a win-probability change. The single treatment-censored native-ending control is particularly important: its unobserved treatment continuation may have led to any eventual result. Only **one** treatment finished natively in these eight rows. Neither native finish is a certified paper game.

The native hook reverses exactly an owner `supporterTurn:0→global-turn` change made while an unaccepted `PlaySupporterTactic` proposal is created. Actual Store Supporter plays still write the post-acceptance quota; the hook leaves them intact. This mechanism has a separate [single-root native Guzma→switch→Volt Cyclone Prize witness](agent20-original6v9-guzma-native-supporter-quota-rollback-20261103.md). Original printed 60-card inventories are mapped by `planAichi` with equivalent Basic Energy and Japanese promo hooks enabled. Exact May 2026 physical artwork provenance, owner-hidden information, opponent policy competence, full field coverage and match-clock rulings remain outside this audit.

## Decision consequence

**Source-side conversion is demonstrated at the narrow native Store Supporter acceptance step.** The next meaningful test belongs inside the **single steward-selected common bilateral Issue #25 policy**, with owner-visible offer, printed quota, genuine payment/target/zone custody, settled attack or relevant lock payoff, and opposing reply. Do not extrapolate this 90-root archived canary into the field win-rate estimand. Retain source-vs-opponent seat attribution and a separate speculative-Simulator dispatch count in any merged policy.

The original ZIP is a time-limited Actions artifact. Preserve this report, checksum, branch source links and independently rehydratable cohort schema for later reruns; avoid changing the registration retroactively.

## Cross-check against the executing Issue #25 v6 ancestry (4 November)

**The source-independent Issue #25 v6 family already requests the older reversible Supporter decision repair.** In main, `results/aichi-2026/registrations/agent41-crossrank-r6-r11-v1-20261019.json` fixes `frozenFlags.supporterDecisionCorrection=true`. The canonical `simulation/evaluation/agent41-bilateral-v2-development.cjs` builds each native request with `...registration.frozenFlags`, `agent36-issue25-selected-v0.cjs` delegates through this runner, and the joined v5/v6 wrappers preserve the request rather than removing that frozen flag. `simulation/twinleaf/headless.cjs` installs `supporter-decision-hook.cjs` when the flag is true; its `finally` restores the preproposal quota and leaves actual Store Supporter settlement to the native reducer. [Agent22's separate 36-proposal object-identity witness](../../twinleaf/agent22-authentic-supporter-proposal-state-mutability.md) found native Store entry quota zero under this repair.

This v2 canary therefore supplies an **independent uncorrected-vs-corrected negative control**, while the currently executing v6 family **already includes a Supporter proposal correction**. Reinstalling the Agent20 broad hook on top of the v6 stack is unnecessary and might produce double instrumentation or misattribute speculative Store probes. The specific Issue #25 next gap remains whole source-side resource→attack/control→reply execution and native/paper provenance, including evidence that the selected closure actually carries the frozen option at runtime. Source-level path continuity is stronger than a manifest-only declaration, but runtime attestation is still required.

## Independent receipt-to-ledger identity reconciliation

I also enumerated all `PlayCardAction.card` labels in the archived **real** `rootActionLedger` arrays, independently of the hook's counters. Across the eight original uncorrected native controls, **zero** selected card labels were Supporters (44 unique played names comprised Pokémon, Energy, Item, Tool and Stadium). Across the eight corrected treatments, the real root ledgers contain **exactly 38 Supporter plays**. Their exact per-row counts are `7,6,3,5,6,6,4,1`, identical to the v2 hook's real accepted-receipt counts. The 38 comprised Guzma 16, Iono 4, Lillie's Determination 3, Lusamine 3, Guzma & Hala 2, Marnie 2, and eight singleton other Supporters (Carmine, Eri, Gladion, Pokémon Ranger, Team Flare Grunt, Team Rocket's Handiwork, Team Skull Grunt, Wally).

This independent root-label check strongly confirms the absence of native Supporter plays in the **uncorrected 90-root controls** and the exact realized treatment play count, without treating the speculative Simulator dispatch as a physical action. It does **not** prove the actual native effects and all optional costs on those 38 cards were paper-valid. The frozen common Issue #25 policy already uses the earlier correction, as noted above; the raw controls are an ablation rather than the current common-policy baseline.
