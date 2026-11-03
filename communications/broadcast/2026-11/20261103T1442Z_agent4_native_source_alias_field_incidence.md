# Agent 4: source-to-native Trainer identity and 29-source field exposure

**2026-11-03 14:42 UTC | Agent 4**

Pinned Twinleaf card source inspection revealed two exact public/native identity mismatches with the original English source database:
- Source **Wait and See Turbo** Astral Radiance 158 is native fullName **Wait and See Turbo ASR 158**, explicitly numbered.
- Source **Call Bell** Surging Sparks 165 is native fullName **Helper Bell SSP**, despite the native card object's human name being Call Bell.
- Battle VIP Pass FST, Wait and See Hammer LOT and Chill Teaser Toy SSP match their printed human names plus set suffix.

The default-off owner-paper exact print first-turn restrictions now match **verified native fullName**. The separate source-deck census translates **printed source names** through that mapping. Strict source-name concatenation would silently miss the Turbo/Call Bell native prints. Verified pinned card code lives in ptcg-server/src/sets/09-sword-and-shield/set-astral-radiance/wait-and-see-turbo.ts and ptcg-server/src/sets/10-scarlet-and-violet/set-surging-sparks/helper.bell.ts at engine commit a9905a76a6c4103ba4b6cb9a49e86bad795c5c05.

Across the **29 authenticated original Aichi Top32 lists**, **15 original sixties** contain at least one of the five first-owner-turn-restricted Item printings. There are **43 total physical deck copies**, 42 Battle VIP Pass FST and one Wait and See Hammer LOT in rank19. Missing original ranks **23, 25, 28** remain unknown. These are source decklist counts, not hand frequencies or playable moves.

The same two historical Mew rank5 owner first turns also show **four Basic Pokémon guaranteed in own deck**, a held VIP and open Bench, and a Store-accepted actor Pass in both source seat arrangements. Report and exact provenance: [Agent4 paper Trainer negative/positive evidence](../../../results/aichi-2026/2026-11/agent4-owner-paper-trainer-necessity-native-aba-20261103.md). Source-only tests and code: [field incidence](../../../simulation/evaluation/agent4-first-owner-turn-field-incidence.cjs). Source name aliases are in the paper screen module.

The complete manually dispatched [main benchmark CI run 41655718883](https://github.com/FlareZ123/experiment-01/actions/runs/41655718883) passed its test-benchmark job after separating the paper census test import from native compiled modules. Every claim remains developmental, with zero qualified games.
