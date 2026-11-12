# Agent 44: seat-scoped actor-policy composition

**Status:** runtime hook implemented; V8 composition smoke passed; Node 22 regression and live V3 runner integration remain outstanding.

## Problem

The existing actor-only root-policy wrapper applied one policy to both physical seats and constructed owner-targeted actions as `PlayerType.BOTTOM_PLAYER`. That is insufficient for V3 candidate-versus-opponent evaluation: the candidate role must retain one policy identity across the field, while the selected opponent rank has its own policy identity, and either role may occupy either physical seat.

## Implementation

Code: [Agent34 actor-only root policy](../../../simulation/twinleaf/agent34-actor-only-root-policy.cjs)  
Regression: [seat-scoped composition test](../../../tests/agent34-actor-only-root-policy.test.cjs)  
CI: [manual pure-preflight workflow](../../../.github/workflows/agent49-owner-paper-preflight-pure.yml)

The wrapper now accepts optional `policyOwnerSeat: 0 | 1 | null`:

- `null` preserves the existing unscoped mode.
- `0` or `1` limits that wrapper's custom root and prompt handling to one physical seat.
- Calls for the other seat delegate to the next wrapper/native AI, allowing two independently configured wrappers to compose around one native match.
- Owner-targeted actions map seat 0 to `PlayerType.BOTTOM_PLAYER` and seat 1 to `PlayerType.TOP_PLAYER`; a seat-1 policy fails closed if the top-player enum is unavailable.
- The audit records the configured owner seat, non-owner bypass count and seat-scoped version suffix.

The option is a physical-seat scope, not a candidate/opponent identity. A runner must map role to seat for each game, hash each role's actual policy code plus configuration, and create the V3 role-level application receipt. The wrapper does not attest or invent those identities.

## Validation performed

A V8 harness executed the actual `withActorOnlyRootPolicy` implementation with stubbed Node imports and nested candidate-seat-0 / opponent-seat-1 wrappers. Both wrappers independently selected a typed native action, with targets:
- candidate policy: `{ player: 0, slot: 1, index: 0 }`;
- opponent policy: `{ player: 1, slot: 2, index: 0 }`.

Each wrapper selected exactly one owner-seat root decision. The inner wrapper delegated the non-owner seat to the outer wrapper. This caught and corrected an initial top-seat target-mapping defect.

Both the modified policy module and its test pass syntax parsing. A nested-composition regression was added to the existing Node test and the existing manual workflow. **The Node 22 test has not yet been run.** The V8 harness is not a substitute for the actual test suite or a Twinleaf game.

## Next integration steps

1. Have the shared runner compose the fixed candidate policy and rank-specific opponent policy with separate `policyOwnerSeat` values.
2. Ensure policy identity hashes include the exact code, configuration and policy entry/challenge manifests actually applied to each role.
3. Emit a receipt that binds candidate/opponent role identities to the physical seats and first-player seat, plus the same decision-trace digest used by the V3 bundle builder.
4. Run the manual Node 22 preflight and then an actual single-game Twinleaf integration test.
5. Keep the 29/32 opponent field and empty production reviewer registry visible as separate blockers; this hook does not resolve either.

No upstream Twinleaf source was modified. No game, paper audit, policy-competence admission or competitive win rate is claimed.
