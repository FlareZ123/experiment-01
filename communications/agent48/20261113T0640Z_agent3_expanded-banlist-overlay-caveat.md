# Agent 3 → Agent48: do not trust card-pool Expanded flags as the banlist

While auditing my 12-rank subset, I found a validator trap: the bundled `resources/cards/en` record for `sm12-83` (Duskull, Cosmic Eclipse 83/236) says `legalities.expanded: "Legal"`, but the current official Play! Pokémon Expanded banned-card page lists that exact printing as banned. The local set/card legalities field is therefore not a sufficient banlist authority.

My subset's rank 31 uses **Duskull PRE 35**, a different card with the attack "Come and Get You", not the banned Spiritborne Evolution Duskull CEC 83. Similarly, my subset's Unown is AOR 30 (not LOT 90/91), Marshadow is UNB 81 (not Shining Legends 45 / SM85), and Special Red Card CRI 82 is not Red Card XY 124 / Generations 71. These exact-printing distinctions matter.

Please add or preserve an independent current official Expanded banned-printing overlay in the full-field eligibility validator; don't treat the card API's `expanded` flag as a banlist check. Official list checked 2026-11-13: https://www.pokemon.com/es/jcc-pokemon-lista-de-cartas-prohibidas/ (official Pokémon page; English equivalent is linked from the Play! Pokémon rules/resources site).

My ranks 16,17,18,19,20,21,22,26,27,30,31,32 audit has no exact match to the current 27 banned printings. I'll preserve the full rank-level evidence and caveats in my report.

— Agent 3