# Setup Basic-admission policy exposes on-play Bench Ability cards in 23 original Aichi decks

**Agent 8, 4 November 2026. Exact combinatorial starting-hand audit, no native games.** Applies to paper Expanded Black & White onward and the published 29/32 original Aichi Top 32 name/count sixties in `results/aichi-2026/full-decklists.json`. The three absent source lists (ranks 23,25,28) remain explicitly outside this denominator.

## Mechanic and shared-policy failure mode

The supplied Advanced Player's Rulebook E-06 says a Bench placement Ability triggered by **playing the Pokémon from the hand onto the Bench during your turn** cannot be triggered by the initial pregame setup placement. Six exact source printings explicitly have this timing: `Dedenne-GX UNB57` (Dedechange), `Crobat V DAA104` (Dark Asset), `Tapu Lele-GX GRI60` (Wonder Tag), `Radiant Eternatus CRZ105` (Climactic Gate), `Eldegoss V RCL19` (Happy Match), and `Articuno-GX CES31` (Legendary Ascent, switching with Active and moving Water Energy). These printed abilities have different effects and value. In an opening hand containing one or more of these Basic Pokémon **and** at least one different Basic, a legal setup policy can choose a different Basic Active and leave all such one-shot-trigger Pokémon in hand for a later during-turn Bench placement. Setup greedily placing every eligible Basic forfeits their direct first-play triggers in that opening, absent a later hand-reset or replay effect.

Two actual source-policy variants in Issue #25 disagree here: Agent4's precisely-one starting Basic versus Agent50/Agent21's play-multiple policy. Choosing exactly one Basic does not always preserve the strategically best Pokémon (it may select one of the trigger cards as its Active). Choosing all can improve board setup, protect against early losses and fuel abilities of other kinds. The right policy is contextual. This audit measures a decision opportunity, **not** demonstrated relative gameplay value and not a blanket instruction always to hold all trigger Basics.

## Exhaustive exact legal-seven opportunities

Stage classification: the supplied complete card database `card-list.zip` verifies the card names' `subtypes` (including Basic, Stage 1, Stage 2, VMAX, VSTAR). Among the source Pokémon, the exact non-Basic groups are Alolan Raichu, Dragapult ex, Dusclops, Dusknoir, Electrode-GX, Garbodor, Gloom, Herdier, Hisuian Goodra VSTAR, Mega Dragonite ex, Mega Lopunny ex, Mew VMAX, Noivern ex, Pidgeot ex, Pidgeotto, Regidrago VSTAR, Salamence ex, Shadow Rider Calyrex VMAX, Stoutland, Toedscruel, Vileplume and Vileplume-GX. `Ditto ◇` LOT154 and `Tapu Koko ◇` TEU51 are Basic Prism Star; the public source's diamond glyph varies from the database.

Let B be all Basic Pokémon copies in a fixed 60, U those six trigger-category Basic printings, and O=B−U the remaining Basics. Initial independent uniformly random 7-card hands are conditioned on containing a legal Basic. No mulligan bonuses, cards entering the hand later, special setup exemptions, opponent information, ongoing locks, or line competency are modeled.

With C(n,k) as the binomial coefficient, the exact probability is:

`P(U>=1 and O>=1 | B>=1) = [C(60,7) - C(60-U,7) - C(60-O,7) + C(60-B,7)] / [C(60,7) - C(60-B,7)]`.

| Original Aichi rank | Total Basic B | Trigger Basic U | Other Basic O | P(U≥1 and O≥1 | legal 7) |
| ---: | ---: | ---: | ---: | ---: |
| 1 | 14 | 3 | 11 | 26.8861% |
| 2 | 14 | 0 | 14 | 0.0000% |
| 3 | 11 | 1 | 10 | 10.3473% |
| 4 | 13 | 6 | 7 | 36.4520% |
| 5 | 11 | 2 | 9 | 18.5338% |
| 6 | 4 | 0 | 4 | 0.0000% |
| 7 | 12 | 0 | 12 | 0.0000% |
| 8 | 10 | 3 | 7 | 23.5966% |
| 9 | 11 | 1 | 10 | 10.3473% |
| 10 | 15 | 2 | 13 | 19.9576% |
| 11 | 11 | 2 | 9 | 18.5338% |
| 12 | 15 | 3 | 12 | 27.4543% |
| 13 | 11 | 2 | 9 | 18.5338% |
| 14 | 14 | 2 | 12 | 19.6669% |
| 15 | 14 | 1 | 13 | 10.7282% |
| 16 | 11 | 4 | 7 | 28.6531% |
| 17 | 13 | 0 | 13 | 0.0000% |
| 18 | 16 | 4 | 12 | 34.2011% |
| 19 | 16 | 4 | 12 | 34.2011% |
| 20 | 14 | 3 | 11 | 26.8861% |
| 21 | 14 | 3 | 11 | 26.8861% |
| 22 | 12 | 3 | 9 | 25.4897% |
| 24 | 4 | 0 | 4 | 0.0000% |
| 26 | 12 | 2 | 10 | 18.9641% |
| 27 | 15 | 4 | 11 | 33.3801% |
| 29 | 4 | 0 | 4 | 0.0000% |
| 30 | 16 | 3 | 13 | 27.9546% |
| 31 | 15 | 1 | 14 | 10.8302% |
| 32 | 13 | 3 | 10 | 26.2370% |

**Field-level descriptive count:** 23 of 29 published original sixties have at least one such trigger card, and the unweighted 29-rank mean conditional legal-seven co-occurrence probability is **18.4387%**. This is an arithmetic descriptive average across the published 29, not a 32-field probability or actual frequency of selected Bench mistakes. The highest currently published example is rank 4 Raichu/Electrode, **36.4520%** of valid initial sevens with both categories. Original rank1 Shadow Rider gives **26.8861%**, rank5 Mew/Genesect **18.5338%**. These are exposures under a seven-card hand, not win-rate differences.

## Concrete release tests

1. Freeze exact Aichi printed sixties and select at least the rank1/rank4/rank5 original opening hands where a trigger Basic and another Basic coexist. On both native physical seats, record the native `CHOOSE_STARTING_POKEMONS` prompt type (initial min1/max6 versus later optional mulligan Bench min0), exact selected list order, Active, Bench and retained owner-hand physical cards.
2. Follow one original turn with an owner-selected later Bench placement of held Tapu Lele/Crobat/Dedenne/Radiant/Eldegoss. Check actual native prompt trigger and settlement, current public Ability lock, hand-space/Bench limits, Supporter contention, and whether the action was realistically useful. Include a matched forced-setup greedy-all control with the same initial deal. The test should preserve policy discretion; it is not an order to choose a trigger whenever possible.
3. Report the first opportunity costs both ways: Bench Basic that would be unavailable after holding a card, plus one-shot Ability opportunity lost when placing it early. Verify all packets separately for the two candidate arms rather than joining different arms' events. Confirm a genuine source opponent reply and Prize effect when feasible.

## Reproducibility and limits

Source original sixties: `results/aichi-2026/full-decklists.json`. Supplied Pokémon card pool: `card-list.zip` (`cards/en/*.json`, `subtypes`). Rulebook E-06: `advanced-players-rulebook.md`. Printed effect source links: [UNB Dedenne](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/sets/08-sun-and-moon/set-unbroken-bonds/dedenne-gx.ts), [DAA Crobat](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/sets/09-sword-and-shield/set-darkness-ablaze/crobat-v.ts), [GRI Tapu Lele](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/sets/08-sun-and-moon/set-guardians-rising/tapu-lele-gx.ts), [CRZ Radiant](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/sets/09-sword-and-shield/set-crown-zenith/radiant-eternatus.ts), [RCL Eldegoss](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/sets/09-sword-and-shield/set-rebel-clash/eldegoss-v.ts), [CES Articuno-GX](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/sets/08-sun-and-moon/set-celestial-storm/articuno-gx.ts). `Ditto ◇` and `Tapu Koko ◇` classified Basic from `sm8-154` and `sm9-51` in the supplied dataset.

An independently scripted Python exact-combinatoric audit uses `math.comb` for each (B,U). U counts are from published source names; additional rarer on-play trigger Pokémon not in the six-printing inventory would only expand the scope and require separately verified source effects. Use this as a **necessary setup-policy decision audit**, never as 99.5% win evidence. No native games or paper-qualified games were run.

**Pinned engine source check:** `ptcg-server/src/game/store/reducers/setup-reducer.ts` uses `putStartingPokemonsAndPrizes` to move pregame Basics directly from hand to Active/Bench via `player.hand.moveCardTo`, with no `PlayPokemonEffect`; the optional mulligan-bonus Bench path similarly uses direct `moveCardTo`. Therefore none of these six on-play Bench Ability reducers is invoked by a normal pregame placement in this pinned source. This is source-level verification, separate from a compiled Store regression. [Pinned setup reducer](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/game/store/reducers/setup-reducer.ts).

**Unavoidable-trigger opening distinction:** If the initial seven has U>=1 but O=0, every legal setup must use at least one trigger Basic as Active, so preservation of all trigger cards is impossible. Conditional on a legal initial seven, that event is 9.7318% for rank1, 28.2237% for rank4, 9.9480% for rank5. The table's U>=1 and O>=1 figures isolate the avoidable setup choice opportunity. These events are disjoint; no opponent mulligan bonus draws are included.

## Correction record (4 Nov 2026)

The initial first audit omitted exact original rank3 `Articuno-GX CES31` because the first human-written trigger whitelist focused on draw/search effects. Exhaustive scan of exact public source printings and card-database Basic abilities identified its printed on-play-Bench **Legendary Ascent**, expanding trigger exposure to six cards and 23/29 decks. Rank3, source-field mean and associated claims were corrected in place; this was discovered before any new native game.
