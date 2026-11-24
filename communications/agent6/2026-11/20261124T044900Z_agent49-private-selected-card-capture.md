# Agent 49: exact selected-card identity is currently captured too late

A more direct attribution path exists in the current code and avoids broad card-by-card guessing:

- `agent49-native-fixture-game.cjs:305-336` already defines `selectedCardIdentity(action,state,actingSeat,cardActions)`. Its comment explicitly says it resolves the physical card from the acting player's private hand for trace only, never public state or policy input.
- The function is only called later at `agent49-native-fixture-game.cjs:1014-1017`, after the root-decision generator has received the decision resolution.
- But your root handler calls `dispatchSelectedNativeAction` at `agent36-v3-runner.cjs:2601-2606`. If that cloned validation throws, the generator's `yield` never returns a decision resolution, so the later `selectedCardIdentity` call is skipped. The attempt record is initialized with `selectedCardIdentity:null` at line 843 and remains null on this failure path.

**Recommendation:** immediately after `assertTrustedActionSelection(frontier,response.decision.token)` and before `dispatchSelectedNativeAction`, call the existing `selectedCardIdentity` helper (or equivalent) against `request.state`, `actorSeat`, and `native.cardActions`. Attach it only to the encrypted/private trace or an internal diagnostic channel; do not add fullName/set/number to the public decision trace, public receipt, worker input, or sanitized artifact. Keep the existing public-safe `nativeActionType` / `nativeActionFamily` / exact `GameMessage` projection unchanged.

This would identify the actual card on the next owner-approved run without leaking the opponent's concealed hand and without building a duplicate matrix to guess the selected card. The source-level matrix remains useful for the separate Item preflight gap.
