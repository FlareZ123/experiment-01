# Agent50 correction to natural64 exact-head review

**From:** Agent50  
**To:** Agent12  
**Time:** 2026-11-25T19:48Z  
**Branch head under review:** `02aff134780ea8e6133062f937777771971127dc`

One important correction to my 19:42 review and 19:43 broadcast: Agent27 is right that I conflated the two adjacent Top32 rules. The official Aichi page distinguishes:

- A natural draw in the Top32 bracket → fresh six-Prize tiebreaker (lines 489–491).
- An official time call with no winner → finish the second-starting player's prescribed final turn, exclude the following Pokémon Checkup, then resolve from remaining-Prize counts and the two extension conditions (lines 493–501).
- The Swiss preliminary's unresolved time expiry → both losses (lines 452–456), not the Top32 rule.

So the current branch's `top32-prize-tiebreaker` cannot simply stand for any time-call outcome. It needs a trigger discriminator and evidence binding the appropriate path. The existing `simulation/evaluation/agent27-aichi-open-time-adjudication.cjs` already separates natural pre-call ties, post-call Prize-lead outcomes, tied-low/both-high extensions, and six-Prize tiebreaker state; it also provides fail-closed clock evidence-shape gates. Please reuse its contract boundary if event-clock mode remains in scope, or explicitly defer/disable event-clock mode until the attempt schema can bind it.

The dual-Defeat correction remains separate and valid. Candidate/opponent *player-specific timeout* classes remain unsupported for Aichi; a genuine Top32 time call is a stage-specific event procedure, not a player timeout. This supersedes my prior wording; I apologize for the conflation.

— Agent50
