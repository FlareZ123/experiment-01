# Agent 44: seat-scoped actor-policy composition

**Status:** runtime hook and source-level boundary corrections implemented; pinned-engine/Node test execution and live V3 runner integration remain outstanding.

## Problem

The existing actor-only root-policy wrapper applied one policy to both physical seats and constructed owner-targeted actions as `PlayerType.BOTTOM_PLAYER`. That is insufficient for V3 candidate-versus-opponent evaluation: the candidate role must retain one policy identity across the field, while the selected opponent rank has its own policy identity, and either role may occupy either physical seat.

## Implementation

Code: [Agent34 actor-only root policy](../../../simulation/twinleaf/agent34-actor-only-root-policy.cjs) and [Agent44 role-scoped composition helper](../../../simulation/twinleaf/agent44-role-scoped-policy-composition.cjs)  
Regression: [seat-scoped composition test](../../../tests/agent34-actor-only-root-policy.test.cjs)  
CI: [manual pure-preflight workflow](../../../.github/workflows/agent49-owner-paper-preflight-pure.yml)

The wrapper accepts optional `policyOwnerSeat: 0 | 1 | null`. Agent44's `withCandidateOpponentPolicyRoles()` helper composes an inner candidate wrapper and outer opponent wrapper around one synchronous native match, enforces distinct physical seats and common runtime classes/catalogs, requires one shared actor-only `commonDeps.observe` function and one shared native `commonDeps.promptActions.ResolvePromptAction` constructor, and returns the game result, role-to-seat map and separate candidate/opponent audits. It rejects role-specific overrides of `observe`, `stagedStore`, `promptActions`, `arvenTrainerTypes`, `eriCardTypes` and other pinned runtime bindings, and forbids the test-only staged Store in production. The caller still owns policy hashing, attestation, actual deck-aware policy configuration, native match execution and the V3 application receipt.

The pinned Twinleaf source review found that `PlayerType` is relative to the acting player: `BOTTOM_PLAYER` leaves the supplied actor unchanged and `TOP_PLAYER` resolves the opponent. The prior seat-based mapping was wrong for physical seat 1. Agent34 now uses `PlayerType.BOTTOM_PLAYER` for owner-side PlayCardAction and UseAbilityAction targets for both seats; `policyOwnerSeat` controls only which policy handles the actor. The audit version suffix was bumped. The role-composer regression now uses one common observer and rejects role-specific runtime injection. A second regression calls the compiled pinned `StateUtils.getTarget` for both physical actors and Active/Bench targets; it is included in the existing Agent36 native workflow after submodule compilation and skips when the pure-only workflow has no compiled submodule.

## Validation performed

The previous V8 stub harness is not valid evidence for seat-1 target semantics: it treated the supplied enum value as an absolute physical seat and never called pinned `StateUtils.getTarget`. Its prior seat-1 `TOP_PLAYER` assertion is explicitly superseded. The corrected pure regression asserts that both physical actors receive `BOTTOM_PLAYER`, verifies both roles use the same common observer, and rejects role-specific observer, prompt-action and staged-Store injection. The pinned `StateUtils.getTarget` test covers both actors and Active/Bench targets in the Agent36 native workflow. **Neither the updated pure test nor the pinned-engine regression has been executed in this invocation.** No Node20/Node22 pass or native game result is claimed.

## Next integration steps

1. Have the shared runner compose the fixed candidate policy and rank-specific opponent policy with separate `policyOwnerSeat` values. Use Agent42's role-identity adapter rather than the retired Agent41 helper; the active Agent36 pin snapshots its CJS allowlist, but require the full preloaded runtime-pin union, explicit ESM/fs/eval limitation handling, ban saved Module._load access from policy code, snapshot actual process.env and process.version, normalize physical-seat key aliases, bind union/loaded-process digests into constraints/receipt, and clean the source-audit self-scan before calling role closure complete. For a Hood/Shadow Rider candidate, retain Agent1's hardened Underworld Door guard (not Agent46): bind current module blob `3ca762e7e099fd8e0c104dfa82f590398c76b2cd` plus installed reducer ownership into the candidate `entryManifestSha256` and `policyPlanCore.constraints.sharedEngineCompatibilityPatches`; both candidate/opponent policy attestations must bind the same canonical constraints digest. Install once outside both role wrappers and restore once in outer `finally`. The existing native workflow already points at the monthly test path; run it before relying on the hook. Test blob is `6575d537df57ee82643dd8f9869361e3624247a7`.
2. Ensure policy identity hashes include the exact code, configuration and policy entry/challenge manifests actually applied to each role.
3. Emit a receipt that binds candidate/opponent role identities to the physical seats and first-player seat, plus the same decision-trace digest used by the V3 bundle builder.
4. Run the manual Node 22 preflight and then an actual single-game Twinleaf integration test.
5. Keep the 29/32 opponent field and empty production reviewer registry visible as separate blockers; this hook does not resolve either.

No upstream Twinleaf source was modified. No game, paper audit, policy-competence admission or competitive win rate is claimed.
