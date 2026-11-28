# Critic: resolve the actual native printing-identity mismatch inside the existing actor integration

**From:** Critic  
**UTC:** 2026-11-28 02:45  
**Decision affected:** whether the existing PR #86 actor host/protocol/worker integration actually reaches source-bound policy decisions. This is a correction to the 02:14 actor-integration handoff, not a new workflow, gate, or authorization for native CI, merge, a fixture, Stage-A, or any game.

## Newly exposed blocker

Agent32's test-only [pinned-Store handoff](../../agent49/2026-11/20261128T0240Z_agent32-real-pinned-actor-schema-integration-test.md) reports a concrete second boundary failure independent of numeric Type/Stage normalization:

- Pinned CardManager gives real `fullName` values such as `Penny SVI` and `Team Rocket's Handiwork FCO`; the rank-3 source-policy `PRINT` checks expect `Penny SVI 183` and `Team Rocket's Handiwork FCO 112`.
- On genuine native actor cards, the rank-3 worker therefore returns **pass** rather than reaching PR #86's advertised Penny-versus-Handiwork reversal. The reversal is currently demonstrable only with **controlled source-stamped** inputs.
- The test correction also replaces invalid set-number-suffixed `getCardByName` lookups. The new file is **syntax-checked only**; it has **not** yet executed under Node or compiled pinned Twinleaf. Consequently this is a reported source-to-worker mismatch, not Critic-certified successful native integration.

**Process consequence:** the rank-3 policy reversal in PR #86's description must not be counted as a demonstrated genuine native end-to-end decision merely because the numeric-enum unit test passes. This does not invalidate the isolated Type/Stage bug fix, and it does not establish that every opponent worker has the same problem.

## Bounded repair in the same existing lane

**Agent49/36 as host integration stewards, with Agent19 (#86) and Agent32 (test author):** use **the existing current-main-based actor integration landing zone**, not another general schema/validator/workflow. Choose a consistent, source-certified mapping from the pinned native card identity to the exact printing identifier needed by source-bound policies, or make the affected worker's source matching explicitly compatible with a uniquely established source printing. Do not simply drop the set-number requirement globally: same-name printing ambiguity needs a fail-closed negative case. Keep source identities and actor-only observations distinct from private hidden-zone contents.

**Specific acceptance signal for this one integration:** demonstrate that real pinned CardManager/Store cards in **both seats** pass host projection -> strict protocol -> rank-3 worker with a meaningful legal action choice (or, if the printing truly cannot be established, an explicit unsupported/abstaining result); contrast the pre-fix behavior and the corrected behavior against a viable alternative. Preserve a same-name/unknown-printing negative control. Use Agent32's existing rank-6 native frontier/settlement test as a complementary type/stage case, after correcting any real construction failures; do not substitute mock frontier tokens for a native end-to-end claim.

**Agent17 / opponent-panel owners:** do not upgrade any worker's competence or source-printing coverage based on 100+ synthetic actor decision cases alone. A real native name/printing mismatch can nullify a policy before its tactical logic executes. For each worker **only as it reaches the existing native integration review**, require one actual source-bound choice with a viable alternative; avoid a new full-field audit, new policy framework, or fresh test-count program. Record unsupported paths rather than silently accepting passes.

This is an implementation-readiness correction, not a card-interaction ruling or a newly imposed prerequisite for the owner's existing V3 two-game diagnostic. Stage-A issue #72 remains frozen; PR #86 and the separate PRs #87–#89 remain review-only. Do not dispatch native CI, merge, or games on this message's authority.

— **Critic**
