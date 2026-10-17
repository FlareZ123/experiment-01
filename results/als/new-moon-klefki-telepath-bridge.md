# Klefki–Telepath first-turn bridge

Agent 3, 17 October 2026. Source: [the 52nd-place author's strategy](https://ottopoke.hatenablog.com/entry/2026/05/13/183822). Verified counts: Klefki 1, Telepath Psychic Energy 3, Mewtwo & Mew-GX 2, Duskull 2, total 60.

The official [Klefki](https://asia.pokemon-card.com/my/card-search/detail/5666/) text suppresses Basic Pokémon Abilities while Klefki is Active, including Latias ex's Skyliner. But the official [Telepath Psychic Energy](https://www.pokemon-card.com/card-search/details.php/card/49712/regu/all) is an Energy-card effect: attaching it from hand to Psychic Klefki can Bench up to two Basic Psychic Pokémon. On the next turn, discard this Energy to pay Klefki's one-Energy retreat, then promote the searched Mewtwo & Mew-GX. This is a resource-dependent alternative to Latias; subsequent Powerglass/Horror House/Night Watch sequencing remains unproven in a full game.

An exact BigInt [opening/Prize enumerator](../../scripts/new-moon-klefki-telepath-bridge.cjs) gives 3.25966143% unconditioned for Klefki+Telepath in the opening seven and 3.20080622% also having a Mewtwo and a Duskull in hand or outside the six Prizes. Conditional on Klefki+Telepath, joint target availability is 98.19443815%. A valid seven-card Basic hand has probability 91.65625670%; the opportunity conditional on validity is 3.49218519%. This excludes all search, draw, opponent intervention, Powerglass Basic-Energy discard, and actual play policy. It is neither a win probability nor a qualification for competitive inference.

[Powerglass](https://asia.pokemon-card.com/ph/card-search/detail/13819/) accelerates Basic Energy only to its Active holder at turn end, even without attacking (Advanced Rulebook E-21). Powerglass attached to Klefki cannot simultaneously accelerate Mewtwo after Klefki retreats. A third manual Energy and accessible attack donors are needed for the later Night Watch route. Horror House forbids plays from hand; the opponent can still attack with a previously powered Active Pokémon.

Next: reproduce in a real pinned-Twinleaf Store action trace in both seats with legal retreat, source Hand/Prize fidelity, fixed donor and Basic-discard access, and noninterfering decision policy. **Zero qualified matches, 99.5% unproven.**

## Active-selection caveat

This 3.25966% opening event allows the player to **choose Klefki as Active** when other Basics also appear. Exact uniformly sampled initial seven with Klefki, Telepath and **no other Basic** is only **0.58467984%** of unconditioned draws, calculated as `(C(43,6)-C(40,6))/C(60,7)` from the source's 17 Basic Pokemon and three Telepath cards. Thus 17.93683% of Klefki+Telepath openings force Klefki as the only Basic; the remaining cases permit a meaningful Active-versus-Bench decision. The post-mulligan card mix can additionally change due to opponent mulligan bonus draws. This is an Active-selection distinction, neither execution frequency nor win probability.
