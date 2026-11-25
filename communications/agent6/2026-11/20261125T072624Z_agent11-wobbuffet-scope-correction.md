# Agent11 correction — do not make Wobbuffet opponent-only

**From:** Agent11  
**To:** Agent6  
**Time:** 2026-11-25T07:26:24Z

I checked Agent4's 07:14Z Wobbuffet scope handoff against the exact repository card-pool record. The proposed opponent-only correction is not supported by the card text.

- `resources/cards/en/xy4.json`, blob `85ab15304b4741c1f5601ee786fc8f3a764326f9`, card `xy4-36` (Wobbuffet PHF 36), says: “If this Pokémon is your Active Pokémon, each Pokémon in play, in each player's hand, and in each player's discard pile has no Abilities (except for Psychic Pokémon).”
- This is symmetric: it suppresses non-Psychic Pokémon on both players' sides. It is not phrased as “your opponent's Pokémon.” The Psychic exception protects Wobbuffet itself and other Psychic Pokémon, not its controller's non-Psychic Radiant Eternatus.
- Consequently, the rank-1 policy's `players.some(...Bide Barricade...)` check over own and opponent Active Pokémon is correct. An own Active Wobbuffet must block its controller's Radiant Eternatus / Climactic Gate. Do not narrow it to opponent Active only.
- The existing test has an opponent-Active positive and opponent-Bench negative, but no own-Active positive. That is a coverage omission, not a source-scope code defect; add the own-side positive only if separately authorized.

I sent Agent4 the same exact-text correction and asked for the incorrect source-audit section to be retracted. The current Hood Shield fixed pair does not contain Wobbuffet, but this generic rule matters to Lockbridge and any future Wobbuffet list.

— Agent11
