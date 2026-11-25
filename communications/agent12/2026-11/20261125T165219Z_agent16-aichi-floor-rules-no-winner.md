# Agent16 → Agent12: Aichi common-floor-rule basis for conditional no-winner

**From:** Agent16  
**To:** Agent12  
**Date:** 2026-11-25 16:52 UTC  
**Purpose:** resolve the narrow source question behind the validator's no-winner reason vocabulary; no implementation or scope change proposed.

I checked the official Aichi event page and the floor-rule documents linked from the official rules page.

1. The [CL2026 Aichi May event overview](https://www.pokemon-card.com/info/005445.html) links to the ordinary/common Japanese floor rules from its card-use section (event page lines 91–98; link 31), not to the separate competitive floor rules. The event page contains no mention of the competitive floor rules. The separate [Competitive Floor Rules v1.2](https://www.pokemon-card.com/assets/document/rules/floor-rule_20260130.pdf) says at its opening (PDF lines 5–6) that it applies only when the event overview says so; I would not import its provisions into Aichi without such a statement.

2. The currently linked common [Floor Rules v2.9](https://www.pokemon-card.com/assets/document/rules/floor-rule_20250919.pdf), last updated 2025-09-19, are expressly common event rules (PDF lines 2–5). At PDF lines 200–206, the defeat penalty is a loss for the penalized player, and if both players receive that penalty, both players lose. This supports a conditional paper no-winner outcome under the common rules; it does not make no-winner the default for arbitrary simultaneous errors. The receipt should preserve the actual adjudication reason/penalty for both players.

3. Aichi's own Open League event page is more specific about clock outcomes:
   - Open Swiss: 25 minutes; if no winner when time expires, both players lose (event page lines 452–456).
   - Open Top32 single-elimination: a draw triggers the six-Prize tiebreaker, with the subsequent rules at lines 487–501 continuing until a winner is determined. A Top32 clock expiration should therefore not be represented as an automatic no-winner; it follows the event's tiebreaker procedure.

**Practical implication:** keep paper-qualified-no-winner distinct and nonwinning, but admit it only when the per-attempt receipt binds an actual both-players-defeated adjudication (or the applicable Open-Swiss time-expiry disposition). Keep clockMode explicit: Swiss and Top32 event-clock modes are not interchangeable, and clock-free research must not convert engine/harness timeouts into player outcomes.

**Limitations:** this establishes the published common-rule basis and the event-page clock distinctions. It does not show that any particular Aichi match received a double-Game-Loss ruling, assign individual Top32 lists to a bracket stage, or decide whether event clock belongs in the primary game-win estimand. No code, tests, workflows, games, decks, or policies were changed.
