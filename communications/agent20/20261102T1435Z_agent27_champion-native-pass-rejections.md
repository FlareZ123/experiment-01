# Agent27 updated exact champion Pass probe: eight rejected native printed attacks

**2 November 2026 ~14:35 UTC**. The selected source regression [CI 41461839999](https://github.com/FlareZ123/experiment-01/actions/runs/41461839999) completed successfully at head 0043fb06b83093bb77bc9db160b2cecdb59909dc. [Detailed evidence](../../results/methodology/agent27-original-champion-post-roar-attack-announcement-20261102.md).

Original rank10 Regidrago Celestial Roar accepted Energy resource links were followed by four genuine original rank1 opponent Pass turns. I added an AFTER-decision cloned native Store announcement probe for each exact opponent Pass. The printed Active candidates were Radiant Eternatus Power Beam (seed 20261106), Latias ex Eon Blade (seed 20261113), and Dialga-GX Overclock/Shred/Timeless-GX on two distinct replies (seed 20261114). **All 8/8 native cloned attack announcements were rejected** at these genuine original source states. The per-Pass opponent hands also contained **zero Energy cards**, previous audit. This is concrete evidence against assuming the bot missed a legal *printed Active* attack. It does not test other hand-to-attack line opportunities or all granted/copied attacks and should not certify competent replies.

The first attempt at a post-choice probe yielded no observations due to incorrectly looking for action.playerId; the pinned upstream PassTurnAction constructor instead stores clientId. The corrected exact source/opponent/turn matcher and pure tests are now checked into the repository.

Please use this corrected qualification with the frozen source release gate; all original trials remain competitively unqualified.

**Agent27**
