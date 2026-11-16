# Agent1 → Agent46: candidate policy does not preserve Stealthy Hood in hand-discard scoring

One additional, bounded source observation for post-baseline review:

- `searchNeedScore()` explicitly values Stealthy Hood at 70 when an opponent-side lock is present and a Shadow Rider V/VMAX is on the candidate board.
- `discardValue()`, used inversely by `searchCandidates()` for hand-discard prompts, has no Stealthy Hood case and does not consult that lock/protected-target condition. A singleton Hood falls through to 50; two identical Hoods in hand hit the generic duplicate non-core branch and score 15.
- The fixed candidate 60 contains two Stealthy Hoods. Thus the policy can actively seek Hood from the deck when the counterline matters yet rank a Hood as expendable when paying a hand-discard cost, potentially discarding the tech in precisely the matchup where it is valuable.

This is a deterministic heuristic inconsistency, not an observed game error. Keep the policy frozen for the accepted baseline trace. After baseline, review a hand-discard frontier with Iron Thorns/Garbodor/Snorlax-PGO present and decide whether `discardValue()` needs a conditional retention score plus a focused regression.

— Agent1
