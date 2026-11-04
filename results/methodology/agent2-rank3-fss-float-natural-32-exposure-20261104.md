# Agent 2: Original rank-3 Forest Seal Stone/Float Stone exposure across 32 prospective native deals

**4 November 2026. Developmental source-owner observation. Zero competitively qualified games, no selected fixed 60, and no field win-rate claim.**

## Registered experiment and reproducibility

The existing [rank-3 original-source passive observer](../../simulation/evaluation/agent2-rank3-original-fss-float-census.cjs) was reused without an action-changing hook by the separately [registered 32-attempt runner](../../simulation/evaluation/agent2-rank3-original-fss-float-fresh.cjs). After the independent eight-deal pilot found zero ordered Tool pairs, this runner preregistered seeds `290130..290145`, both physical candidate seats, original rank-3 Snorlax Stall versus original rank-1 Shadow Rider Calyrex, and 260 native root-action caps. Original converted rank-3 source SHA-256: `72c61d594eee5ee1d593b738af627c3ab8f3a38d1a5f29695ff39c8c09c2264f`; rank-1 comparison SHA-256: `de8b454ce520b9f6b8db9395c5bea4e8c09cd3958b8e78159f704ba5aec71311`. Pinned vendor Twinleaf revision: `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.

[Manual GitHub Actions run 41915810007](https://github.com/FlareZ123/experiment-01/actions/runs/41915810007) concluded SUCCESS on source head `e4e594271c71855c55e0817aa6a7ee6422290121`. Its independently retrievable [artifact 13364048992](https://github.com/FlareZ123/experiment-01/actions/runs/41915810007/artifacts/13364048992) contains `agent2-rank3-original-fresh-32.json` (119,051 bytes; uncompressed JSON SHA-256 `97551c36fccb8f226448d883f82da4e6fa5c9824ff756fa765d69f27d34e10ff`), the eight-case pilot JSON, and regression stdout. Downloaded artifact ZIP SHA-256 `6ecdb974ced278a1c8106a9a9b1c4e16415e26f1319bf645be60d578fc3291e0`. The earlier [run 41915291705](https://github.com/FlareZ123/experiment-01/actions/runs/41915291705) failed before any 32-deal execution due to an incorrect `originals` import, subsequently corrected. Do not count that aborted run as experimental cases. The corrected runner has no native errors.

## Exact observed outcomes

| Scope | Native outcome |
| --- | ---: |
| Full original-source attempts | 32, 16 with rank-3 at each physical seat |
| Native engine terminals | 11 |
| Action-capped | 21 |
| Rank-3 owner decision-root observations | 979 |
| Ordered first-Tool FSS and held Float root observations | 64, confined to **4 of 32 games** |
| First-Tool FSS held for no free V recipient, while Float still held | 35 roots, confined to **2 of 32 games** |
| Observer's printed Float mobility gate passed | 35 roots, same **2 of 32 games** |
| Benched Bunnelby specifically carrying Capture Energy behind a qualifying Float gate | 0 |
| Opponent deck at most 2 behind that precise Benched-Bunnelby gate | 0 |
| Competitively qualified games | **0** |

All 64 ordered-pair observations occurred in rank-3 **physical seat 0**. They came from four distinct registered games, source-seat-0 seeds `290134` (2 roots), `290137` (36), `290144` (11), and `290145` (15). The 35 first-Tool **hold** roots came only from seeds `290134` (2) and `290137` (33). The 32 source games carry different physical initial-deal hashes, so equal seed across opposite candidate seats does **not** establish a matched physical-deal comparison. The strong seat asymmetry is observed, not an identified causal seat effect.

**Why 979 and 64 are not independent opportunity counts:** a stalled hand can recur through many successive root actions and turns. In seed `290137`, one game produced 33 separate Stone-hold observations. Its earliest such observation was turn 4, rank-3 Active Galarian Stunfisk SSH, one Capture Energy, Bench Snorlax PGO plus Articuno-GX CES, no active Tool, held Forest Seal Stone then Float Stone, and an intended `PASS_TURN`; the opposing deck had 44 public cards. This is a plausible *Tool mobility option omitted by the first-Tool owner policy*, but no successful alternate Float movement or terminal causal payoff was run in this original match.

In seed `290134`, rank-3 had Bunnelby PRC **already Active**, attached Water Energy MEE, and intended `ATTACK_ACTION` named `Burrow` at turns 22 and 24, with public opponent deck counts 5 and 1 respectively. The row ended as an engine terminal with winner source seat 0, but the observer only records intended actions and public snapshots; it does **not** independently certify the printed attack's Store payment, discard, adjudicated win reason, or competent opponent reply. These roots are classified as an omitted *possible Float Tool*, while **the Bunnelby was already Active** and its attached Water Energy covers Burrow's one Colorless Energy cost. Float was not demonstrated necessary for this attack. Printed Bunnelby PRC 121 also has Ω Barrage, allowing a possible second attack. The narrowly defined `fundedDoubleBurrowCandidateRoots` counter requires a **Benched** Bunnelby carrying **Capture Energy RCL** specifically. Its zero therefore cannot be generalized to all paid Burrow opportunities or all Basic Energy types. It is a correctly narrow counter, not an exhaustive attack-availability census.

In seeds `290144` and `290145`, ordered FSS/Float pairs occurred while the Stone owner gate did **not** hold, because a suitable Pokémon V recipient was in play. These 26 roots should not be counted as the missing-second-Tool suppression phenomenon.

## Interpretation and next verification gate

The prior [constructed both-seat actual Store double-Burrow terminal](agent2-rank3-fss-float-bunnelby-native-20261104.md) is a genuine narrow mobility/control mechanism witness. This new original full-60 dataset **does** find first-Tool Stone suppression with an owned Float option in two games. It does **not** establish that the alternate Tool is best, affordable under every paper restriction, strategically timely, or causes a match win. No actual A/B treatment was applied in these 32 games. The source-owner **intent** to Burrow in seed `290134` is an unusually promising natural, traceable continuation for a **single-disclosed-deal native attack/Prize/opponent-reply audit**, but its exact effect must be independently settled before claiming a new source-play witness.

Proposed narrowly controlled validation: rerun the same complete original physical pair for **seed `290134`, rank-3 physical seat 0**, with the unchanged canonical policy and `capturePublicAttackTransitions`, `captureNativeAbortEvidence` and physical initial-deal fingerprint checks; inspect both Burrow declarations/settlements and native winner reason. Contrast it with seed `290137` only as a separate *mobility opportunity*, not a victory demonstration. Preserve failure/cap states, both players' real replies, and the absence of paper-clock adjudication. Integrate a change only through the actually selected Issue #25 symmetric policy and its owner-information guards, never as a standalone globally optimized card choice.

The historical benchmark remains **29/32 original 60-card inventories**, ranks **23, 25, 28** missing, no chosen final deck, and zero competitive-paper-qualified games.
