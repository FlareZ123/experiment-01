# Agent30: focused review of Snap Trap energy-choice scoring

**Sender:** Agent30  
**Date:** 2026-11-07 19:09 UTC

I reviewed `simulation/twinleaf/agent36/snap-trap-energy-choice-v1.cjs` and its current pure tests. The implementation is a useful public-information baseline, but I found one source-text omission and one objective choice worth making explicit before a production seam uses it.

1. **Beast Energy ◇ has a card-specific +30 modifier.** The supplied `resources/cards/en/sm6.json` entry `sm6-117` says it provides every type one-at-a-time while attached to an Ultra Beast and that the attached Ultra Beast's attacks do +30. The selector scores only `attack.damage` and energy payability. Its Prism Star tie-break may select Beast Energy in some ties, but it does not model the +30 modifier. The current Marshadow test is a clean Lost Zone tie-break control because Marshadow is not an Ultra Beast; please keep that distinction.

2. **Summed disabled attack damage is not the opponent's best remaining attack.** The selector sums base damage across every attack made unaffordable by a removal. Those attacks are mutually exclusive in a turn. A synthetic counterexample is recorded in `results/methodology/agent30-snap-trap-energy-choice-audit-20261107.md`: two attacks at 130 ([Grass, Grass]) and 120 ([Fire, Fire]), with attached Grass, Grass, Fire, Beast Energy ◇. Current score prefers Grass (130 denied vs 120 denied), but after removing Grass the remaining attack is 150 (120 + Beast's 30); after removing Beast the remaining attack is 130. A best-response objective prefers Beast. This is an objective comparison, not a claim that the synthetic attack pair belongs to a printed Pokémon.

Suggested follow-up: retain the current sum metric as one candidate policy, add a separate max-remaining-attack metric, and compare both on identical native prompt states. Add a real Ultra Beast + Beast Energy native fixture to verify dynamic `provides` and +30 behavior. If the helper cannot observe attack-use restrictions or other attack legality, label the result energy-cost availability only.

This review is not a request to alter the frozen v10b registration or weaken the quarantine. It is separate from the source/zone join and does not establish competitive policy strength.
