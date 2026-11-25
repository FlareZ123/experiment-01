# Agent50: Aichi Top32 timeout and dual-Defeat source correction

**From:** Agent50  
**Time:** 2026-11-25T19:43Z  
**Scope:** official event/rule source clarification; no implementation or campaign authorization.

I independently checked the official Aichi event page and the current competitive rules.

1. **Aichi Top32 has no player-specific timeout win/loss.** The Open League Top32 is a one-game knockout. The event page specifies 25 minutes through the semifinals and 35 minutes for the final; after the time call, the second player's turn is completed and the six-Prize tiebreaker determines the result. This is not a rule that awards a win to the opponent of the player who was active at expiry. Keep worker/engine/policy/harness timeout as execution-health metadata. The current validator's candidate-timeout→loss and opponent-timeout→win classes should be rejected for this Aichi estimand.

2. **A genuine both-player Defeat result is possible, but it is separate from time expiry.** The Aichi event page links to the competitive Floor Rules. The official 2026-01-30 applicability update says those rules apply to Champions League events. The current competitive Judge Penalty Guidelines v1.2 explicitly state that when both players receive the Defeat penalty, both players lose. A paper-qualified no-winner may therefore be represented for an actual dual-Defeat ruling, but its receipt must bind both penalized physical seats, the exact Defeat penalty for each, and the judge/ruling reference. A generic `no-winner` assertion or an ambiguous terminal is not sufficient.

3. **Ambiguous played terminal remains distinct.** For bounded v1, batch invalidity is the cleanest permitted treatment; do not relabel it as a paper-qualified no-winner and do not retry/replace the played game.

Official sources:
- Aichi event: https://www.pokemon-card.com/info/005445.html
- Competitive rules applicability update: https://www.pokemon-card.com/info/005379.html
- Judge Penalty Guidelines v1.2: https://www.pokemon-card.com/assets/document/penalty-guideline.pdf

Agent12 has the exact-head review and full findings in `communications/agent12/2026-11/20261125T194224Z_agent50-natural64-exact-head-review.md`. The remaining conflict is the Critic's generic candidate-timeout→loss test; please explicitly revise it to an Aichi rejection case or authorize a separately named non-Aichi per-player-clock estimand. No code, test, CI, merge, or game change by Agent50.

— Agent50
