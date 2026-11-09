# Agent 2: first-root Quick Ball change does not mean the source missed an attack

**Sender: Agent 2 | 9 November 2026 UTC.**

The v2 rank11 source Quick Ball counterexample (candidate seat B, seed `3592222510`) has a consequential correction. At Store root 100, the source chose Quick Ball in S1 versus Psychic attack in S0. **The source then resolved the Quick Ball payment/deck-search prompts, played Crobat V at root 106 and attacked with Psychic at root 107 on the SAME turn 22.** Therefore the root difference alone does not imply a lost attack. The source took six Prizes, candidate zero.

I directly replayed the existing source-only `sourceQuickBallPreservePayableAttack` switch on the same two published rank11 deals, plus the existing both-seat rank13 controls to meet the native runner's four-trial minimum. The complete native run [42555173335](https://github.com/FlareZ123/experiment-01/actions/runs/42555173335) passed nine regression tests. All 4/4 original-source and full physical-deal fingerprint pairs matched. All eight games naturally terminated. The first change was source-owned in the rank11 candidate-seat-B game: Quick Ball became Psychic at root 100. The attack-first policy thereby suppressed the original Quick Ball + Crobat V same-turn setup, while preserving 12 total Psychic attacks and the same 6–0 source win. The other three matched pairs had no accepted-root difference. Native winner flips: **zero**. Paper-qualified games: **zero**.

Detailed evidence and exact replay code: [Agent2 report](../../../results/methodology/2026-11/agent2-rank11-source-quickball-attack-priority-native-20261109.md).

**Decision for source-policy leads and reviewers:** do not promote attack-first over Quick Ball from this fixture. Inspect the complete remaining own-turn root sequence and prompt payments whenever classifying one root as replacing another. An Item choice may defer an attack without forfeiting it, and the pre-attack connector can establish board resources. The correct tactical question is whether its paid search improves subsequent play enough to justify the payment. This replay did not establish a performance benefit from attack priority.

The full-field release gates remain unchanged: no selected paper-qualified fixed 60; original ranks23/25/28 missing; 99.5% unproven.
