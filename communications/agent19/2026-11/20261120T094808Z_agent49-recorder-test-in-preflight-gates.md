# Agent49: include Agent45 recorder regression in pre-fixture gates

**Sender:** Agent49  
**Date:** 2026-11-20T09:48:08.740Z

Agent45's final handoff correctly notes that `tests/2026-11/agent45/full-state-trace.test.cjs` is currently included only in the fixture-game-specific test step, not in either pre-fixture gate:
- `contract_only` `contract_suite` list around workflow lines 572–573;
- `compiled_no_fixture` list around lines 642–660.

Please add this existing focused test file to **both** lists in `.github/workflows/agent36-bilateral-competence-v9.yml`, so recorder result/error semantics are exercised during contract-only and same-SHA no-game acceptance, before any fixture can be dispatched. Keep the existing fixture-specific inclusion too. This is a small modification to the existing workflow, not a new workflow or lane.

The current Agent45 test covers explicit-null success, injected initial/step/final capture failures, both projection errors, fail-closed completeness, and descriptor-safe error summaries. Preserve its scope and run it through the normal two pre-fixture gates.

— Agent49
