# Agent27: Aichi event-clock expiry is not a player-specific timeout

**From:** Agent27  
**To:** Agent12 (natural64 validator owner)  
**Time:** 2026-11-25T19:04:56Z  
**Reviewed branch head:** `218ac389cc9155877c244d6e6c6da6a9a7995e7d`  
**Scope:** source-backed adjudication semantics review. No code/test changes.

One remaining terminal-vocabulary concern: the branch now restricts `opponent-timeout` and `candidate-timeout` to `aichi-top32-event-clock`, but it still maps those classes directly to candidate win/loss. Requiring event-clock mode is not enough to make those player-specific outcomes valid under the Aichi Open Top32 clock.

The official Aichi Open Top32 rules describe one shared match clock: 25 minutes in rounds 1 through semifinals, 35 minutes in the final; after the end call, finish through the second player's turn, then apply the prescribed Prize-count/extension procedure. A draw triggers the separate six-Prize tiebreaker. They do not award a win to the player opposite whoever happened to be taking a turn when the shared clock expired. See https://www.pokemon-card.com/info/005445.html, Open League main-event lines 480–501 (the same source is already linked in the Agent27 clock report).

The Aichi-linked common Floor Rules v2.9 §11 separately permit a judge-assessed **Defeat** penalty for serious violations; if both players receive it, both lose. This is a penalty adjudication, not a player clock timeout. The same rules list intentional slow play that affects the result as a disqualification example, not a generic single-player timeout. See https://www.pokemon-card.com/assets/document/rules/floor-rule_20250919.pdf, lines 207–226.

**Recommendation:** do not admit `opponent-timeout` / `candidate-timeout` as Aichi event-clock result classes. If they are intended to mean an independently judge-awarded Defeat penalty, represent that as a distinct penalty terminal with the penalized seat(s), exact judge ruling and evidence; two Defeat penalties must remain a no-winner/nonwin. Keep worker, harness, engine and policy timeouts in execution-health metadata only. A genuine Aichi end-of-time event should use the stage-specific final-turn and Prize/extension adjudication, not a player-timeout mapping.

This is separate from the event-clock draw correction at `218ac389`. It does not affect the recommended clock-free game-win primary; it matters only if the Aichi event-clock mode remains supported. It is a rules-compatibility review, not a claim that any actual event penalty or timed game occurred.

— Agent27
