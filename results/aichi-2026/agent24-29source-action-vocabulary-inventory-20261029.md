# Agent 24: all 29 Aichi published 60s, action-vocabulary exposure

Exact-source inventory from `results/aichi-2026/full-decklists.json`, 29 October 2026. Ranks **23, 25, 28** remain unrecovered. Symbols **Y** = source 60 contains an exact-named card; **·** = absent. Columns G Guzma; VS VS Seeker; BC Battle Compressor; LD Lillie's Determination; VIP Battle VIP Pass; QB Quick Ball; S at least one Special Energy. These are **inventory exposures**, never assertions of legal, beneficial or observed play.

| Rank | Printed archetype | G | VS | BC | LD | VIP | QB | S |
|---|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| 1 | Shadow Rider Calyrex | Y | Y | Y | Y | · | Y | · |
| 2 | Vileplume Control | Y | · | · | · | · | · | Y |
| 3 | Snorlax Stall | Y | Y | · | Y | · | Y | Y |
| 4 | Raichu Electrode Combo | · | · | Y | Y | Y | Y | Y |
| 5 | Mew Genesect | Y | Y | · | · | Y | Y | Y |
| 6 | Iron Thorns | Y | Y | · | Y | · | · | Y |
| 7 | Snorlax Stall | Y | Y | · | Y | · | · | Y |
| 8 | Absol Garbodor | Y | Y | Y | Y | Y | Y | · |
| 9 | Absol Electrode | Y | Y | Y | · | Y | · | Y |
| 10 | Regidrago | Y | Y | Y | Y | Y | Y | Y |
| 11 | Absol Garbodor | Y | Y | · | · | Y | Y | · |
| 12 | Regidrago | Y | Y | · | · | · | Y | Y |
| 13 | Regidrago | Y | Y | Y | Y | Y | Y | Y |
| 14 | Regidrago | Y | Y | Y | Y | · | Y | Y |
| 15 | Lopunny Vileplume | Y | · | · | · | · | · | Y |
| 16 | Absol Garbodor | Y | Y | Y | Y | Y | Y | · |
| 17 | Raichu Electrode Combo | · | · | Y | · | Y | · | Y |
| 18 | Regidrago | Y | Y | · | · | Y | Y | Y |
| 19 | Raging Bolt | Y | Y | Y | · | Y | Y | Y |
| 20 | Regidrago | Y | Y | Y | Y | · | Y | Y |
| 21 | Regidrago | Y | Y | Y | Y | · | Y | Y |
| 22 | Absol Garbodor | Y | Y | Y | Y | Y | Y | · |
| 24 | Iron Thorns | Y | Y | · | Y | · | · | Y |
| 26 | Meloetta Donk | · | · | Y | · | Y | Y | Y |
| 27 | Regidrago | Y | Y | Y | · | · | Y | Y |
| 29 | Iron Thorns | Y | Y | · | Y | · | · | Y |
| 30 | Lillie's Clefairy | Y | Y | Y | · | Y | Y | Y |
| 31 | Dusknoir Chimecho | · | · | · | · | Y | Y | Y |
| 32 | Regidrago | Y | Y | Y | Y | · | Y | Y |

Across the 29 exact published source lists: G: **25/29**; VS: **23/29**; BC: **17/29**; LD: **16/29**; VIP: **15/29**; QB: **21/29**; S: **24/29**. All 29 include at least one of G, VS, BC, LD or VIP.

**Frozen common policy gap:** `chooseActorRootIntent` has no general draw Supporter route, VS Seeker, Battle VIP Pass or broad Battle Compressor option. Limited Quick Ball, Special Energy, Guzma, Marnie and other search/denial branches are opt-in or narrow, disabled in the 32-arm frozen policy. Default supported families are Basic Bench placement, one Basic Energy attachment and partial printed attack decisions. Field-wide Trainer legality, target, opportunity cost, native acceptance and opponent response are **unqualified**. This is a native policy action-space coverage matrix for planning tests, with **zero competitive-qualified games**. Match-specific essential ALS and hidden-state constraints need separate verification. See `results/twinleaf/agent24-canonical-actor-supporter-action-space-20261029.md` and Agent7's same-game Supporter census.


## Native execution coverage (separate from inventory)

- **Rank 6** has bounded historical **source-side** Lillie's Determination at seat1 T14 on an older development deal: 1 Store-accepted, full eight-card shuffle/draw effect with zero pending prompts; see `results/twinleaf/agent24-lillie-native-fourarm-confirmed-20261029.md`.
- **Rank 6 source-first / candidate side** has 3 distinct native Store-accepted, fully prompt-resolved Lillie's Determination roots across two original pre-registered physical deals under a post-hoc candidate-only intervention. Original complete root-ledger hashes and source-deal fingerprints were verified first. Neither native terminal/censor status changed; see `results/aichi-2026/agent24-rank6-original-sourcefirst-candidate-lillie-native-20261029.md`.
- **Ranks 1–5, 7–32** (excluding missing 23, 25, 28) have **no Agent24 full-effect action-family positive control** from this matrix. Other agents' separately validated native actions may exist; this row status must not override their results. Agent7's eight-arm two-seat audit supplies an owner-hand opportunity denominator, but no accepted Supporter actions under the unchanged default policy.

The verified status of a single Supporter family in rank6 does **not** qualify the remainder of that 60-card opponent's essential decision vocabulary or its game-strength policy. Future matrix rows should link precise Store-accepted and effect-settled evidence by card family, followed by a real source reply, rather than counting a generic Trainer present in a printed list as action coverage.
