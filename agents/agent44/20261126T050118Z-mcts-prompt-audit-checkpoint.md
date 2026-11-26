# Agent44 checkpoint — MCTS prompt-subcall review

**Mode:** normal research (first-action CSPRNG draw 1).  
**Identity:** Agent44, claimed at `2026-11-26T04:54:33.392632000Z`; immutable 70-minute release threshold `2026-11-26T06:04:33.392632000Z`. Do not refresh.  
**Claim commit:** `5eef9cc35e5aa24a1c7148f7e97473ce960dc613` on `main`; lease read-back verified.  
**Repository:** `FlareZ123/experiment-01`; Twinleaf submodule `vendor/twinleaf`, URL `https://github.com/twinleafgg/twinleafgg.git`, pinned `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.

## Current objective truth

The decision board still reports no final fixed 60, 29/32 authenticated original Aichi lists (23/25/28 unavailable), 0/32 qualified competitive matchups, and no demonstrated 99.5% result. The owner-authorized primary challenge is an English paper-Expanded candidate versus the unchanged Japanese Extra Top32 lists. The registered V3 pair has no owner dispatch authorization; do not run games or alter its decks/policies/seed/seats/registration. Critic's 03:15Z direction is to converge on one existing trace-to-learning loop and stop parallel infrastructure growth.

## Work performed

- Read Agent44's prior memory and mailbox, the current decision board, relevant 26-Nov Critic broadcasts, Agent12's two-sided-search PR, Agent42's current prompt-subcall work, and the direct messages in Agent42's mailbox.
- PR #75 initially at `b57b1850f6ad31fddeed737413393b6486f0869d`; Agent1 then fixed the synthetic `mapSourceCard` callback signature / instance-ID mapping at `e768627a24dae7a1228e2bf5f6f6af02891eb458`, and moved the targeted pinned-Twinleaf MCTS test after compile at `2b469b8de9baa388e6acb9035ea9fa79d62e2f7f`. It remains a draft and diverged 51 ahead / 337 behind current main at the last exact compare; do not merge wholesale.
- **Prompt trace/history gap:** in `agent12-twinleaf-two-sided-search.cjs`, `settlePendingPrompts()` stores the return from `resolvePlayerPrompt()` in `resolution` but discards it after the sync/prompt-cleared checks. The MCTS core's `rolloutPaths` records selected tree action keys only; in same-Store-subcall mode prompt decisions are not tree nodes and therefore are absent from rollout paths and branch-local per-seat history. The Agent36 dispatcher can provide safe opaque `validationReceipt.selectedTokens`; never store `rawResult`, decoded native objects or hidden zones. Sent Agent42 the focused handoff `communications/agent42/2026-11/20261126T045737Z_agent44-prompt-rollout-trace-gap.md` (commit `b9700a38ff017a4d7e61192875675cda78eab69c`).
- Sent Agent1 the exact safe prompt-event source pointer `communications/agent1/2026-11/20261126T050049Z_agent44-prompt-event-ledger-source.md` (commit `bb562df1af88b0542c80e395ae5c05d33ce12f07`). Agent1 had already offered to own the separate per-State history ledger after Agent42 stabilizes the resolver interface.
- **Reproducibility manifest gap:** the adapter audit currently records only one candidate deck ID/seat, engine/rules IDs, enumerator cap/schema, knowledge protocol, prompt mode/subpolicy ID and counters; core audit records seed/budgets/root hash/search mode/opponent policy label/RNG protocol. It does not bind both physical-seat deck identities/fingerprints, sampler/prior, action prior, evaluator, candidate/opponent/prompt implementation hashes, actor-history protocol, research commit, or complete truncation/error dispositions. Sent Agent12 a narrow manifest-boundary handoff `communications/agent12/2026-11/20261126T045905Z_agent44-mcts-search-receipt-manifest-gap.md` (commit `3931a71ae6cb11d60b7c672c1737d3874e21876c`).
- Mainline currently contains `simulation/twinleaf/actor-history-projection.cjs`; its helper can include actor-visible logs and caller-maintained per-seat decision history, but the caller must guarantee completeness and copy the trace through determinization/transitions. Agent1 is handling that slice. Do not duplicate it.

## Existing blockers — do not repeat

Agent1/Agent5 have already identified: old non-injective MCTS canonicalizer vs main's strict canonicalizer; physical-seat decklist prior integration; same-Store prompt RNG coupled to transition RNG; missing Store continuation-queue drain assertion; Switch test at maxPlies=1 observes but does not expand successor; synthetic Quick Ball provenance test is not a pinned Quick Ball MCTS continuation; test 59 callback mismatch fixed at e768; pinned Switch test was skipped before compile and moved post-compile at 2b469. PR description/method note still need truthful status when the implementation stabilizes. Do not dispatch the broad workflow on stale branch content or create another workflow.

## Next useful action

Recheck the PR #75 branch head and Agent42/Agent1 messages after a short interval. Review only material new code on the exact head, especially whether prompt choices are recorded in branch-local per-seat history and rollout evidence, whether the Store's continuation registry is drained, whether prompt-policy randomness is isolated, and whether the pinned Switch/Quick Ball path actually expands the stable successor. Keep the review consolidated; no game dispatch, candidate change, statistical framework, new workflow, or status-only README churn. After every durable checkpoint, compare actual UTC clock to the original lease timestamp; continue below 70 minutes.
