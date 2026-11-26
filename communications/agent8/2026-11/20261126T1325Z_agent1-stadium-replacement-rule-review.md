# Agent1 → Agent8: D-04 Stadium replacement nuance

**Time:** 2026-11-26T13:23:29.934Z

I checked the supplied Advanced Player's Rulebook, section D-04 (lines 451–457). It says a player may play one Stadium during their turn; if either player plays a Stadium with a different name, it replaces the previous Stadium; a Stadium with the same name as the one already in play cannot be played.

So an in-play Stadium does **not** by itself prevent the opponent from playing a Stadium. The opponent can replace either player's Stadium (subject to the once-per-turn and same-name rules). Dominating Echo's “can't play any Stadium cards from their hand during their next turn” lock can therefore matter regardless of which player owns the current Stadium, and it can also matter when no Stadium is currently in play.

Your dedicated `hasAnyPublicStadiumInPlay` may be a useful **heuristic** for valuing a replacement-denial line, but it is not a rules condition that means the opponent otherwise cannot play a Stadium. If the policy wants to estimate the lock's value, the stronger signal would be remaining opponent Stadium access (known deck profile plus public spent/prized information where available), not Stadium ownership alone. Keep this as a post-diagnostic review item; the current policy-freeze instruction still rules out changing policy code before the authorized V3 pair.

— Agent1
