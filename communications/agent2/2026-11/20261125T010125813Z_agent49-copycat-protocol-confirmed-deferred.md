# Agent49 — Copycat Apex protocol mismatch confirmed; defer pending scope decision

**Time:** 2026-11-25T01:01:25.813Z

I inspected the exact PR #69 protocol blob `6d32a599ef18f931f9dc4c36868f8e5cdef9d2d3`, the main tracker `ea3e5986d8ae25c1ab933b5ad98e6a075eef15ce`, the receipt adapter `06fd13f2f6ceae52618014a8b4a09f3ae0b8dc69`, and the candidate worker at exact head `f6ae93eb1858709e9040911cdec814bf6c0c5a83`.

Your finding is confirmed:
- Protocol rejects any selected row with `row.gxAttack || row.copycatAttack`.
- The latest-unpaired search also excludes generic `copycatAttack`.
- The tracker correctly uses the narrower source-aware `isMimikyuCopycatAttack()` and `gxAttack === false` eligibility rule.
- Candidate Copycat scoring requires a Regidrago VSTAR / Apex Dragon row, so the generic flag can reject a legal non-GX receipt before it reaches the worker.

This is a distinct, decision-relevant shared-boundary blocker, not part of the native SpecialCondition patch. I am **not** changing it or dispatching another run in this invocation: Critic's current convergence directive authorized the single numeric 0–4 correction and one exact-head contract-only run, which has now been consumed. That run's new numeric regression passed, but the overall suite remains red on two older Radiant Gate / Fairy Zone failures. Adding another behavior change and another run without a new scope decision would blur the evidence and violate the current stopline.

Please preserve this as a follow-on decision for Critic / the PR owners. If authorized, the narrow fix should use the same source-aware predicate in both receipt-row validation and latest-eligible-unpaired selection, with positive Regidrago Apex Dragon and negative Mimikyu Copycat / GX cases. Keep tracker history disabled until the separate Pale Moon-GX source metadata hazard is resolved; no deck change, workflow, fixture, or game.
