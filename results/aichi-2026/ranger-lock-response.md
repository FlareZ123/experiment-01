# A counter-axis to attack-based Item lock: Ranger and Channeler

**Agent 5, 15 October 2026.** Narrow card-text verification, precise opening-access submodel, and test plan. No claim of competitive matchup strength.

## Source-backed rules

Japanese Pokémon TCG official listings:
- [Budew (スボミー, SV8a 001)](https://www.pokemon-card.com/card-search/details.php/card/46662/regu/all): Itchy Pollen, zero Energy, 10 damage, opponent cannot play Item cards from hand next turn.
- [Pokémon Ranger (ポケモンレンジャー, XY11)](https://www.pokemon-card.com/card-search/details.php/card/32066): Supporter removes attack effects on **both players and each player's Pokémon**.
- [Channeler (きとうし, SM11)](https://www.pokemon-card.com/card-search/details.php/card/36985): Supporter removes attack effects on **its player and their Pokémon**.
- [Official Japanese Q&A for Channeler](https://www.pokemon-card.com/rules/faq/search.php?freeword=%E3%81%8D%E3%81%A8%E3%81%86%E3%81%97&regulation_faq_main_item1=all): confirms Channeler permits Item play again after a *Vileplume Allergy Storm attack* that previously prevented Items. The same Q&A explains target scope: Channeler cannot remove effects on an **opponent's** Pokémon.

The supplied Advanced Player's Rulebook C-19 treats attack-induced inability to play cards as an effect **on the affected player**. Consequently, the text supports Pokémon Ranger or Channeler as a legal means of ending an existing Itchy Pollen player-targeted restriction on their own turn, **assuming the Supporter itself is playable**. An attack's player-targeted restriction does not vanish when Budew switches or is Knocked Out. A present Vileplume Item-lock **Ability**, Garbodor Ability suppression, or Iron Thorns ex Initialization persists because these Supporters remove effects **of attacks**, not effects of Abilities.

A key opportunity cost is that Ranger/Channeler consumes the turn's Supporter play, excluding draw, Energy-acceleration and gust Supporters that turn. Current lock constraints can also forbid playing any Supporter. Test the turn's surviving resources after using Ranger rather than equating the removal of Item lock with a successful attack or KO.

## Presence in published Aichi field

From [29 published exact lists](full-decklists.json), Pokémon Ranger appears in exactly five placements: **4, 5, 7, 18, 32**. Channeler occurs in **zero** lists. **14/29** lists include Budew. This suggests an underrepresented tech/control axis, but does not establish that a substitution is advantageous for the final deck.

## Exact raw-opening access experiment

Using the [champion Shadow Rider reference](benchmark-shadow-rider.md) as a hypothetical chassis, preserve its original **2 Tapu Lele-GX** and **12 other Basic Pokémon**. Consider replacing `R` non-Basic slots with `R` Pokémon Ranger Supporters, for R from zero to four. Seven opening cards are drawn and six Prize cards set from the other 53 cards. Condition on drawing at least one Basic in the opening seven. A Ranger is marked accessible when either:
1. a Ranger is directly in the initial seven; or
2. no Ranger is in the initial seven, there is at least one Lele **and another Basic** in that hand so the other Basic can start, and at least one Ranger remains in the deck rather than in the six Prizes. This presumes Lele can be played from hand to Bench and its Wonder Tag Ability can search the Ranger.

| Hypothetical Ranger copies | Direct in hand, given valid opener | Wonder Tag route, given valid opener | Either route |
| ---: | ---: | ---: | ---: |
| 0 | 0.00000% | 0.00000% | 0.00000% |
| 1 | 11.09540% | 15.79405% | **26.88944%** |
| 2 | 21.13991% | 15.92199% | **37.06190%** |
| 3 | 30.21517% | 14.50675% | **44.72192%** |
| 4 | 38.39795% | 13.06724% | **51.46519%** |

The two channels are disjoint. Exact combinatorial enumeration and an independent seeded 100,000-deal check are in [`scripts/ranger_opening_access.py`](../../scripts/ranger_opening_access.py) and [`tests/test_ranger_opening_access.py`](../../tests/test_ranger_opening_access.py); the manual [evidence CI run](https://github.com/FlareZ123/experiment-01/actions/runs/38821027488) succeeded.

This is a narrowly defined **opening-window access** probability. It is not the probability of resolving Item lock, reaching Ranger later, obtaining a successful game turn, or winning a matchup. It excludes normal later draws, VS Seeker, other search, prize taking, hand restrictions, other Supporter usage, Ability lock and whether Ranger has any strategically disposable or usable role when drawn. The 2-to-4 Ranger rows are mathematical explorations with substantial opportunity costs of replacing additional cards. No deck swap is recommended on the strength of this submodel.

## Next falsifiable engine test

An opponent's Budew resolves Itchy Pollen; defender cannot play a normal Item; defender plays Ranger/Channeler; defender **can** now play the Item, while the same Supporter usage prevents another Supporter that turn. Repeat with Vileplume's Ability-origin Item lock, where Ranger/Channeler should not remove the restriction. Compare the same scenario under a Supporter-locking effect, where Ranger cannot be used. Save source printings, trace and engine revision. Implement each as a replayable board-state test before incorporating it into a competitive policy.
