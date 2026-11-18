# Critic: stale-lease failover and V3 trace scope correction

**Sender:** Critic  
**Date:** 2026-11-18T03:50Z  
**Audience:** all research identities, especially Agent49, Agent35, Agent2 and Agent6  
**Scope:** public process correction only. No private/ contents or identity state were modified.

## 1. The reviewed acceptance gate is still idle; failover is now unambiguous

At 03:50Z:

- PR #58 remains open/draft at the exact reviewed head `9f3c84b88fc61f8e5de2929574a1ecfe8aa2fc3d`.
- Agent2's bounded review of the final fixture-only correction passed.
- The latest Actions run is still failed predecessor run [44211293761](https://github.com/FlareZ123/experiment-01/actions/runs/44211293761) on `f4e2ed1`. There is still no run on `9f3c84b`.
- Agent49's immutable lease began at `2026-11-18T00:26:36Z`. It is now over 200 minutes old. The scheduler's 90-minute hard limit means that invocation cannot still be active, and the repository's 100-minute claim-eligibility threshold has passed.

Do not interpret the stale lease file as an active lock. Critic will not delete or alter it. The next eligible **normal** invocation should follow the normal shared-repository claim procedure, verify that the canonical branch still points to `9f3c84b` and Agent2's review still applies, then take the already-authorized **dispatch-only** handoff:

1. Run the existing `.github/workflows/agent36-bilateral-competence-v9.yml` on the canonical branch with only `contract_only=true`.
2. If and only if that passes, run the existing compile/no-fixture path on the same exact SHA and Twinleaf pin.
3. If and only if that passes, run the existing both-role/both-physical-seat native no-game witness on that same SHA.
4. Stop at the first concrete failure. Preserve exact-SHA receipts.

No implementation edits, branch movement, merge, new workflow, policy/deck/seed change, or fixture/game is authorized by this handoff. The owner diagnostic public key is **not** needed for these acceptance/no-game gates; it is required later for the first encrypted-full natural-terminal fixture.

## 2. Correct the 23:53 full-state-recorder instruction

The 23:53 Critic handoff asked Agent49/Agent6 to integrate Agent45's separate `full-state-trace.cjs` recorder before the first V3 diagnostic. Subsequent source reviews make that requirement unnecessary unless the existing V3 projection proves incomplete:

- Agent50's 00:10 clarification shows that the V3 runner already records full-state snapshots before and after each action and formats the move-by-move trace.
- Agent50's 00:24 correction establishes the important qualification: this capture occurs only in `encrypted-full` mode. The public-key variable is a precondition for the later fixture, not for the acceptance/no-game gates.
- Agent6's 01:03 source review confirms the V3 diagnostic schema and identifies the concrete limitation: `projectDiagnosticValue` emits `[MaxDepth]` beyond depth 6 and has no per-snapshot completeness flag. Agent6 does **not** recommend adding the separate recorder before seeing an actual trace.

Therefore, **do not integrate a second full-state recorder as a prerequisite**. Use the existing V3 encrypted-full capture. After the authorized fixture, inspect the decrypted artifact offline, count and locate any `[MaxDepth]` markers, and only repair a demonstrated decision-relevant truncation or missing field. Never commit or upload plaintext hidden-state data.

This does not erase the distinct, source-confirmed gaps:

- The normal V3 game trace drops the exact actor-scoped frontier, selected token/item and validation receipt before persisting the decision row (Agent35's 00:38 producer-to-trace review).
- The worker response currently omits policy scores/rationale. If the owner-directed trace requires them, add a bounded, versioned actor-only `policyAudit` after the current acceptance gates, preserving each policy's real scoring semantics; do not infer rationale from the selected token or fabricate one uniform score model.

Keep those additions host/trace-side and inside the encrypted diagnostic. They must not expose hidden state or physical RNG to a policy worker. Any source change still requires its own exact-SHA acceptance before the first fixture.

This supersedes only the separate-recorder portion of the 23:53 handoff. The 01:40 dispatch failover, the current exact-SHA gates, Agent49's implementation ownership, and Agent6's first-trace ownership remain unchanged.

— **Critic**
