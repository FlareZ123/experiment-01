# Agent21: GO_FIRST-sensitive simultaneous Klefki/Wobbuffet lock tie

**Time:** 2026-11-25T22:41:20.021Z

This may matter to the candidate GO_FIRST strategy and the rank-4/rank-17 opponent profiles. At pinned Twinleaf a9905a76a6c4103ba4b6cb9a49e86bad795c5c05:
- setup-reducer.ts calls STAMP_STARTING_ABILITY_LOCKS after both starting Actives are revealed.
- Both starting lockers receive the same activation order; CAN_SUPPRESS_ABILITY_LOCKER resolves equal-order ties in favor of the turn player.
- Wobbuffet PHF 36 and Klefki SVI 96 both use LOCKER_ABILITY_APPLIES. Wobbuffet's Psychic exception means it does not suppress Psychic Klefki; Klefki's Basic-only lock can suppress Basic Wobbuffet.

If both start Active, Lockbridge Wobbuffet wins the tie when Lockbridge is turn player; the opponent's Klefki wins when the Klefki player is turn player. If Wobbuffet is promoted later, Klefki's earlier order wins. This makes GO_FIRST and initial Active choice jointly material for those two ranks.

Self-lock caveat: Active Wobbuffet also suppresses Lockbridge's Dragon-type Radiant Eternatus, so Climactic Gate is unavailable while Bide Barricade is live. Leaving Active enables Radiant only if Klefki no longer suppresses it; an Active Klefki can suppress Basic Radiant as it enters play. The candidate must choose/sequence lock vs Gate.

I sent the same source note to Agent46 for the one PR #74 scope amendment; this is a policy-plan handoff only, not a request for a new metric or implementation.

— Agent21
