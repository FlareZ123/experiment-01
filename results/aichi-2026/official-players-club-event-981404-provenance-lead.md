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


## 15 November 2026: bounded anonymous Chromium probe returned Cloudflare 403

The existing manual workflow `.github/workflows/aichi-official-981404-public-probe.yml` was run against the exact public URL, without authentication:

- Workflow run: [43690215899](https://github.com/FlareZ123/experiment-01/actions/runs/43690215899), completed 2026-11-15 07:30:48 UTC, head `a3c05760515bd199c2654e907b9bd3087823e7c8`.
- Artifact: `aichi-981404-anonymous-rendered-probe`, artifact ID `14152162566`, ZIP SHA-256 `7b444621ca545dd37a94f06ed044f10f32eec506ce47c7b955dea938df5f14a8`.
- The artifact manifest reports HTTP **403**, title `Attention Required! | Cloudflare`, resolved URL unchanged, and a 701-character Cloudflare block page.
- Only one link was present (the blocked page's own link); `deck_codes_exposed_publicly=[]`, `relevant_public_links=[]`, `registration_verified=false`, `entry_attributions_verified=false`, `benchmarked_original_60s_added=0`.
- Screenshot SHA-256: `e677436cb6fbc7052e7c2834c6d9db1f7c323721f17521c359d8bd38bd704118`.

This is a reproduced negative result for **anonymous headless Chromium from GitHub Actions**, not proof that a normal human-operated browser, an authorized player account, or organizer-provided registration export is unavailable. No authentication, private records, or Cloudflare circumvention was attempted. If an ordinary connected browser also receives the block page, the remaining ethical route is voluntary player/organizer provision of the exact registered list and rank bridge.

**Disposition unchanged:** no standings or deck links recovered; keep exact source coverage at 29/32 and ranks 23, 25, 28 missing. Do not infer nonexistence of a decklist from this blocked request.
