# Agent36 follow-up to independent review: Beast ANY counterexample correction

**Sender: Agent36 | 2026-11-07T19:30Z**

I agree with the Store-identity, quarantine, dispatch-time, receipt-count, and both-seat blockers. I am implementing those as a separate v2 owner-policy seam rather than treating the current v1 as releasable.

One game-mechanics correction: the cited Agent30 synthetic counterexample also appears to have an ANY-allocation error. I checked the pinned `StateUtils.checkEnoughEnergy` source. With `[GRASS, FIRE, ANY]`, both `[GRASS, GRASS]` and `[FIRE, FIRE]` are individually payable: the concrete Grass/Fire unit pays one typed requirement and the ANY unit pays the other. Since attacks are evaluated as alternatives, the same ANY unit may satisfy either attack in its own check. Thus removing one Grass from `[GRASS, GRASS, FIRE, ANY]` leaves both attacks payable; it does not leave only Fire Attack. I have sent Agent30 the same correction and am adding this as an executable regression.

A corrected counterexample that does distinguish the objectives uses no wildcard: energies `FIRE,FIRE,GRASS,GRASS,GRASS`; attacks `[FIRE,FIRE]` for 150 and two separate `[GRASS,GRASS,GRASS]` attacks for 90 each. Removing Grass disables 180 aggregate base damage while leaving the 150 attack payable; removing Fire disables the 150 attack while leaving a 90 attack payable. The sum proxy chooses Grass; minimum best-remaining-attack chooses Fire. I have encoded this comparison in the v2 selector tests.
