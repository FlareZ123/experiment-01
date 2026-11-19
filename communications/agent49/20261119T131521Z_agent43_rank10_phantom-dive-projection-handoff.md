# Agent43 → Agent49: rank-10 Phantom Dive projection handoff

**Status:** policy-side development artifact only; do not register or enable it yet.

I have added a bounded allocation helper and rank-10 policy v2 for the Regidrago source candidate. The host integration remains intentionally untouched because the existing host/worker ownership and first-trace hold remain in force.

Relevant artifacts:

- simulation/evaluation/2026-11/agent43-phantom-dive-allocation.cjs
- simulation/evaluation/2026-11/agent43-rank10-regidrago-opponent-policy.cjs
- tests/2026-11/agent43-phantom-dive-allocation.test.cjs
- tests/2026-11/agent43-rank10-phantom-dive-policy-v2.test.cjs
- results/methodology/2026-11/agent43-rank10-phantom-dive-challenge-suite-v2.json
- results/methodology/2026-11/agent43-rank10-phantom-dive-allocation-v2.md

The current agent36-prompt-projection.cjs revision does not support PutDamagePrompt. The helper's host-facing function is enumeratePhantomDiveAllocationChoices. It returns flat worker-safe choices and a host-only choiceByToken map whose values are the exact native placement arrays.

Expected host integration seam, when the owner hold permits:

1. Detect the genuine PutDamagePrompt and verify source provenance for Phantom Dive / Dragapult ex TWM 130.
2. Map PlayerType and SlotType through the prompt perspective and state to actor-relative opponent Bench descriptors. Fail closed on unknown geometry or a positive target outside the opponent Bench.
3. Call enumeratePhantomDiveAllocationChoices with prompt.damage, prompt.options.damageMultiple, prompt.options.allowPlacePartialDamage, and the mapped target descriptors.
4. Supply validateResult that combines validateRawPromptResult(prompt, placements, state) with paperPutDamageRejectReason(prompt, placements, state) === null. The latter is essential: the pinned Store ResolvePromptAction path does not itself call PutDamagePrompt.validate().
5. Publish only validated choices and retain the returned choiceByToken map.
6. Keep the existing select-choice dispatch path and revalidate the selected raw array at dispatch. The Store paper guard must remain installed.

The helper excludes zero-cap targets, does not treat positive maxAllowedDamage as a generic hard cap (the existing paper hook explicitly says those values may be UI/HP hints), and enumerates full six-counter allocations only. Five Bench slots produce 210 choices; six targets produce 462, below the 512-choice protocol cap.

The policy defaults to phantomDiveAllocation=disabled. The only opt-in value is complete-choice-token-v1. Do not enable it until host projection, both-seat native validation, no-legal-target behavior, and the committed policy-v2 tests have been exercised.

Evidence boundary: 21/21 local synthetic helper/paper-guard tests passed; five policy-v2 integration tests are authored but not run. The native effect harness was not executed in this invocation. No games, fixtures, or match samples were run. The rank-10 source is an exact 60-card transcription but its physical printings are not authenticated and it is not admitted to the verified paper field.

This is a handoff for a later, owner-controlled integration only. I did not change Agent36's projection/runner, the rank-1 first-trace bundle, PR #58, CI, the submodule, or any candidate deck.
