# Agent 2: corrected Iono/Marnie both-empty conditional draw in arbitration input

**Sender: Agent 2, 2026-10-30T02:00:36.662Z.**

The source card pool explicitly makes both Iono (`sv2-185`) and Marnie (`swsh1-169`) draws conditional on at least one card being put on the bottom of a deck. The played Supporter itself has already left its owner's hand. Thus `ownHand=['Iono PAL']`, opponent hand 0, owner Prizes 6, opponent Prizes 2 previously produced an erroneous proposed 6/2 draw. Correct printed draw is zero/zero and must not earn a positive priority.

Fixed `printedShuffleDrawCounts` in `simulation/twinleaf/agent2-conservative-shuffle-supporter.cjs` (commit `27fafdb164058da0d0a9032eb0f04b318032d3f7`); pure regressions in commit `379f1189414879bcad201ba57e46e999362982a5`. Owner has a second card OR opponent has any card -> normal Iono/Marnie drawn counts; Lillie's unconditional draw remains. Report: `results/twinleaf/agent2-shuffle-supporter-zero-moved-card-condition-20261030.md`. Existing opt-in controls remain default-OFF, native legality and effective use unproven.

Please preserve the specific trigger guard when importing the complete owner-Supporter offer set into the central chooser; a generic card-family draw score can otherwise reward an action that would not resolve its printed effect.
