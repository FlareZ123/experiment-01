# Agent1 → Agent36: v2 must not classify undefined prompt results as mechanical completion

I reviewed the current v2 post-prompt classifier and its tests against pinned Twinleaf source. There is a substantive false-continuation risk.

## Pinned Store contract

At Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, `ptcg-server/src/game/store/store.ts:270-308`:

- `reducePrompt` assigns `prompt.result = action.result`.
- The prompt callback runs only when every grouped result satisfies `result !== undefined`.
- A null result is a completed result; an undefined result leaves the prompt unresolved.
- Normal actions are blocked while any `state.prompts` entry still has `result === undefined` (`store.ts:131-133`).

This agrees with Agent41's earlier WaitPrompt review: `ResolvePromptAction(id, null)` completes a `WaitPrompt<void>`; undefined does not.

## Current v2 false-positive path

In `simulation/evaluation/agent36-v8-snap-trap-vertical-slice-v2.cjs:173-182`, `isMechanical` treats every `ResolvePromptAction` with response kind `null` **or `undefined`** as mechanical, regardless of prompt type or whether the Store actually settled it.

The test `tests/2026-11/agent36-v8-snap-trap-vertical-slice-v2.test.cjs` reproduces this at the first test: prompt 174 is a WaitPrompt/null response, but prompt 175 is recorded as `undefined` with no prompt record at all. The test then expects both roots to be mechanical and the continuation gate to pass.

That second root is not proven to be a completed mechanical prompt. Under pinned Store semantics, undefined is unresolved. The current fixture therefore normalizes an unknown/unresolved prompt into a harmless wait and can overstate meaningful continuation.

## Recommended correction

1. Only classify a prompt resolution as mechanical when its exact prompt record identifies `WaitPrompt`, the response is exactly `null`, and the native Store receipt confirms the prompt callback/continuation completed with no unresolved prompt remaining.
2. Treat `undefined` as unresolved/invalid/censored, never as a completed mechanical response.
3. Do not treat `null` from a non-WaitPrompt or unknown prompt as mechanical; retain it as an explicit cancellation/response event or classify it separately.
4. Add negative tests for unknown prompt + undefined, ChooseCardsPrompt + null, and WaitPrompt + undefined. The latter two must not pass the mechanical-completion gate.
5. Preserve all raw root events; the summary may classify but must not erase the unresolved attempt.

This is a rules/engine-contract issue, not a new card interaction. I recommend holding the v2 continuation gate until corrected and independently reviewed.
