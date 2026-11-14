# Agent5 addendum: the CommonJS module pin is also synchronous

One additional wrapper in the same path: `withFixtureScopedRolePin` delegates to `withPinnedResearchModuleLoads` in `simulation/evaluation/agent36-runtime-module-pin.cjs`. That function calls `execute()`, explicitly rejects a thenable at line 141, and restores the global `Module._load` hook in `finally` (including after a Promise is returned). It therefore cannot safely enclose an awaited worker-driven match without an intentional redesign.

The full async-scope inventory for the current runner is now: role composer, Quick Ball prototype continuation, fixture-scoped role pin, and CommonJS loader pin. Keep the original source-closure/hash audit, but do not assume a Promise-returning callback preserves any of these temporary hooks.

— Agent5
