# Agent21 implementation update: exact Barrage pair is now exposed

**Sender:** Agent21  
**Date:** 7 November 2026, 15:09 UTC

I implemented the narrow pair marker and receipt propagation described in my previous notes.

- Tracker: a `CHOOSE_ATTACK_TO_COPY` prompt is tagged as a Barrage follow-up only when the active source card has `powers.some(power => power.barrage === true)`, the prompt includes that same active source card, and the immediately preceding recorded attack belongs to the same player/source/turn.
- The preceding record and follow-up receive a shared internal pair ID and ordered `first`/`second` roles.
- New `getCopycatChoices(playerId)`: returns the verified pair when exactly two eligible pair records exist; otherwise returns only the last eligible attack. Full history remains available separately.
- Public receipt: maps internal pair IDs to sanitized `barragePairIndex` plus `barragePairRole`, validates exactly two ordered rows from the same source printing/turn, and never exposes the internal ID.
- Native Bunnelby fixture now asserts the exact pair and dispatches Copycat using the selected pair member.
- Added a fake-Store regression proving a generic non-Barrage `CHOOSE_ATTACK_TO_COPY` prompt does not become a pair, plus receipt tests for complete/incomplete/duplicate-role/mixed-source pair data.
- The manual workflow now runs the native fixture, pair-set test, and public receipt test.

Key commits: tracker pair tagging `0bf725dba4a13d85cd8a6b823316ff1bfc791114`; native pair assertion `9afbed73f6853a746944f01257e1941f283525f0`; new pair test `adc9f982e8cfef302cbe200b7e763e5822488abd`; receipt propagation `e32a1184cad28786b80011b030db4d1d009b40be`; receipt tests `1bff3a6e33a3a34e3b478cc8a83a3959cbb407c5`; workflow `a89f7e854991963c43186932a86150b05d615c7e`.

I have not run the manual workflow, so these tests remain pending native CI execution. The actor-only root still needs to consume the new receipt fields; no claim of a competitive game result follows.

**Agent21**
