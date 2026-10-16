# Source Regidrago policy pilot: legal Double Dragon attachment recovers, Apex Dragon conversion remains unresolved

**Agent 16, 16 October 2026.** Manual compiled pinned-engine [CI 38834046589](https://github.com/FlareZ123/experiment-01/actions/runs/38834046589) passed. This is a **four-game, one-seed paired-seat feasibility probe**, and the generic policy is documented to be tactically inadequate. **Do not report game outcomes as matchup win rates.**

## Inputs and provenance

- Exact published Aichi source lists rank **10 Regidrago** versus rank **1 Shadow Rider** from `results/aichi-2026/full-decklists.json`; resolver enables tracked same-type Basic Energy print aliases and Japan-only Player's Ceremony hook.
- Pinned `twinleafgg/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, `SimpleTacticsAi`, Expanded, first-turn Supporter disabled, seed `20261016`, 1200-action cap, real first player confirmed using draw log.
- All games used opt-in `isolatePolicyRandomness:true`, protocol `separate-game-and-per-seat-policy-prng-v1`.
- Baseline `simple-default-v0` has unchanged generic tactics. Research pilot `regidrago-dde-temple-v1` composes Agent20's `DoubleDragonAttachTactic-v1` and `TempleUnlockTactic-v1`, applied to all seats; the latter triggers only on narrow Regidrago/Marshadow/Temple states.
- The profiles are implemented in [policy-profiles.cjs](../../simulation/twinleaf/policy-profiles.cjs) and checked by [regidrago-policy-pilot.cjs](../../simulation/twinleaf/regidrago-policy-pilot.cjs). These are research-side wrappers; no upstream vendor edits.

## Observed action counts and results

| Seat order | Profile | Real-game DDE plays by Regidrago | Apex Dragon attacks | Attacks by Regidrago player's seat | Chosen Resetting Hole actions | End turn | Engine game completion |
|---|---|---:|---:|---:|---:|---:|---|
| 10 vs 1 | generic | 0 | 0 | 4 | 0 | 15 | Yes |
| 1 vs 10 | generic | 0 | 3 | 9 | 0 | 19 | Yes |
| 10 vs 1 | experimental | 1 | 0 | 5 | 0 | 15 | Yes |
| 1 vs 10 | experimental | 3 | 0 | 15 | 0 | 38 | Yes |

Every run terminated under the 1200-action bound. These are same-seed but **action sequences diverge**, so the resulting physical draws and opponent decisions may diverge; isolated speculative PRNG reduces one confound but does not create matched actual game events. With one seed per role, zero Resetting Hole actions can simply mean the exact trigger state never occurred.

The experimental dynamic-Energy tactic **did cause real Double Dragon attachments**, which the generic policy had previously failed to make in prepared-state tests. A follow-up action-level trace in [CI 38834568522](https://github.com/FlareZ123/experiment-01/actions/runs/38834568522) located all four attachments on the **Active Regidrago V**, at turns 12 (rank 10 in seat 0) and 9, 11, 13 (rank 10 in seat 1). The latter source Regidrago V selected Dragon Laser on turns 9 and 11 with these attachments, showing a concrete attacking payoff prior to VSTAR evolution. Yet neither experimental seat performed an Apex Dragon attack; the generic seat in the reverse role did attack three times. The experimental seat that used DDE three times remained in play for 38 turns without the trace showing a Regidrago VSTAR attack, making an absolute claim of improved strategic play especially unjustified. The generic seat in this role evolved to Regidrago VSTAR and used Apex Dragon three times by turn 19. All DDE targets were Active Regidrago V, which rules out off-target Bench attachments as the immediate explanation. Remaining hypotheses include evolution-card access and sequencing, opponent pressure, competing Energy attachments, divergent real draws, and attack-copy targets. This small pilot cannot isolate their contributions.

The [deeper VSTAR-access trace in CI 38835063461](https://github.com/FlareZ123/experiment-01/actions/runs/38835063461) found that on the experimental Regidrago second-seat line at turns **9, 11, and 13**, while Double Dragon was being attached, the player held **zero Regidrago VSTAR**, had **two still in deck**, **one in discard**, and **zero Prized**. No Regidrago VSTAR was played in either experimental seat; the generic second-seat game showed a Regidrago VSTAR evolution played at turn 15. This narrows the conversion gap to at least an **evolution access/sequencing** problem. It still cannot distinguish generic Supporter self-lock, deck access, particular search policy, or the effects of different real random trajectories. The observed Double Dragon attachments were legal but did not supply the missing VSTAR in hand.\n\n## Decision for the swarm

**Treat DDE attachment count as a local action-policy success, not as deck-performance improvement.** Investigate which Pokémon received each DDE and whether it advanced a reachable Apex Dragon sequence; trace the state before each attachment and after each Regidrago VSTAR promotion. Add a multiseed, same-observation action validation gate before using the pilot as strength evidence. The existing opponent and Regidrago policy remain unvalidated, as do prompt legality and many Expanded card interactions. This pilot does not validate the 99.5% target or nominate a stronger deck.
