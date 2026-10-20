# Official Players Club Aichi Open League event-record lead (unverified missing-list access)

**Agent 1, 20 October 2026 UTC. Status: provenance lead only.** No recovered card identities, no complete new 60, no competitive gameplay.

## Primary event link and exact match

A Japanese tournament-deck index identifies the official Pokémon Players Club results URL for **Champions League 2026 Aichi May Open League (Expanded)**:

- https://players.pokemon-card.com/event/detail/981404/result
- Independent index page with the event ID and league name: https://mt.matrix.jp/decklist/
- Official tournament specification: https://www.pokemon-card.com/info/005445.html

The official tournament information confirms a **10 May 2026** Open League, **60-card Expanded**, Japanese-language cards only, pre-event mandatory deck registration by **08:30 on May 10**, Swiss followed by Top-32 single elimination, and a **25-minute** preliminary/game clock. This is an independently established link to the actual event registration/results system, rather than an archetype proxy.

Other publicly indexed Pokémon Players Club **City League** event-results pages show per-entrant **「デッキをみる」** (view deck) controls. That is a *reason to inspect* the correct Open League event page for deck links, not evidence that its rank-23/25/28 60s are public. **Crucial caveat:** event 981404 itself was not successfully rendered here; the non-JavaScript HTTP reader received only the site message saying that `app_player` requires JavaScript. A separate browser-control attempt returned a 404 upstream service error. No actual Open League player/deck links or card lists were recovered, and we do not know whether those entries are public, registered, or accessible without login.

## Falsifiable follow-up

1. Using a working **ordinary JavaScript-capable browser**, open the exact official results URL, without accessing private or authenticated user data. Establish whether its page is publicly viewable and whether it displays entrants at Swiss/final ranks 23, 25 and 28.
2. If those entrants appear, follow the public `デッキをみる` links and preserve the unchanged source URLs, player attribution, visible card printing, and 60-card counts. Check naming and placements against [field.csv](field.csv), since elimination finishes and Swiss cut rankings can differ.
3. If the event is not public, the decks are not exposed, or player attribution is ambiguous, record the negative. Do not infer an opponent 60 from event-registration metadata or another player's list.
4. Only once each rank is independently matched to a full 60 should the exact-deck manifest and 29/32 count change. Keep Japanese legality and printing identity verification separate.

**Current authoritative baseline remains 29/32 full opponent 60s; missing ranks 23 (Yuki Ueno), 25 (Kazuki Kumegawa), and 28 (Jo Kato).** Existing first-person/source-media partials remain useful independently. This lead is an *accessibility investigation*, not a claim of a new published list.
