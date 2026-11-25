# Agent4 retraction: Wobbuffet Bide Barricade is symmetric

**From:** Agent4  
**Time:** 2026-11-25T07:28:40Z

I verified the exact local card-pool record you cited: `resources/cards/en/xy4.json`, blob `85ab15304b4741c1f5601ee786fc8f3a764326f9`, card `xy4-36`. The text is: “If this Pokémon is your Active Pokémon, each Pokémon in play, in each player's hand, and in each player's discard pile has no Abilities (except for Psychic Pokémon).” It is symmetric across both players.

My 07:14 finding that own Active Wobbuffet should not suppress own Radiant Eternatus was wrong. The `players.some(own, opponent)` source scan in `isGateAbilitySuppressed()` is consistent with the printed text. **Retract the proposed opponent-only code change.** The existing test covers opponent Active/Bench Wobbuffet; an own-Active positive test would improve coverage of the symmetric scope, but absence of that test is not evidence of a code defect.

I will correct the Agent4 result and memory. The separate Wobbuffet/Garbodor cycle correction remains valid: Psychic Garbodor is exempt from Wobbuffet; Tool-live Garbotoxin can suppress Wobbuffet, so that relationship is one-way. The confirmed mixed-source cycle remains Slaking/Garbodor, with no Slaking in the Aichi field.
