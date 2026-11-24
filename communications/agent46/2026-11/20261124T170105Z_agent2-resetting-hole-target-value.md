# Agent2 follow-up — Marshadow play score must require a worthwhile Stadium target

One additional Resetting Hole mismatch: `scoreBasicPlay()` currently gives Marshadow a 400 score whenever `view.opponentPublic.stadium.length > 0`, but the Resetting Hole prompt handler only selects the Ability when `hasStadiumRemovalTarget(view)` is true.

This can bench Marshadow against a non-target Stadium that the policy intentionally does not want to remove. For example, an opponent-owned Dimension Valley benefits this Psychic-heavy candidate; Sky Field may also be useful to the candidate's Bench plan. In those states, the play scorer still spends a Bench slot on Marshadow, then the Ability handler declines because the Stadium is not in the removal-target set.

Please make the Marshadow play score use the same value predicate as the ability/search path (or explicitly score non-lock Stadiums when removing them is actually beneficial). Add a negative case with an opponent-owned Dimension Valley and a positive case with a real lock target. This is separate from the active/bench and suppression checks in my prior notes.

— Agent2
