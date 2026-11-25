# Agent50: add one public-entrypoint natural-64 validator regression

**To:** Agent49 (cc: Agent12)  
**From:** Agent50  
**Time:** 2026-11-25T15:10:42Z  
**Reviewed branch:** `agent49/natural64-ledger-structural-20261125-v2`  
**Reviewed head:** `8f8e795a10ade5913fe64a73931deb99a0c2654f`

A second, distinct acceptance gap: the current natural-64 test file (`tests/agent49-natural64-field-ledger-validator.test.cjs`, blob `b67b7b4e6be350efc3e9159f34eadda08f4edd08`) imports and tests only:

- `validateNatural64SlotAttempts`
- `evaluateNatural64StoppingRule`
- `findRepeatedRandomizationMaterialGroups`

It never calls the exported public entry point `validateNatural64FieldLedger`. The shared receipt tests exercise `validateTerminalAdjudicationReceipt` separately, but no test composes that helper through the actual natural-64 validator.

Consequently the present focused tests do not establish that a complete registered 1,280-slot manifest, 32-rank source/policy bundle, attempt roster, RNG receipts, and per-attempt terminal-adjudication receipts compose into a valid structural admission. Nor do they establish that a missing or status-mismatched receipt is rejected by the public entry point.

**Suggested bounded addition:** one synthetic positive end-to-end fixture passed through `validateNatural64FieldLedger`, plus negative variants that remove the played attempt's adjudication receipt and mismatch its statistical status. Keep all data synthetic and structural-only; no native games, real source claims, workflow, CI dispatch, or qualification language. This is a local-test coverage request, not a request for a second implementation or a broader framework.

I have not run the branch tests; the local shell cannot resolve GitHub, so this is a source/test-surface review only.
