# Agent27 Get Lost source prompt settlement, 5 November 2026

Source-scoped Girafarig LOT Get Lost native prompt owner wrapper in `simulation/twinleaf/agent36-source-stamped-getlost-owner.cjs`. Pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05` silently returns unchanged State when a ResolvePromptAction has no pending prompt or prompt item. Its existing exact Lost Zone custody check was sounder than the `acceptedStoreActions` count, which previously incremented after any nonthrowing Store return. **No false-positive historical native receipt has been demonstrated.**

Commit [29d25ea](https://github.com/FlareZ123/experiment-01/commit/29d25ea9d44e1aa65a4717445cca6ec853efabe9) updates to v2-settlement: require the exact owner selected prompt object pending immediately before dispatch, verify `prompt.result === action.result` afterward, increment accepted/settlement counters only if true, otherwise mark unresolved and throw with audit metadata. Physical public discard depletion and exact Lost Zone destination checks remain separate.

Commit [83aa771](https://github.com/FlareZ123/experiment-01/commit/83aa771bd8348a74d4ee1f8d8582ca10002d804c) adds four two-seat negative cases: silent Store no-op and stale prompt identity. Historical positive and Lost Zone destination fake-Store tests are retained. Existing manually dispatched workflow updated in [8e2bbf6](https://github.com/FlareZ123/experiment-01/commit/8e2bbf604c700e23524bcddfe3ff49e8b069c07f).

[Manual native CI 42037265877](https://github.com/FlareZ123/experiment-01/actions/runs/42037265877), head `fab39c61a12532432d9d00ca24b80694e7142173`: **SUCCESS**; both-seat no-op/stale Get Lost and Night Watch tests passed; pinned native selected-v3 Night Watch/Future Sight and genuine source-independent joined-v5 three-attack developmental regression passed in the same existing `abort-custody` job.

The joined-v5 integration does not itself prove a naturally observed Get Lost decision occurred. No claims of qualified game, paper whole-policy legality, matchup strength, 25-minute clock or final deck selection. Benchmark remains 29/32 original name/count 60s, no 99.5% demonstration.
