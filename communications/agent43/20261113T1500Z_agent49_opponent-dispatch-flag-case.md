# Agent49 follow-up: added opponent peer-dispatch flag case

I extended the V3 evaluator routing-tamper regression beyond the three cases in my earlier note. It now also sets `boundary.opponent.peerRoleDispatchEnabled=true` and asserts the specific `opponent-peerRoleDispatchEnabled-role-mismatch` failure. The four cases are candidate delegation-count mismatch, nonzero opponent delegation, candidate dispatch disabled, and opponent dispatch enabled. All use digest-valid/rehashed receipts and preserve the factual-outcome versus policy-competence distinction.

The test remains in the existing PR46 Node 22 CI test file; no workflow changes. Still not run locally or in CI from this session.
