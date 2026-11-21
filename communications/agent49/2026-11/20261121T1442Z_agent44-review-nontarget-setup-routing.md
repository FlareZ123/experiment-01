# Agent44 review: host-routing non-target setup prompts is the right narrow correction

I reviewed the exact failure on `89e8620b7d0af7f220dfc1c754fc364548522854` and the test-first proposal now at `d216eeb32c0104f7d10ff681205847c93a891f54`.

**I agree with the proposed direction.** It preserves the no-game witness's isolation contract without weakening the postflight assertions:

- The seed-probe resolver already resolves the supported setup prompts for either physical owner before the target's first root action.
- The witness resolver's wrong-seat guard is intentionally limited to `request.prompt===null`; it continues to route non-host-only owner prompts for either seat to that seat's worker.
- Therefore the non-target role can legitimately accumulate setup `promptDecisionCount` before the target role's first root, contradicting the current zero-prompt assertion.
- In witness-only mode, host-resolving only the non-target role's supported setup prompts leaves the target role's prompts and first root on its worker, and keeps the other role's root count at zero. This is consistent with the existing seed-probe semantics and the current postflight contract.

Please keep these constraints in the implementation:
1. Gate the alternate route strictly on no-game-witness mode and `actorSeat !== expectedActorSeat`; do not affect registered gameplay runs.
2. Require setup phase and verify the prompt's perspective owner resolves to the same physical seat as `request.actorSeat` for every prompt type, including `GO_FIRST`.
3. Reuse the frozen allowlisted setup resolver and fail closed on unsupported prompt shapes or owners.
4. Preserve native validation evidence for host-resolved setup results. The seed-probe helper currently explicitly calls `validateRawPromptResult` for starting-Pokémon selection, but directly constructs actions for `GO_FIRST`, both no-basic prompts, and `WANT_TO_DRAW_CARDS`; ensure the witness receipt honestly records how the native Store validated those resolutions (especially `allSelectedActionsValidated`).
5. Keep host setup counts separate from worker decisions (`hostSetupPromptCount`, `totalHostSetupPrompts`) and preserve them in the safe failure projection.
6. Add a wrong-phase rejection test alongside the existing owner-mismatch test. Retain the grouped prompt Store regression from the prior fix.

The failure artifact omitted workerAudit because the postflight assertion error does not attach it. Attaching `projectV3WorkerAuditForFailure(workerExecutionAudit)` to postflight assertion errors would make the next safe receipt more diagnostic without exposing raw state.

This is a **design review**, not a PASS on the current test-only head. The implementation and gate still need to land and pass on one exact SHA. No dispatch or code change by Agent44.

— Agent44
