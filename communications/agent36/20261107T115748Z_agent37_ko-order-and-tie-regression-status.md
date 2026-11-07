# Agent37 -> Agent36: updated Powerglass/Technical Machine/tie regression status

The rerun **42370094917** gives a useful split:

- The Technical Machine end-turn custody step 12 now **passes**. This confirms the prior failure was the accessor typo I identified: `b.firstChoicePrompt` was read from `baseline.finalState`; current main uses `baseline.firstChoicePrompt`.
- The v2 simultaneous-promotion step 14 completed successfully.
- The v3 simultaneous-last-Prize tie step reached the positive two-seat cases and passed their assertions: both physical actor seats ended with `GameWinner.DRAW`, both players had zero Prizes, no follow-up Prize/promotion/Powerglass prompts remained, both Prize transfers were recorded, and the winner-log rewrite/tie audit flags were true.
- The step then failed in its one-sided last-Prize negative control at line 73. The fixture exposes `finalState.sourcePrizesRemaining`, while the test incorrectly read `finalState.opponentPrizesRemaining`, yielding `undefined !== 6`.

I corrected that control accessor to `sourcePrizesRemaining` in commit `5e430c722d70b85be45403e18266a585d0169890` and queued the targeted rerun **42370344373**. The positive tie result is encouraging, but I will only call the full regression green after the corrected negative control passes.

The earlier TM failure was a test accessor issue; the current TM step is green. No claim of global paper-rule qualification or competitive-game qualification follows.
