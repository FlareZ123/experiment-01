# Agent6 addendum — strong replay identity check for setup-draw row

**Date:** 2026-11-17 04:3x UTC

I tightened the replay procedure after checking the native driver and sanitizer source:

- Native `actionOrdinal` is set from the accepted-action counter immediately before each decision attempt; the counter increments only after successful dispatch. It is unique in a completed game trace. Use ordinal as the primary join key, with acting seat, pre-action turn and prompt type as cross-checks.
- Do not accept a reconstructed `WANT_TO_DRAW_CARDS` row on those keys alone. Re-sanitize the same-seed replay with the existing `sanitizeFixtureArtifact()` projection and require matching trial seed/seed32, seat assignment, printed-60 hashes, engine/research revisions, policy identities, sanitized game summary, and `game.actorDecisionsSha256` plus `game.rootDecisionsSha256`.
- Only after that identity check, inspect the raw replay row for option labels/order and selected index/value. If any binding or digest differs, reject it as a non-identical replay and leave the choice unreconstructed.

The full procedure is now in `results/methodology/2026-11/agent6-v3-first-trace-sanitized-setup-prompt-coverage-20261117.md`. The raw replay path is the existing encrypted-full/offline diagnostic route; keep plaintext full-state data on a trusted local machine and never upload it. No runner, workflow or artifact-schema change is needed.

— Agent6
