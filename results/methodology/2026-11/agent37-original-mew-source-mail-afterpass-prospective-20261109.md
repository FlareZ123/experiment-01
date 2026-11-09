# Mew/Genesect source competence: real owner Trainers' Mail continuation reverses two native results on one matched opening

**Agent37 | 9 November 2026 | Fresh prospective native A/B. Zero paper-competitively qualified games.**

## Experimental question

When the original rank-5 Aichi Mew/Genesect player has a legal Trainers' Mail but its incumbent actor would Pass, does a true source-owned Mail action followed by its genuine owner-only top-four Trainer selection alter *actual original-source 60-card game play*?

The original source is exactly the original 4 Mew V, 3 Mew VMAX, 4 Genesect V, 4 Double Colorless Energy, 3 Trainers' Mail 60-card roster (SHA256 `a66f9b785b7fb36606229f1bf7a396892320803e7576a39f1552a7825bd74c05`). Both original contender printed 60s are unchanged. Unlike an abstract access path, the native bridge uses an actual held Item, an actually accepted Store action, and owner-seated top-four prompt resolution. It is source-only and only acts over an otherwise unsupported incumbent Pass. Other Mew VMAX evolution, DCE recipient, Quick Ball, Ultra Ball and protected payment options are held fixed in both arms.

- [Frozen before native execution registration](../../aichi-2026/registrations/agent37-rank5-mew-source-mail-afterpass-20261109.json), new seeds `1291419999`, `2062742770`, `1929767496`, `936150192`, across original-source physical slots A/B and two fixed contenders `champion-reference` (original rank1 Shadow Rider) and `new-moon-lockbreaker-v1`. Eight physical groups, two policy arms each, 16 actual games. The two contender comparisons sharing one original source seed are correlated.
- [Reproducible native runner](../../../simulation/evaluation/2026-11/agent37-rank5-mew-source-mail-afterpass-native.cjs); existing [owner-native Mail adapter](../../../simulation/twinleaf/agent9-native-owner-mail-after-pass.cjs).
- [Completed genuine pinned native CI #42596968738](https://github.com/FlareZ123/experiment-01/actions/runs/42596968738), SUCCESS. All 16 full native attempt rows [ZIP artifact #13664072792](https://github.com/FlareZ123/experiment-01/actions/runs/42596968738/artifacts/13664072792), SHA256 `97f12d1f46218c18014fae97fb3376dee287c4be09ec57bc51fa3a41f72fd0d5`.
- The **8/8** paired comparisons have identical original-source and full initial physical-deal fingerprints. No batch-level error. **6/8** pairs reached natural native terminal in both arms, **1/8** both action-capped, **1/8** baseline action-capped and treatment aborted with native `UNKNOWN_POWER` at global turn 6. Do not count the abort as a game or as a zero-Mail observation.

## Complete paired results

Source remaining Prize cards and native winner use the **actual physical source seat**. A terminal outcome is still engine-qualified only and requires paper/game-policy confirmation.

| Original rank5 : repeat : source slot : contender | Baseline source attacks / Prizes / result | Source-Mail attacks / Prizes / result | Real settled Mail |
| --- | --- | --- | --- |
| 5:13:A:champion-reference | 4 / 6 / **loss** | 4 / 0 / **win** | Yes, Marnie |
| 5:13:A:new-moon-lockbreaker-v1 | 3 / 6 / **loss** | 4 / 0 / **win** | Yes, Marnie |
| 5:13:B:champion-reference | 6 / 0 / win | 6 / 0 / win | Yes, Forest Seal Stone |
| 5:13:B:new-moon-lockbreaker-v1 | 4 / 0 / win | 4 / 0 / win | Yes, Forest Seal Stone |
| 5:14:A:champion-reference | 4 / 0 / win | 4 / 0 / win | Yes, Muscle Band |
| 5:14:A:new-moon-lockbreaker-v1 | 3 / 0 / win | 3 / 0 / win | None observed |
| 5:14:B:champion-reference | 0 / 6 / censored | 0 / 6 / censored | Yes, Escape Rope |
| 5:14:B:new-moon-lockbreaker-v1 | 4 / 2 / censored | unknown / unknown / `UNKNOWN_POWER` | Unknown on abort |

The treatment has **six confirmed native Mail plays plus six confirmed corresponding top-four owner prompts and physically settled Trainer additions** across its seven non-aborted games. These are actual Store receipts, not inferred Trainer-search connectivity.

## Specific physical root causing two native reversals

The decisive *single original-source physical opening* is repeat13/source-slot A, source physical seat 1, seed `1291419999`. Both contender comparisons start with identical source cards. At global turn **2**, the source first played Quick Ball, put Mew V into play and attached Double Colorless Energy. The incumbent baseline next passed. The treatment instead used **Trainers' Mail ROS** from its actual hand, native prompt selected **Marnie SSH** from the revealed four, and the card was confirmed added to the owner's hand; then the source passed.

The source did **not** subsequently play Marnie as a Supporter. The newly executed Mail action and top-four selection/shuffle change future hidden-deck draws. Accordingly, the evidence proves a legal owner-continuation branch and a dramatic **native** outcome difference. It does **not** prove that the Marnie card itself was the strategic cause, that the outcome is representative of many physical source deals, or that native RNG continuation after deck shuffling gives a high-confidence causal game-win estimate.

Against the fixed champion, the original source baseline next turn played Dedenne-GX, evolved Mew VMAX, and made four genuine Cross Fusion Strike attacks on global turns 6/8/10/12. The treatment developed a fuller Mew/Genesect board, retained attack capability later, and made four genuine Cross Fusion Strike attacks on 6/10/14/18. The final physical Prize count flipped from candidate 0 / source 6 (candidate wins) to candidate 4 / source 0 (source wins). The two runs reached natural native terminals.

Against New Moon, the baseline original source made three settled attacks on 6/8/10 and lost with six source Prizes remaining. The treatment made four settled Cross Fusion Strike attacks on 6/10/14/18 and claimed all six source Prizes. Native winner switched from candidate to original source. This demonstrates a full settled attack and Prize-chain sensitivity to one early original-owner search choice. It does not establish paper-equivalent gameplay.

## Error custody fix after this run

The treatment for 5:14:B:new-moon-lockbreaker-v1 failed at **global turn 6, root action 56, native `UseAbilityAction: UNKNOWN_POWER`**. The source Mail wrapper originally returned its full `ownerMailAfterPassAudit` only on normal completion; the engine error aborted that return. Therefore the runner's default `mailAccepted:0` on the error row means **unobserved**, and the number of accepted Mail actions in that failed game is unknown. Claiming it was a no-exposure error would be unsupported.

A subsequent minimal, default-behavior-preserving adapter repair attaches the owner-public Mail audit to the thrown error and transfers it to `ownerMailAfterPassAbortAudit` in abort rows, while native hooks are restored in `finally`. See [Mail adapter](../../../simulation/twinleaf/agent9-native-owner-mail-after-pass.cjs), [bilateral error archive](../../../simulation/evaluation/agent41-bilateral-v2-development.cjs) and [native smoke regression](../../../tests/agent37-owner-mail-abort-audit.native.test.cjs). This repair was **after** CI #42596968738 and is not represented in that frozen archived run. It does not change the Mail gameplay policy.

## Implication

For the 99.5% single fixed deck challenge, a candidate judged against the rank5 source without real Trainers' Mail setup can be credited with wins that disappear when the opponent makes a legally available extra search action. This supports integrating **owner-only native Mail after Pass as an opt-in source-competence repair** in future larger, independently seeded field comparisons. The response is contingent on held Mail, top-four contents, subsequent draws, and native decision quality. Preserve the current baseline as a named control rather than silently changing it.

The two reversed native terminals derive from one original physical source opening, with different candidate original 60s. They are evidence of a high-impact counterexample to a weak opponent policy, not two independent samples of a real-paper win-rate gain. The current engine is still an incomplete automated player for Japanese Extra. **Zero competitive paper-qualified games. The full original Aichi Top32 still lacks authentic ranks 23,25,28. No single fixed 60 has credibly reached the 99.5% objective.**
