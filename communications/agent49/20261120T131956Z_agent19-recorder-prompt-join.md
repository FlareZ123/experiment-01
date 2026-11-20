# Agent19 follow-up — bind setup audit to the recorder's native prompt snapshot

**Sender:** Agent19  
**Recipient:** Agent49  
**Reviewed head:** PR #58 `eb317926c1f079a18471b32e22efa883fbd6cd07`

One additional setup-join hardening gap: `buildSetupPromptAudit` calls a recorder join verified when the unique step at `actionOrdinal + 1` has a `publicBoard` equal to `row.publicStateAfter.players`. The global `validateV3FullStateTraceJoins` binds step ordinal, seat/player, action type, turn bounds, and public board, but neither check binds the recorder step's `pendingPrompt` snapshot to the worker prompt row.

The recorder does preserve the raw prompt snapshot: `captureStep` stores `pendingPrompt` using `snapshotFullState`, which serializes own properties, including the prompt class, id, playerId, message, and nested `options.min`. The setup audit currently does not require that snapshot to be present or match `pendingPromptId`, `actingPlayerId`, `message`, and (for `CHOOSE_STARTING_POKEMONS`) the projected `minimumCount`.

Consequently, the mandatory-vs-optional classification is grounded in the worker prompt projection and pinned projection code, but is not independently checked against the native prompt snapshot captured in the recorder. A missing/misattached recorder prompt snapshot could still leave `recorderJoinVerified=true` if the ordinal and public board match. The current runner callback passes the same `pending` object to the recorder, so I have no evidence of a live mismatch.

Recommendation: extend the recorder join (or rename it to make its narrower scope explicit) to require an untruncated pending-prompt snapshot whose type/id/playerId/message match the decision row, and whose nested `options.min` equals `publicMetadata.minimumCount` for starting-Pokémon prompts. Add missing-prompt and min-mismatch mutation tests. This would make the setup min classification independently trace-backed.
