# Agent43: official mechanics of the three Japanese-only Aichi promo identities

**Date:** 14 November 2026  
**Scope:** Rules/text clarification for the five source lists affected by the three Japanese-only identities. No engine test or game result is claimed.

## Exact official card text and source distribution

The official Pokémon Card Game database gives the following effects:

| Identity | Printing | Type | Official effect, summarized | Aichi source ranks | Copies |
|---|---|---|---|---|---:|
| Player's Ceremony | S-P 127 | Stadium | Once during each player's own turn, that player may draw 2 cards; if they do, their turn ends. | 3, 6, 24, 29 | 5 |
| Palace Book | SM-P NAN25 | Item | Draw 3 cards; your turn ends. | 6, 7, 24 | 6 |
| Palace Belt | BW-P 153 | Pokémon Tool | If the attached Pokémon is Active, draw 2 at the beginning of your turn instead of 1. | 6, 29 | 3 |

Primary sources:
- Player's Ceremony official card page: https://www.pokemon-card.com/card-search/details.php/card/38633/regu/XY
- Palace Book official card page: https://www.pokemon-card.com/card-search/details.php/card/34382/regu/all
- Palace Belt official card page: https://www.pokemon-card.com/card-search/details.php/card/28213/regu/DP
- Official BW-P FAQ page: https://www.pokemon-card.com/rules/faq/search.php?sc_series_id=BWP

## Important rule edge: Palace Belt does not stack

The official Pokémon Card Game FAQ states that when four Palace Belts are attached to the Active Pokémon via Item Box, the player does **not** draw eight cards at the start of the turn. The effect remains a replacement of the normal one-card draw with two cards, not an additive +1 per copy. The same FAQ says a draw-prevention effect from Luvdisc's Heart Wink prevents the draw even when Palace Belt is attached. Thus:
- apply the Palace Belt replacement only when the attached Pokémon is Active at the draw step;
- multiple copies do not multiply the draw count;
- ordinary draw-prevention effects still suppress the draw.

The official FAQ also confirms that the two cards drawn via Palace Belt can both trigger Top Entry for two Lombre, and that both drawn Item cards may be played normally. This supports treating the effect as two ordinary cards drawn at the normal draw step, not as a special one-card draw event.

## Adapter/test implications if the owner approves the cross-format benchmark

These identities are not exotic game subsystems: they are one Stadium optional draw-and-end-turn effect, one Item draw-and-end-turn effect, and one Tool that modifies the draw step. A bounded research-side implementation is plausible if the pinned engine already exposes the relevant Stadium, Item, Tool and draw-step hooks; that interface/support has **not** been inspected or tested here.

Minimum regression cases:
1. Player's Ceremony can be used once by each player on that player's own turn; choosing it draws two and ends only that player's turn.
2. Palace Book is an Item draw-three effect that ends the current player's turn after resolution.
3. Palace Belt draws two instead of one only when its attached Pokémon is Active at the start-of-turn draw step.
4. Four Palace Belts on the Active Pokémon still produce only two cards, not eight.
5. A draw-prevention effect suppresses the Palace Belt draw.
6. The Stadium/Item/Tool effects respect the normal card-type locks and card-removal/replacement rules.

The source distribution is 14 copies across five ranks, as already counted in results/aichi-2026/2026-11/agent3/format-contract-player-ceremony-20261112.md. This note does not change the five incompatible ranks, the three missing ranks, or the owner-controlled format decision. It provides no legality admission, Twinleaf support claim, matchup result, or win-rate evidence.
