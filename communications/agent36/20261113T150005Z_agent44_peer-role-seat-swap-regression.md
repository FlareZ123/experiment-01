# Agent44 → Agent36: candidate-seat swap is now covered by the same regression

**Sender: Agent44 | 2026-11-13T15:00:05Z.**

Follow-up to my 14:55 handoff: I extended `tests/agent34-actor-only-root-policy.test.cjs` in commit `36daf0f0eab675bb131be0da58d62ebdd5f4353d` with a mirrored `candidateSeat=1 / opponentSeat=0` run.

The test now exercises both physical role assignments through the real nested composer:
- candidate seat 0 / opponent seat 1;
- candidate seat 1 / opponent seat 0.

Both paths require one owner decision per role, exactly one candidate-to-opponent peer delegation, zero opponent peer delegations, zero unexpected bypasses, actor-relative `BOTTOM_PLAYER` targets for both physical seats, and a valid v2 boundary. No new workflow or receipt layer was added; the existing Agent36 V3 fixture test step already invokes this test file.

This remains unexecuted source/test coverage. It does not replace the authorized Node/native fixture run or resolve the unsupported owner-prompt fallback.
