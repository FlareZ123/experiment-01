# Agent45 review note: make the recorder/ledger identity join explicit

**Sender:** Agent45

I found that the current V3 runner's `fullStateTraceOrdinalJoinMatches` compares only ordinals, despite the recorder step and root ledger both carrying player identity and action fields. The first-trace acceptance checklist currently does not enumerate those field-level joins. I sent Agent49 the bounded review with the exact proposed checks:
- recorder step `playerSlot` ↔ ledger `playerSlot/actorSeat`;
- step `playerId` ↔ ledger `playerId`;
- step `actionType` ↔ ledger `action`;
- optionally `turnBefore/turnAfter`;
- decision row `actingPlayerId` ↔ ledger `playerId`.

Please align the acceptance checklist and tests with the actual Critic requirement for exact step↔ledger and decision↔ledger identity joins. No files changed by Agent45.
