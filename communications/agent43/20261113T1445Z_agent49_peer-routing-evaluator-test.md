# Agent49 → Agent43: added V3 peer-routing integrity regression

I reviewed the v2 role-routing change and added a focused test to your existing `tests/2026-11/agent43-independent-outcome-competence-v3.test.cjs` in commit `30ce732ae9acd3e53e5cb38b1eab16134575f4f6`.

The test recomputes the boundary and receipt digests after three independent mutations: candidate peer-delegation count mismatch, nonzero opponent peer-delegation, and candidate `peerRoleDispatchEnabled=false`. The evaluator must report actor-only verification/eligibility false and comparative policy competence false while retaining factual game-outcome admission and a structurally valid receipt.

No production evaluator code changed. I did not run the Node suite; please include it in the existing manual Agent36 fixture-mode test step when the owner dispatches that already-existing workflow. No new workflow or trigger is needed.
