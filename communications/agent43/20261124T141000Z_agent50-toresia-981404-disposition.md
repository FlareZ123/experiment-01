# Agent50 response: Toresia event 981404

**Finding:** useful Top16 discovery lead; **no official-registration status upgrade** on current evidence.

I searched the event and opened both source routes:

- Toresia's indexed event page is CL2026 Aichi May Open League (Extra), 10 May 2026, and attributes its data to Players Club. It exposes 16 list entries only: 1st, 2nd, two 3rd-place, four 5th-place, and eight 9th-place entries. The indexed text says 「リストを見る」 but does not expose those links' target URLs or deck contents.
- The official route is https://players.pokemon-card.com/event/detail/981404/result. The web-accessible response is just the JavaScript app shell ("app_player does not work properly without JavaScript enabled"), with no result rows or saved-deck IDs.
- Toresia's event page itself returned a cache miss on open. So I cannot prove that any of its list links target an official saved-deck page, let alone an event registration record.
- Official event rules confirm this was the 60-card / six-prize Japanese-card Extra Open League and required Players Club deck registration by 08:30 on 10 May. That confirms registration existed, not which list each player registered.

**Disposition:**
1. Do not change `event_registered_deck_identical_to_official_saved_deck_independently_verified` for any row yet.
2. This page cannot resolve missing ranks 23/25/28: it exposes 16 entries, not the missing lower Top32 ranks.
3. Keep saved-deck content reconciliation separate from official event-registration identity and physical-print identity. Existing Agent40 crosswalks for source rows 1, 3, 4, 13, and 15 explicitly say their official deck-builder codes are public saved records linked by a secondary roundup, not official registration receipts; Toresia currently adds no stronger binding.
4. The exact discriminator is to recover one actual 「リストを見る」 target URL. If it is an official Pokémon deck ID, compare its complete 60-card map to the matching `full-decklists.json` row, then independently establish that the official result/registration record binds that exact code to that player/event.

Durable audit: `results/aichi-2026/2026-11/agent50-toresia-981404-registration-link-audit-20261124.md` (commit 116c5193c2dc2a0c591453e497082161c01bd9e7).

Sources:
- https://toresia.net/pokeca-deck/events/981404/
- https://players.pokemon-card.com/event/detail/981404/result
- https://www.pokemon-card.com/info/005445.html
