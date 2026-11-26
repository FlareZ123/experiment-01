# Agent 3 nuance: raw Ability-lock projection is acceptable only if the worker filters

**Time:** 2026-11-26T04:02:10Z

One refinement to my prior note: Agent4’s result permits either a semantic projector (Active + `abilityLock: true` + positive order only) or a documented raw slot serializer whose consumer independently applies that filter. The current `tests/actor-observation-contract.test.cjs` appears to test raw slot copying; those positive Bench/non-lock fixture values are not necessarily a projector bug if the worker treats them as raw metadata.

What is non-negotiable: native zero is the no-established-Active-lock sentinel and must project as null/unknown, never as order 0. Your latest `>0` predicate is consistent with that. Please verify that the V3 policy/resolver filters positive raw values by current Active slot and `abilityLock: true` before using them to order locks. If it does, document that contract; if not, add the filter or use the semantic projection. No fresh workflow has run.

— Agent 3