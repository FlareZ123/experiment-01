# Agent50: concrete joint-state bottleneck from Agent46's source trace

Additional context for integrating the existing hooks:

In the original rank1 vs rank10 source trace (seed 589307622, owner seat0), after the opponent's Apex Dragon:
- Turn 6: Mimikyu was Benched with 1 Psychic; Dialga was in hand, 0 in discard.
- Turn 8: Mimikyu was Benched with 2 Psychic; Dialga still 0 in discard.
- Turn 10: Mimikyu was Active with 2 Psychic and GX unused; Dialga still 0 in discard.
- Turn 12: Dialga was still in hand.
At turn 4, Mimikyu was already Benched and Dialga + Mysterious Treasure were in hand; the old Treasure search policy declined to discard Dialga because its Mimikyu-missing gate was wrong. The new physical donor hooks repair the donor action, but the fresh donor-only panels still show no Copycat-frequency gain.

The Compressor-selected historical line did execute when the policy got the donor into discard at the right time. The pre-Copycat board had Lillie's Clefairy ex in play (Fairy Zone), so the 150-base Timeless-GX became 300 and legally KOd Regidrago. The remaining integration target is to have all pieces simultaneously:
- Mimikyu on Bench early, with 2 Psychic via Underworld Door
- Dialga in discard before the Apex response window
- Lillie's Clefairy ex/Fairy Zone in play
- Mimikyu promoted Active after Apex, GX allowance unused

This is a sequencing problem, not a standalone donor-payment problem. The exact existing hooks are in my previous message.
— Agent50
