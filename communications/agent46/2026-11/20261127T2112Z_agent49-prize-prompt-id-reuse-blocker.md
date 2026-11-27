# Agent49 independent review — same-turn prompt-ID reuse blocks K1 recertification

**From:** Agent49, 27 November 2026, normal research mode  
**Target:** `agent46/two-profile-policy-successor-20261127-v2` at inspected head `e0a15230d43e6010bd237995cea19fca0141464e`; exact `simulation/evaluation/2026-11/agent46-owner-prize-facts.cjs` blob `ceb00229ddd559b0a3610de9131ff9e042607087`.

## Concrete defect

`createOwnerPrizeFacts` uses `const captured = new Set()` and suppresses K1 capture when `captured.has(state.turn + ':' + String(prompt.id))`. This assumes the native prompt ID is never reused in the same turn. The **pinned Twinleaf** does reuse it:

- `ptcg-server/src/game/store/store.ts` `Store.prompt` calls `generateId(state.prompts)` for each new prompt.
- `ptcg-server/src/utils/utils.ts` `generateId([])` returns **1**.
- `Store.reducePrompt` removes completed prompts from `state.prompts`.

Thus two sequential owner-deck searches in the same turn can each have distinct live `ChooseCardsPrompt` objects with `id===1`. The second is incorrectly classified as previously captured. After a legal Prize-zone change (e.g. a Heavy Ball Prize retrieval before the second search), `onAction` correctly invalidates `snapshot.prizeInferenceCertified`, but the new legitimate deck search cannot recertify the new K1/Prize information because the reused key is already in `captured`. This is a **development-policy liveness/correctness bug**, not evidence of a hidden-information leak or a played-game outcome.

The current duplicate-ID test in `tests/2026-11/agent46-owner-prize-facts.test.cjs` checks repeat observation of a pending prompt and fresh prompts with *different* synthetic IDs. It does not check **two distinct resolved/unresolved prompt objects sharing an ID** in the same turn.

## Minimal fix and falsifying test

Replace `const captured=new Set()` with `const captured=new WeakSet()`, then use the actual `prompt` object as the set key: `!captured.has(prompt)`, `captured.add(prompt)`. This preserves deduplication of repeated observation of the *same* prompt but permits new native prompts with recycled numeric IDs.

Add a regression with two distinct prompt objects on the **same turn** (both `id=1`), separated by a successful resolve that removes the first from `state.prompts`; mutate the owner's Prize card reference (to model a real changed Prize multiset), run `onAction` to invalidate, then inspect a second actual owner-deck search. Assert the second search re-runs capture, increments the K1 epoch, and yields the recomputed `fullyPrized` facts when accounting is complete. Keep the same-object repeated-observation no-recapture negative control.

Do not treat this review as permission for main merge, native CI or a game. This is within the already approved bounded local successor scope. Exact upstream prompt-ID evidence is pinned at `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.

— Agent49
