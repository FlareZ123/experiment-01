# Rank 11 source first turn: premature Tool attachments strand Forest Seal Stone

**Agent 6, 18 October 2026 UTC.** One **actual-source** opening-hand and K1 deck-search decision trace, under the pinned generic SimpleTacticsAi. The source line is exposed as a policy failure candidate, with a separately testable legal Boost Shake alternative. It is **not** a qualified match, general opponent behavior estimate or guaranteed winning counterline.

## Exact source and reproduced trace

- Frozen published Wataru Yano **rank-11 Absol Garbodor 60** vs published rank-1 Yasunori Kato Shadow Rider 60.
- Rank-11 seat **0, actually first**, seed `1244180408`, first draw log confirms; Twinleaf pinned `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Reproducer [K1 source auditor](../../simulation/twinleaf/absol-rank11-k1-source-audit.cjs), [own-deck-only prompt audit](../../simulation/twinleaf/absol-rank11-k1-search-observer.cjs) plus [unmodified source first-turn witness](../../simulation/twinleaf/absol-rank11-firstturn-ownhand.cjs).
- [Compiled manual CI **39081582438**](https://github.com/FlareZ123/experiment-01/actions/runs/39081582438) **PASSED** on source head `57e1208a8ae95e9fde1912d929206becdf030fc8`; JSON artifact `12119286487`, SHA256 `3f248083b95d4a999acbea3ea2b9d6328f74165f6efb09abc8c82db72381ae70`. Real-source `runMatch` winner/actions/turns/Prizes/deck hashes/attack/Ability/decision traces were unchanged by switching the read-only observation perspective. The Store owner-deck K1 observer did not feed its counts back to the bot.

The acting rank-11 first-turn own hand, after setup and before play, held:
`2 Float Stone BKT; 1 Darkness Energy MEE; 1 Quick Ball FST; 1 Battle VIP Pass FST; 1 Secret Box TWM`. Rank-11's public board: **Oranguru V Active, Crobat V Benched, zero attached Tools**, open Bench space. The source rank-1 opponent had Radiant Eternatus Active, Shadow Rider Calyrex V Benched.

## Actually chosen path and the foregone search connector

1. Source decision ordinals **7–9**: play Darkness Energy, play **one Float Stone on each of the two available V Pokémon**. Both Tool slots are then occupied.
2. Ordinal **10**: use Active Oranguru V's **Back Order**. Its actual first own-deck search (Store root ordinal 14) had **46 cards remaining**. Relevant accessible remaining physical cards: **2 Boost Shake, 2 Trubbish, 2 Garbodor, 1 Float Stone, 2 Forest Seal Stone, 2 Battle VIP Pass, 2 Quick Ball, 2 Mega Absol ex**. Chosen search outputs: **Float Stone and Forest Seal Stone**. The Stone is already stranded by earlier Tool attachment choices to the two V Pokémon.
3. Ordinals **16–18**: play source-held **Secret Box**, choosing `Quick Ball`, `Battle VIP Pass` and `Float Stone` as three discard costs. In the subsequent own-deck search (Store ordinal 20, **44 cards remain**), still available are **2 Boost Shake, 2 Trubbish, 2 Garbodor, 2 Battle VIP Pass, 2 Quick Ball, 1 Forest Seal Stone**. Instead, the selected four cards are **Carmine, Battle VIP Pass, Forest Seal Stone and Shopping Center**. The Item channel goes to VIP Pass rather than Boost Shake.
4. Ordinals **21–23**: play Shopping Center, retreat Oranguru V, and pass. No source Trubbish was placed, no Garbodor evolved, no Boost Shake was used, and no Star Alchemy was used on turn one. The unchanged source game later finished with rank11 as the engine winner, so absent turn-one lock is **not sufficient to infer a loss**.

This is a direct instance of **connector domination and Tool-slot contention**. The bot obtained the Forest Seal Stone resource via Back Order and selected a second Stone through Secret Box while previously spending **both available Pokémon V Tool slots** on Float Stones. Merely having Forest Seal Stone in hand does not permit Star Alchemy. The source's printed first-turn `Back Order → Stone → Star Alchemy → Boost Shake` tactic was never evaluated successfully by this observed generic policy.

## Testable competing sequence, with precise costs

The frozen first hand and K1 catalog make this candidate branch worth falsifying under true Store actions:

`Battle VIP Pass in opening hand → search one Trubbish onto open Bench → Back Order for Forest Seal Stone → attach Stone to currently Tool-free Active Oranguru V → use Star Alchemy for one available Boost Shake → attach a held Float Stone to Trubbish → play Boost Shake to evolve that Trubbish into an available Garbodor, with Tool attached`.

This plan has a concrete **Item**, **VSTAR-power**, **Tool occupancy**, **Bench space** and **turn-ending Boost Shake** cost. It retains the source held Secret Box and Quick Ball. The available source K1 deck had both copies of relevant Pokémon and Item; source remained on turn one. Because this alternative has **not yet been executed in the reported K1 audit**, do not call it a legal or competitive demonstrated source line until all actual prompts, action prerequisites, end-turn transition and the rank-1 opponent's subsequent response have been reproduced. In particular, the default Twinleaf Ability tactic has previously omitted Tool-granted Star Alchemy, so a dedicated explicit source action is necessary to evaluate its legality.

## Qualification boundary

This evidence is one seed, one first-seat configuration, and a weak-bot policy. K1 searches are legal own-deck observations made during actual search prompts; they do not include the opponent's hidden hand or Prizes. The study does not prove the strong human source pilot could force the alternative with frequency across all openings, and it does not validate subsequent rank-1 response competence.

For the wider Aichi field: **29/32 published exact lists, missing ranks 23, 25, 28; zero independently policy-qualified competitive games**.
