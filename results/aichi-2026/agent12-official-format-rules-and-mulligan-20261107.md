# Official Aichi Open League format, card pool, and setup procedure

**Agent 12 | 7 November 2026 | primary-source confirmation**

## Decision-relevant conclusion

The official Pokémon Card Game announcement for **Champions League 2026 Aichi May** explicitly assigns **Extra Regulation to the Open League**. The event therefore used the Japanese official Extra format, not the international Expanded legality profile. The official regulation page defines Extra as cards from the **BW series through the latest series**, and publishes the contemporaneous banned-card list. The event page additionally requires Japanese-language cards, 60-card decks, and six Prize cards.

This resolves the format uncertainty in the current repository decision board. It does not certify any individual list's legality or exact historical printings; each card still needs Japanese-print, effect/errata, ban-list, and event-specific validation.

## Primary sources

1. **Official event announcement:** [Champions League 2026 Aichi May, tournament overview](https://www.pokemon-card.com/info/005445.html), published 30 March 2026.
   - Lines 75-76: Standard for Master/Senior/Junior; **Extra for Open League**.
   - Lines 84-89: Open League Extra, **60-card deck and six Prize cards**, with the regulation details linked.
   - Lines 91-98 and 175: only cards allowed by the regulation; **Japanese cards only**; the event links its competitive floor rules.
   - Lines 420-456: Open League qualifying format, 25-minute Swiss rounds, and the end-of-time procedure.
   - Lines 470-501: Open League knockout format, 25 minutes for rounds 1 through semifinals, 35 minutes for the final, and the tie-break procedure.

2. **Official Japanese regulation definition:** [Pokémon Card Game regulations](https://www.pokemon-card.com/rules/regulation/), Extra section updated 19 February 2026.
   - Lines 131-138: Extra is defined as the **BW series through the latest cards**.
   - Lines 146-174: the official Extra banned-card list and additional tournament restrictions.
   - Lines 175-176: Professor's Research / Professor Sycamore / Professor Juniper are treated as one name family for deck construction; Boss's Orders / Lysandre are likewise one family.

3. **Official event-linked competitive floor rules:** [Pokémon Card Game Competitive Floor Rules v1.2](https://www.pokemon-card.com/assets/document/rules/floor-rule_20260130.pdf), updated 30 January 2026. The event announcement links this document.
   - Page 9, lines 245-251: if one player has no Basic Pokémon, only that player returns their hand and restarts; the opponent may then draw as many bonus cards as the number of that player's restarts.
   - This is the relevant Japanese event-linked procedure for the optional mulligan-bonus model. The document does not state the TPCI handbook's discretionary eight-mulligan progression; do not import that foreign procedure without an Aichi-specific organizer override.

## Open League clock and end-of-time rules

The official event announcement gives the following stage-specific rules:

| Stage | Round duration | End-of-time procedure |
| --- | ---: | --- |
| Open League qualifying Swiss | 25 minutes | If no winner at the time call, the player who started second receives one additional turn only when the player whose turn is in progress started first; if the time call occurs during the second player's turn, no additional turn is added. Pokémon Check is excluded. If no winner is established when time expires, both players lose. |
| Open League Top 32 knockout, rounds 1 through semifinals | 25 minutes | After judge confirmation, continue through the end of the second player's turn. Exclude the following Pokémon Check. Then apply the published Prize-count tie-break and extension procedure. |
| Open League final | 35 minutes | Same published Top 32 tie-break procedure. |

For the Top 32 tie-break after the additional turn:
- If either player needs two or fewer Prizes to win, the player needing fewer Prizes wins. If equal, continue until a player meets a win condition or has fewer Prizes remaining.
- If both players need three or more Prizes, continue until a player meets a win condition or reaches two or fewer Prizes remaining and has fewer Prizes than the opponent.

The official Japanese source is authoritative for the event. This note is a source map, not a replacement for Agent27's independent clock implementation and paper-game acceptance work.

## Mulligan-bonus model implication

The event-linked Japanese floor rules explicitly permit an opponent bonus draw for each one-sided restart, with no eight-restart cap in this document. The unbounded geometric opponent-mulligan model used in the New Moon joint-access calculation is therefore the correct no-organizer-intervention baseline for this event. Retain the previously published values:
- direct joint Field Blower + Canceling Cologne access: **7.7118508%** after all optional bonuses and the first mandatory draw;
- Secret Box-assisted upper bound: **13.7665827%** under the same window.

These remain access probabilities, not matchup or game-win estimates. They assume every offered bonus is accepted and do not price Secret Box's three-card discard cost.

## Consequences for the repository

1. Update any decision-board wording that still says official Aichi format confirmation is pending. The Open League format is officially confirmed as Japanese Extra, BW onward.
2. Use the official Japanese Extra ban list and Japanese physical cards when certifying legality. International Expanded flags are not a substitute.
3. Preserve exact name/count composition separately from historical print provenance; the 29 authenticated 60-card inventories do not automatically become 29 exact Japanese physical-print lists.
4. Keep the 25-minute Swiss and Top 32 clock stages distinct. Do not apply the Swiss both-lose rule to Top 32, where the published extra-turn and Prize-count tie-break procedure applies.

**Evidence status:** official format and event-linked setup/clock rules confirmed; no candidate deck has thereby passed complete paper-legality review or competitive-game qualification.
