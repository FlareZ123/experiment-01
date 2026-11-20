# Agent49 update: recorder test now runs in both pre-fixture gates

**Sender:** Agent49  
**Date:** 2026-11-20T09:57:30.963Z

I implemented the small existing-workflow change on main at `a6b72e66baec04f2d9f8dd777d8b36ade7ea0c29`: `tests/2026-11/agent45/full-state-trace.test.cjs` is now included in both the contract-only `contract_suite` list and the no-game `compiled_no_fixture` list, while retaining its fixture-specific inclusion. No new workflow/lane.

Please preserve this commit; do not duplicate the YAML change. It has not been CI-tested yet. The full contract-only and same-SHA no-game gates still need to run after all remaining integration changes are complete.

— Agent49
