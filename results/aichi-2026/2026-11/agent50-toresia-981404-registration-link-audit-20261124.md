# Toresia event 981404: official-registration source audit

**Date:** 2026-11-24  
**Scope:** assess whether Toresia's CL2026 Aichi May Open League page upgrades the Aichi Top32 source or official-registration evidence.

## Finding

Toresia is a useful **Top16 discovery/corroboration lead**, but the currently accessible evidence does **not** justify changing any official-registration identity status or Aichi source-list coverage.

- Toresia indexes **CL2026 Aichi May Open League (Extra)**, 10 May 2026, at Aichi Sky Expo, and attributes its source to the official Pokémon Card Game Players Club. Its indexed standings contain **16 deck-list entries**: 1st, 2nd, two 3rd-place entries, four 5th-place entries, and eight 9th-place entries. The visible page text labels each as 「リストを見る」. Source: [Toresia event 981404](https://toresia.net/pokeca-deck/events/981404/).
- The official Players Club result route is [event 981404/result](https://players.pokemon-card.com/event/detail/981404/result). The publicly retrievable page is only the JavaScript app shell ("app_player does not work properly without JavaScript enabled"); no result rows, registered deck identifiers, or per-player saved-deck links were exposed.
- The Toresia page itself returned a cache miss when opened. Its indexed text does not expose the destination URLs behind the 16 「リストを見る」 links or the card inventories on those linked pages. Therefore I could not establish that those links resolve to official Players Club registration records or official saved-deck IDs.
- The official event announcement independently confirms that the Open League used Extra, required Japanese-language cards, was a 60-card / six-prize event, and required Players Club deck registration by 08:30 on 10 May. This proves the registration process existed; it does not identify the registered list for any particular placing player. Source: [official CL2026 Aichi May event rules](https://www.pokemon-card.com/info/005445.html).
- Existing repository crosswalks already reconcile official Pokémon deck-builder saved-deck codes to exact 60-card inventories for source rows 1, 3, 4, 13, and 15. Those reports explicitly classify the codes as public saved-deck records linked by a **secondary roundup**, not as official tournament-registration receipts:
  - `agent40-official-deck-code-crosswalk-ranks3-13-20261115.md`
  - `agent40-official-deck-code-crosswalk-rank4-20261115.md`
  - `agent40-official-deck-code-printing-crosswalk-ranks1-15-20261115.md`

## Decision

1. **No source-coverage change:** the event page exposes 16 entries, not the missing source ranks 23, 25, or 28. Keep 29/32 exact Aichi source lists authenticated and 23/25/28 unavailable.
2. **No official-registration status change:** a Toresia event row and an unattributed 「リストを見る」 label do not prove that a deck is the player's event-registered list. No official result-page link or registration payload was accessible to bind a specific player, placement, and saved-deck ID.
3. **No physical-copy change:** digital deck records do not establish the physical printings used at the event. Keep this dimension separate.
4. **Do not duplicate the existing saved-deck crosswalks** unless a recovered Toresia link supplies a genuinely new official deck ID, a stronger event-to-player join, or an independently testable registration record.

## Exact next discriminator

For any proposed upgrade, preserve the actual target URL behind a Toresia 「リストを見る」 link. If it is an official Pokémon saved-deck URL of the form `pokemon-card.com/deck/confirm.html/deckID/{code}`, compare its complete 60-card name/count map against the relevant `full-decklists.json` row. Separately establish, from the official Players Club result page or a verifiable official event-to-deck association, that this exact code was the list registered for that player at event 981404. A saved-deck content match alone remains weaker than proof of the event registration.

## Evidence boundary

This is a source-discovery audit, not a deck-mechanics finding, opponent-admission decision, or matchup result. The 0/32 qualified competitive-matchup count and absence of a demonstrated 99.5% win rate remain unchanged.
