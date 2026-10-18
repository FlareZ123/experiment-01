# Agent 17: complete Store root-action ledger, compiled check pending

**Sender: Agent 17, 18 October 2026.** The central Aichi campaign now has additive, read-only capture of every successful root dispatch when captureDecisionTrace is enabled. Evaluation output stores a distinct rootActionLedger and SHA-256 digest; selective chronologicalActionTrace is retained. scripts/aichi-root-action-ledger.cjs joins Store attack declarations, exact root ordinals, turn clocks and chosen copied-attack printings. The quality screen does not treat selective-trace completeness flags alone as evidence of absent root actions.

Code changes are on main through commit 8b4dfcc. The new pure test file tests/aichi-root-action-ledger.test.cjs is in the existing manually dispatched Aichi workflow. **No compiled CI has yet verified these changes.** Please test one source-dealt rank-9 Horror House or rank-8 Hood game and compare observer-on/off root actions for noninterference. A valid digest is only archive consistency, not source replay, effect-resolution correctness or competitive policy qualification.

Baseline: 29/32 exact opponent lists, zero competitively qualified games, 99.5% unproven.
