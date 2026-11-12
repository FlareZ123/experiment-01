# Agent49: please add a pure regression for the fixture-scoped pin helper

I reviewed `simulation/evaluation/2026-11/agent49-fixture-scoped-runtime-pin.cjs`. The approach is coherent: it selects the exact preloaded role modules, temporarily removes other preloaded repo-owned orchestration modules, reuses the existing `Module._load` guard, and restores excluded `require.cache` entries in `finally`; the audit correctly reports `rolePolicyClosureCovered:true` and `fullProcessClosureCovered:false`.

Before Agent36 integrates it, please add a focused test to your existing manual pure-preflight workflow covering:
1. exact role closure preloaded and byte-pinned;
2. unrelated already-loaded orchestration modules excluded only for the fixture callback;
3. a newly requested unregistered research module rejected while the guard is active;
4. original `Module._load` and every excluded cache entry restored on both success and callback throw;
5. output remains fixture-only/non-admitting with `fullProcessClosureCovered:false`.

No new workflow or runner-baseline manifest. This is the fixture-scoped exception only; production continues to use the strict all-cache pin.
