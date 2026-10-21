# Rank11 source-first turn22: owner Basic attachment and observable damage exposure

**Agent44 | 21 October 2026 | retrospective genuine pinned-Twinleaf Store audit, conditional alternative analysis only.** Zero competitively qualified games. No new match executed. No patch to a shared decision policy was made from this observation.

## Frozen source and independent readback

- Archived treatment: [manual workflow 39639145934](https://github.com/FlareZ123/experiment-01/actions/runs/39639145934), original GitHub Actions artifact **12363533023**, ZIP SHA256 `6d5480ac58fb407f457d3e0d90ec5429cb24c720be44fadfb992346d323d7a14`. This was downloaded and independently hashed again before reading `agent7-canonical-sourcefirst.json`.
- Exact target row `11:retrospective-sourcefirst:2:B:new-moon-lockbreaker-v1`, seed **482443328**, source physical fingerprint `60b66e9e74e6e2914d92ba2c03dce8671b372e624f4f50797a6022a3eb955e31`, candidate seat **B/1**, source seat **A/0** first. Twinleaf pinned `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. The underlying [Agent45 same-head report](agent45-canonical-sourcefirst-recipient-native-negative-20261021.md) describes the broader four-arm matched OFF/ON null result and paper-rules caveats.
- Independently checked bundled English printed card entry `cards/en/swsh10.json`, `swsh10-133`: Oranguru V **210 HP** and Psychic [Colorless, Colorless, Colorless], `30+`, text `This attack does 50 more damage for each Energy attached to your opponent's Active Pokémon.` Source native attacking Oranguru V at this episode carried **three Basic Darkness Energy cards**, so the printed attack cost is met without a disputed Special-Energy conversion.

## Actual chronological Store evidence

From `sourceAttackSettlement.attacks`, every listed source Psychic has `settledPromptChain: true` and stays in the same game episode. `actorOnlyDecisionCoverage.detailedComponentAudits.root.nativeRootAcceptances` independently confirms the target/hand and public Energy mutation.

| Source turn / attack root | Candidate Active before attack | Damage/Prize settlement |
| --- | --- | --- |
| **19 / 97** | Lunatone, 3 Energy | KO Lunatone, promote zero-Energy Articuno V; source remaining Prizes 6→5 |
| **21 / 109** | Articuno V, 0 Energy, 0 damage | Articuno 0→**30** damage |
| **22 / attachment root 113** | Articuno V, **30 damage, 0 Energy** | Candidate held Basic `Psychic Energy MEE`, hand index9. Actor root selected **Active** `Psyray`, deficit **3→2**. Store accepted and physically confirmed hand count 10→9 and candidate attached Energy 0→1, then candidate **passed** at root114 |
| **23 / 118** | Articuno V, 1 Energy, 30 damage | **30→110** damage |
| **25 / 125** | Articuno V, 1 Energy, 110 damage | **110→190** damage |
| **27 / 133** | Articuno V, 1 Energy, 190 damage | KO Articuno V, source remaining Prizes **5→3** |

The archived T24 pass witness confirms four Benched candidate Pokémon each with **zero Energy**: Duskull ×2 (Future Sight, printed Colorless), Gengar & Mimikyu-GX (Poltergeist, Psychic+Psychic), and Latias ex (Eon Blade, Psychic+Psychic+Colorless). There were no intervening candidate board-geometry changes from the turn22 single Energy attachment and Pass; the source's turn23 card play targeted the source Bench. Those same candidate Bench Pokémon were therefore visible recipient candidates at T22. This establishes **cost-reduction opportunities**, not their native Store target acceptance on that exact earlier turn nor feasible immediate switching.

## A sharply bounded counterfactual

For the same defending Articuno and repeated *unchanged* opponent Psychic attacks, putting the T22 Basic Psychic on a **Benched** recipient or keeping it in hand leaves Articuno with zero Energy, hence predicts **30** printed base damage per Psychic rather than **80**. Across T23/T25/T27, the **conditional** T27 Articuno damage becomes `30 prior + 3×30 = 120`, compared with the **observed** `30 prior + 3×80 = 270`. At its printed 210 HP, a 120-damage Articuno would have **90 HP remaining** at the end of the specified three attacks, whereas the archived Active attachment permitted the T27 two-Prize KO. This arithmetic presupposes the source still attacks on those same turns, no switch or Energy change, no different modifiers, and unchanged bench/defender. None of those counterfactual responses was physically played or observed. Accordingly, it is a **conditional 50 per-hit damage-exposure difference**, and neither an alternate game result nor evidence of a better fixed deck.

The current generic recipient selector ranks *any* Active attack with a positive printed deficit before the Bench; it does not account for opponent-visible damage that increases with the amount of Energy attached to the defending Active. A Bench Duskull would become printed Future Sight-ready from one Basic Psychic, while one on Gengar & Mimikyu-GX would reduce Poltergeist's Psychic deficit from two to one. Whether either recipient is strategically preferable requires real follow-on attachment, mobility, attack, source response and Prize settlement.

## Next controlled experiment, with failure cases retained

Within the **existing canonical bilateral v2 runner**, replay this **same original source-first physical deal**, freezing both printed decks, first player, owner-visible information, and source policy, and compare the actual Active attachment against exactly one independently checked **Bench or withheld** Basic alternative. Before dispatch, confirm selected recipient legal in native Store, capture owner hand/turn resources and actual Bench indices, and inspect the entire genuine source reply through at least T27, including passes, attack resolution, changed board, damage, and Prize effects. Re-run the original rank6 negative fixture and preserve its epoch failure. A no-op, rejected alternative, or source tactical adaptation must remain in the report, and no historical execution qualifies as a competitive win.

**Field gate:** 29/32 exact source opposing lists; ranks 23, 25 and 28 unverified; zero competitively qualified games; the 99.5% goal remains unproven.
