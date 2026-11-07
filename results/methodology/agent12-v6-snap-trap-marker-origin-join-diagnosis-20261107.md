# v6 Snap Trap prompt marker-origin join diagnosis

**Agent 12 | 7 November 2026 | pinned-source investigation**

## Result

The v6 diagnostic completed eight native attempts and preserved an artifact, but it did not prove the source-to-live-prompt join.

- Run: https://github.com/FlareZ123/experiment-01/actions/runs/42395677161
- Head: `b65486cdebfe50467f69b17d602e820541e290f9`
- Artifact ID: `13582543933`
- Artifact JSON SHA-256: `cf3e288a5e226d08f7a9c0e03e87227242b23a8caf0b0dc8c1a93a5145c72db5`
- Artifact ZIP SHA-256: `1ef0aa6a19ed0b05566e24b85efb0b753029e297ff45de06181efee076317d0f`
- Pure tests: **78/78 passed**
- Native attempts: **8**
- Quarantine records: **1**
- Exact source prompts stamped by the reducer marker: **1**
- Live Store prompt events: **1**
- Marker blocked-prompt origin events: **0**
- Pending native prompt ID: **null**
- Prompt events joined by ID: **0**
- Selection: `FALLBACK_CAPTURED_PROMPT_EVENT_MISSING`

The observer and source reducer both see the event, but the marker does not associate the source prompt object with the live prompt ID. No Snap Trap source/zone proof or competitively qualified game exists from this run.

## Pinned source facts

Twinleaf is pinned at `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.

1. `ptcg-server/src/simple-bot/simple-tactics-ai.ts:23` declares `SimpleTacticsAi.decodeNextAction(state: State)`.
2. `ptcg-server/src/game/store/store.ts:206-235` declares `Store.prompt(state, prompts, then)`. It synchronously:
   - generates an ID and assigns `prompts[i].id`;
   - pushes that same prompt object into `state.prompts`;
   - stamps trainer prompt metadata;
   - returns the State.
3. The v10b paired runner calls `runDevelopment` with actor composition, source-independent policy, native accepted targets, setup receipts and registered trials. It does not pass `nativeActionInputWitness` or `nativeOpponentHiddenReadAudit`.
4. In `agent41-bilateral-v2-development.cjs`, both flags default to `false`; the code that loads/wraps `SimpleTacticsAi` is gated behind these flags (around lines 705-724).

## Most likely failure mechanism

The Agent10 source marker captures the exact prompt inside `GalarianStunfisk.reduceEffect` and stamps the prompt object in a WeakMap. It currently obtains `pendingNativePromptId` by wrapping `SimpleTacticsAi.decodeNextAction` and finding that object in `state.prompts`.

The v10b runner does not enable the optional paths that load/use the wrapped `SimpleTacticsAi`. Consequently, the marker can record the exact source prompt at `Store.prompt`, while its decoder wrapper never runs to promote that object to a blocked-prompt origin with an ID. This matches the observed `exactSourcePromptCount=1`, `livePromptEventCount=1`, `markerOriginCount=0`, and `pendingNativePromptId=null`.

This is a pinned-source explanation of the marker's instrumentation path, not a new game-rule conclusion.

## Recommended correction

Capture the native prompt ID in the source marker's existing `Store.prompt` proxy:

1. Preserve the pre-call prompt ID and player ID separately.
2. Call the original `targetStore.prompt(nextState, prompt, callback)`.
3. After the call returns, read the same `prompt.id` from the same prompt object. The pinned Store implementation assigns it synchronously before returning.
4. Stamp `pendingNativePromptId = String(prompt.id)` and the post-call player/prompt identity into the origin record.
5. Keep the quarantine record as separate evidence that the owner policy reached the blocked prompt. Do not fabricate a decoder event or silently treat source stamping alone as a successful quarantine join.
6. Join the source origin and v6 observer event by the same post-Store.prompt ID, then rerun pure tests and a fresh registered phase-A run.

This avoids making the source marker depend on an optional AI decoder hook. The observer already captures the post-call ID, and the pinned Store method establishes that it is synchronously assigned to the same prompt object.

## Scope

- The v6 run does not establish Snap Trap attribution despite the exact source prompt being stamped.
- It does not authorize a resolver change or count as a competitive game.
- The previous v3 run's public attached-Energy zone evidence remains useful but had the separate reducer argument-index mismatch.
- The next source of truth should be a fresh, versioned run after the marker's direct Store.prompt ID join passes its pure tests.
