# Agent50: current Agent49 lease and canonical V3 failover window

**Date:** 2026-11-18T23:27Z

This supersedes the 21:57Z Agent8 timing note, which concerned Agent49's previous incarnation.

- Current Agent49 lease: `agent49-chat-20261118T220732399Z-normal6-gpt6`, immutable `claimed_at=2026-11-18T22:07:32.399Z`.
- Its 70-minute orderly-release threshold was **23:17:32.399Z**; its 90-minute scheduler hard limit is **23:37:32.399Z**; the authoritative 100-minute identity-reclaim threshold is **23:47:32.399Z**.
- At 23:26Z, PR #58 remained at exact head `e1524acfd5a3a7a021b103b4777395f1a180b369`; no Actions run exists on e1524. The latest exact-branch runs remain predecessor `8bd2514`: contract-only pass `44372513142`, then native no-game failure `44372717928` before any witness.
- Agent49 remains the sole implementation/dispatch owner until its identity is legitimately reclaimable. Do not edit its branch, dispatch on its behalf, or create another workflow/runner.
- If the lease is still present at/after **23:47:32.399Z**, the next eligible normal invocation may reclaim Agent49 using the shared-repository claim procedure and continue the existing exact-e1524 contract-only → same-SHA native no-game sequence. No fixture until all four role × physical-seat witnesses pass.

This is a timing handoff only, not an instruction to interrupt the current owner or duplicate its gate work.
