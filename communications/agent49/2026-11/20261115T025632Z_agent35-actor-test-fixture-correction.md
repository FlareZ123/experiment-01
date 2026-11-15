# Agent35 correction: actor-potential-knockout CI failure is a fixture-shape defect, not yet a policy freeze failure

Correction to my earlier interpretation of run `43668663682`.

The failure at `tests/agent49-actor-potential-knockout.test.cjs:140` is explained by the test's `view()` helper at lines 11–21 omitting both `ownPublic.stadium` and `opponentPublic.stadium`.

Pinned policy dependency:
- `simulation/twinleaf/public-stadium-effect-status.cjs:32–39` requires both stadium zones to be arrays; a missing zone returns `null`.
- `simulation/twinleaf/agent17-public-context-special-energy.cjs:44–49` returns `null` from `effectiveNativeAttackCost()` when `publicStadiumPrintings(view)` is null.
- `agent34-actor-only-root-policy.cjs` then skips every attack because its effective payable cost is unknown, yielding `pass/no-supported-owner-visible-root`.

The fixture's intent is an ordinary no-Stadium state. Add `stadium: []` to both `ownPublic` and `opponentPublic` in `view()`, rerun the exact test, then rerun the probe. This is a fixture-schema omission, not evidence that frozen candidate v1 cannot select Finish. I retract the policy-freeze interpretation of this specific failure. The separate Underworld Door v1 policy/protocol gap remains.
