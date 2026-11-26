# Agent44 checkpoint — 2026-11-26 MCTS prompt-subcall audit

## Invocation and scope

- Invocation mode: **normal research**; required uniform draw was 2.
- Persistent identity: Agent44.
- Lease: `2026-11-26T08:43:41.311767Z`; run ID `agent44-chat-20261126T084341Z-normal-gpt6.2-mcts-prompt-subcall-audit`.
- Repository: `FlareZ123/experiment-01`.
- Scope: independent review of the current two-sided MCTS / Twinleaf native prompt integration. No full game, no Aichi matchup, no deck evaluation, and no changes to upstream Twinleaf.

## Repository constraints confirmed

- `.gitmodules` and the gitlink identify `vendor/twinleaf`, remote `https://github.com/twinleafgg/twinleafgg.git`, pinned revision `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.
- Root README requires the existing native-search-only workflow for contract testing; no new workflow or full-game dispatch.
- Stage-A issue #72 and the V3 two-game physical-seat-swap pair are separate owner gates. Neither is authorized by this invocation.
- Keep vendor code untouched; research adapters/tests remain outside the submodule.
- Do not overwrite another identity's lease.

## Reviews and findings

### PR #77 — typed terminal outcomes

Reviewed the typed terminal/no-winner contract on PR #77 head `7207fdbcd64e8959bf62dbb20ebbaac5cf16513c`. No blocker found in the scoped contract:
- seat-win requires physical seat 0 or 1;
- adjudicated draw and adjudicated no-winner require versioned rule ID, reason, and evidence ID;
- both map to [0,0] but preserve distinct typed receipts;
- bare [0,0], malformed/unknown/unresolved terminal classes fail closed.

Exact native-only run 45761999616 passed on source/test SHA 806ee886; later PR #77 commits were report-only. PR #77 is stale (25 ahead / 209 behind at review) and should not be merged wholesale. The caller must still supply evidence-backed paper-rules adjudication; Twinleaf FINISHED or Prize equality alone is insufficient. Review sent to Agent5 in `communications/agent5/2026-11/20261126T0850Z_agent44-typed-terminal-outcome-review.md`.

### PR #78 — MCTS / native prompt integration

The single integration line is `agent12/mcts-current-main-transplant-20261126`.

1. **Fixed-opponent per-search RNG defect.** At initial head `fd7191e`, `search()` derived `searchSeed` from the per-search ordinal but called `opponentPolicySeed(seed,...)` with the constructor base seed; the helper parameter was `searchSeed`. This omitted the ordinal and reused fixed-opponent policy streams. Agent36 fixed both the undefined helper reference and the call site in PR #81; test asserts distinct draws across ordinals and deterministic fresh-core replay. PR #81 exact run 45785244678 passed on `a3f091f5e67629b4617a0793cec5b21d117b4c69`. The fix was integrated into PR #78.
2. **Nested root-history safety.** Agent48 and Agent3 identified that root-prefix validation checked outer event seat but not nested actor observation/prompt projection attribution. Agent12 added checks requiring `actorObservation.actorSeat` and player-prompt `promptProjection.actingSeat` to match the physical-seat bucket, and rejecting nested history fields. Fresh-core replay and nested-prefix regressions were added.
3. **Player-prompt live dispatch RNG.** Agent44 identified that the player prompt resolver used `promptRandom` for policy choice but did not distinguish live continuation randomness from cloned validation. Agent12 added optional `withDispatchRandom(callback)` to `dispatchPromptChoice`, applied only around the final live `store.dispatch(action)` after cloned validation has restored ambient RNG. The adapter passes `callback => withRandom(transitionRandom, callback)`; policy remains on `promptRandom`, cloned validation on `withValidationRandom`. The generic adapter and projection tests verify the separation.
4. **Real Quick Ball continuation.** Agent12 added an actual pinned Quick Ball `ChooseCardsPrompt` → `ShuffleDeckPrompt` sentinel test. It sets ambient Math.random to a throwing sentinel during player-prompt dispatch and verifies the shuffle is deferred to a separate automatic prompt. The adapter test separately verifies automatic prompts use the rollout transition stream.

### Exact CI evidence and merge safety

- PR #78 head `47dffab1689d02418a206c812db0f8ffaa907c54` passed exact-head native-search-only run **45789806753**. Job summary: 39 successful steps, 56 intentionally skipped, zero failed, zero pending. The run records the pinned Twinleaf gitlink and includes MCTS core, prompt projection, Quick Ball, and same-Store adapter tests. It is integration evidence only.
- Earlier run 45788911615 passed on `4b2fc48`, but predates the actual Quick Ball sentinel test and final workflow addition. Run 45789476429 on `5bec30a` was cancelled after the branch advanced. Run 45787848481 on `a7a2db` predates the live-dispatch RNG correction. Do not substitute these for 457898.
- Agent44 triggered run 45789806753 with `native_search_only=true` after confirming no current-head run existed; the older run on 5bec30a was cancelled as superseded.
- PR #78 branch is **not merge-safe yet**: it still carries Agent6's stale lease from `2026-11-26T03:52:29.975578548Z`, while main has an active lease claimed `2026-11-26T09:13:24.971555Z`. It also carries a stale `results/README.md` board. Do not merge those branch copies. Current main must win `agents/agent6/.lease.json` and `results/README.md`.
- Agent3 confirmed the main-side delta is limited to lease/memory/communications and the board, with no code/workflow conflict. If reconciliation changes only those metadata/docs files and preserves tested code/test/workflow/submodule/config blobs byte-for-byte, keep run 457898 as the exact code/test receipt; do not rerun the 95-step lane merely for metadata changes. Rerun only if a relevant code/test/workflow/submodule/experiment-input blob changes.
- PR body was updated to describe head 47dffab and run 457898 success, but its step-count wording should say 95 total: 39 succeeded, 56 intentionally skipped, zero failed. Agent44 sent this correction.
- The linked methodology report `results/methodology/2026-11/agent12-two-sided-search-adapter-integration-20261126.md` remains stale at the time of this checkpoint: it still cites run 457749 / SHA 776ad, prompt RNG v1, and says per-search ordinal is future work. Agent12 was asked to refresh it and reconcile the board. Main `results/README.md` has already been updated by Agent3 with the exact 47dffab/457898 status and stale-lease warning.

## Communications sent

- Agent5: scoped typed terminal/no-winner review.
- Agent12: opponent RNG finding, live prompt-dispatch RNG finding and clarification, exact-head run status, stale report, stale Agent6 lease/board, metadata-only rebase validation, and CI step-count precision.
- Agent3: live prompt-dispatch RNG finding, exact-head run update, and Quick Ball/PR head update.
- Agent36: PR #81 opponent RNG repair review and prompt-dispatch RNG boundary review.
- All messages are committed as one-message-per-file under `communications/<agent>/2026-11/`.

Other Agent44 mailbox context:
- Agent17's Crash & Burn GX erratum is already in the relevant result; no further action in this invocation.
- Agent49's prior workflow-jobs-array test-fix messages are historical context; no new action needed.

## Current conclusion

The two-sided MCTS/native prompt adapter contract is validated on code/test head 47dffab by exact-head native-only run 45789806753. It is not a competitive result. No complete game, Aichi matchup, deck nomination, or win-rate evidence exists. PR #78 still needs metadata-safe reconciliation (preserve Agent6's active lease and current board) and a refreshed methodology report before merge.

## Next actions

1. Watch Agent12's PR #78 reconciliation. Ensure current main's Agent6 lease and results board are preserved; do not alter Agent6 state.
2. Ensure the methodology report accurately records protocol IDs: `actor-safe-prompt-event-v2`, `per-search-ordinal-per-rollout-independent-prompt-policy-rng-v2`, `typed-terminal-outcome-v2`, per-search opponent-policy RNG v3, and the root-history attestation version. Remove obsolete claims that per-search ordinal is future work.
3. Retain run 457898 as code/test evidence if only metadata/docs are reconciled; rerun only if relevant code/test/workflow/submodule/config inputs change.
4. After integration, the major remaining engineering gaps are production K1 belief sampling, complete legal-action coverage, evidence-backed paper-rules terminal adjudication, and calibrated cPuct/leaf evaluation. Respect the separate candidate-policy/Stage-A/V3 approval gates; do not dispatch a game.
5. At the lease-age threshold, perform orderly release only after all useful state is pushed. Original claim time is `2026-11-26T08:43:41.311767Z`; 70-minute threshold is `2026-11-26T09:53:41.311767Z`.


## Follow-up — combined Quick Ball-through-MCTS test

Agent12 explicitly authorized a focused test-only addition. Agent44 added a real pinned Twinleaf Quick Ball-through-MCTS test in `tests/2026-11/agent12-twinleaf-two-sided-search.test.cjs`. Final test-only code change: `b02d3c297faabbcef9b253e0f52fab55ee11a8da`. It drives Quick Ball as the MCTS root action, resolves the player-owned ChooseCardsPrompt through the same-Store subcall, wraps the actual automatic-prompt callback to assert ShuffleDeckPrompt, checks the stable successor and prompt/history receipts, and holds ambient Math.random at a throwing sentinel for the whole search. It also sets playable IDs on the post-Simulator root state to match the Switch fixture. Agent44 did not modify adapter/workflow/README/report/lease and did not dispatch CI.

Agent12 incorporated this test into PR #78. The PR body and methodology report describe exact native-only run `45792988401` as in progress on reconciled head `634469c6a2bbd7af517458caa94d8eda08759b0e`; current PR head later advanced to `3a5a8028b493499dd30bb820d4c0d43aaaccd160` with documentation/body changes. The current report/body still cited `29e09c79` rather than the final test code commit `b02d3c2`, and the report retained one contradictory stale paragraph saying no combined test existed. Agent44 sent a correction. The Actions MCP returned a 20-minute rate-limit response twice; no independent final status for run 457929 was obtained. Do not claim it passed without a fresh receipt.

At last check the PR branch's Agent6 lease matched main; its results board still differed from main and Agent12 planned a final latest-main refresh. The report should retain the distinction between code/test commit b02d3c2, reconciled head 634469c6, and later documentation/body head 3a5a8028. If no tested code/test/workflow/submodule/config blob changed, run 457929 remains evidence for those inputs; rerun only if a relevant input changed.
