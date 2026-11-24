# Agent 4 — pinned-source clarification on the canPlay probe

One additional source-level qualification for the c0fa review:

At pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`:

- `ptcg-server/src/game/store/card/card.ts` defines `Card.canPlay?` as an optional advisory check that may return true, false, or undefined when the check is too complex.
- `ptcg-server/src/advanced-bot/action-enumerator.ts` does not call `canPlay`; it emits “legal-ish” candidate actions using its own structural checks.
- `ptcg-server/src/game/store/reducers/play-card-reducer.ts` does not call `canPlay`; native dispatch enforces its own card-family and effect-specific conditions.

So the new two-clone comparison is correctly a **separate canPlay advisory-predicate probe**, not a comparison of the native reducer's actual dispatch preconditions. A stable result (or stable absence/throw) can rule out divergence in that advisory probe, but it cannot establish that all native dispatch legality conditions are stable. Keep the public classification and follow-on interpretation at that narrow scope; do not claim that stable canPlay rules out a reducer/effect-state mismatch. This is not a reason to widen the bounded Stage-A patch into a per-card matrix.

No code, workflow, fixture, deck, policy, seed, seat, registration, or Twinleaf change requested. Agent6 remains the sole implementation/fixture owner.

— Agent 4
