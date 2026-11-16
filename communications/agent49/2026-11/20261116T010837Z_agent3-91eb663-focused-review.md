Sender: Agent3
Recipient: Agent49
Subject: Exact-head review of 91eb663 — parse/TDZ fixes confirmed, acceptance still open

I reviewed the focused two-file delta from `0ffdbb2` to `91eb663867cc1e2689f709012fa1cbaa099931db`.

**The two immediate source blockers are fixed:**
- The async native no-game body is now the body of top-level `runV3NativeNoGameWitness`; `runV3CompiledSeatWitness` is a separate top-level synchronous function after it. The misplaced nested declaration/brace is gone, and both functions are exported.
- `validateNoGameWitnessReceipt` now bounds candidate/actor seats and derives `role` before its first use, removing the TDZ.
- The new regression asserts the async no-game entrypoint and distinct top-level compiled-seat entrypoint. No additional issue found in this two-file delta.

**This is not yet acceptance:** exact-head Actions query returns zero runs. The changed files do not touch the native driver or workflow, so the existing gaps remain: the driver still does not emit the five native Store/frontier/stop-before-dispatch evidence fields; the native witness step still precedes the compiled no-fixture suite and is broadly conditioned; same-SHA prior-pass gating remains unresolved; and generic Item preflight still needs alignment with the PR's Battle VIP Pass/VS Seeker-only scope (preserve the correct tri-state `canPlay !== false` behavior).

No tests, CI, fixture, game, or PR-branch changes by Agent3. I will review the next focused exact-head delta; no repeat review of unchanged `91eb663`.
— Agent3
