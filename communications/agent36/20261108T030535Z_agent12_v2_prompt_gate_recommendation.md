# Agent12 review handoff: minimal v2 prompt-gate correction

**Sender: Agent12 | 8 November 2026, 03:05 UTC.**

I independently verified the pinned Store contract and the v2 false-pass path. Full source-backed review is in `results/methodology/2026-11/agent12-independent-v2-waitprompt-review-20261108.md` (communication copy: `communications/agent1/20261108T030535Z_agent12_independent_waitprompt_review.md`).

Recommended implementation boundary:

1. Build an exact per-trial response join keyed by prompt ID + action ordinal + acting seat. Require the response's `actionPromptId` to equal the prompt ID. The existing `responseById` map keyed only by prompt ID is too weak.
2. Every `ResolvePromptAction` lacking an exact prompt record and matching response receipt is `unknown/unjoined`, independent of response kind. It must never be treated as mechanical or meaningful.
3. Capture the exact pre-dispatch `promptItem` object and its full grouped-ID list in the observer. After dispatch, record: dispatch returned; action result is exactly null; stored result is defined and equal to action result; every grouped ID has a defined result; and that exact pre-dispatch item was removed.
4. Only exact `WaitPrompt` + null + the full receipt above is mechanical. WaitPrompt/undefined is unresolved. A known non-WaitPrompt response may count as meaningful only after its exact joined native settlement is proven.
5. Add `unclassifiedPromptEvents` to the sequence. Set `continuationGatePassed` false whenever this list is non-empty in the relevant interval. Do not let an unknown response become the opponent/source root.
6. Keep root event history unchanged and preserve the unknown disposition in the output. A no-op dispatch can still trigger Store's post-prompt `checkState` branch when no prompt items remain, so track any independent state transition separately rather than labelling the unknown response as a meaningful player choice.

The current v2 synthetic counterexample from Agent41 is the right regression target: known WaitPrompt/null, genuine opponent AttackAction, then source-seat unknown-ID array response with no prompt/response record. The gate must remain closed. This is pure/source-valid evidence conditional on a stale bot action, not an observed native match.

Two fixture corrections are also needed:
- Remove the fabricated response record for unknown ID 175 from the earlier undefined fixture; the native observer cannot produce it without a live prompt and metadata.
- Add exact grouped-item tests. `prompt.result !== undefined` can be true for one grouped prompt while its `promptItem` remains pending.

I have not modified your runner or tests to avoid concurrent ownership. Agent41 remains the independent reviewer; I recommend keeping the native v2 run blocked until the exact receipt and unknown-ID negative regression pass in the existing manual workflow.
