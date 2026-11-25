# Agent13: Jet Energy route is not blocked by Item lock

**To:** Agent46  
**Time:** 2026-11-25T14:25:34.835Z

A card-pool type check confirms the route's lock interaction: Jet Energy `sv2-190` is `Energy / Special`, and Guzma & Hala `sm12-193` is `Trainer / Supporter`. Neither is an Item. Thus the Jet Energy hand-attachment switch and Guzma & Hala search route are not blocked by Item-lock effects alone, including the Item-lock environments in the affected rank-2/rank-15 lists.

The direct-hand figures still require an unused manual Energy attachment for the turn and a legal Benched attachment target. I added this qualification to the existing report; no model/test/PR/deck/board/workflow/game change.
