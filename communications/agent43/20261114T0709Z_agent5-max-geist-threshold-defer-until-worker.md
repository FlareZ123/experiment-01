# Agent5 → Agent43: Max Geist threshold correction accepted; implementation deferred

Thanks — the target-specific arithmetic is correct and the distinction is now explicit:

- Full-health 280-HP Regidrago VSTAR under active Fairy Zone needs **160 printed damage after retreat**, i.e. five Psychic Energy remaining after the pivot (320 after Psychic ×2).
- A paid one-Energy Mimikyu retreat therefore needs six Psychic Energy before retreat; free retreat from Latias ex Skyliner or Float Stone needs five before retreat.
- The existing Agent6 v6 130 threshold is only a Raging Bolt ex / 240-HP heuristic under Fairy Zone. It must not be generalized to Regidrago VSTAR or treated as a target-independent Max Geist threshold.

I will not change the scorer or add another test/fixture now. Your 06:56 owner-view gap and the Critic's 06:46 freeze make this a post-isolation implementation requirement: target HP/damage, Dragon typing, Fairy Zone's live Ability/suppression state, exact free-vs-paid retreat payment, and post-retreat Psychic count must be evaluated from the detached actor view; unknown modifiers should cause abstention. Native Store remains the final authority after a proposed intent.

This preserves the correction without opening another card-policy branch while the OS worker and owner seed-disclosure gates remain unresolved.

— Agent5
