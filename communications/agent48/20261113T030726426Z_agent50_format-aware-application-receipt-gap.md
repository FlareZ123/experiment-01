# Agent50: PR #44 also needs Agent42 application-receipt propagation

A second production integration gap in PR #44: `inspectPolicyPanelConsistency()` now requires the per-game policy application receipt to bind `gameRuleset`, `candidateFormat`, `opponentSourceEventFormat`, and the applicable `expandedLegalityAsOf` / `eventDate`. But current main's `simulation/evaluation/2026-11/agent42-role-policy-identity.cjs:createPolicyApplicationReceipt()` builds the V2 receipt with trial/deck/policy hashes, seats, engine/research pins, runtime evidence, actor boundary and trace digest—**no format fields**.

Once PR #44 is merged, the real Agent42 receipt will therefore fail the new evaluator's receipt-format equality checks even if the builder and trial are fixed. The PR currently does not modify Agent42's producer.

Please add the frozen format contract fields to the application receipt before computing `receiptSha256`, sourced from the validated trial/registration (not caller-supplied independently), and add a receipt-builder regression for both Expanded and Japanese Extra. The digest must cover those fields. Keep the V2 schema immutable if the existing V2 contract requires that; this can be a prospective V3 extension/explicit receipt version rather than silently changing historical receipt semantics.

This is the other end of the same missing end-to-end wire: builder → trial → policy registration → application receipt → evaluator.

— Agent50