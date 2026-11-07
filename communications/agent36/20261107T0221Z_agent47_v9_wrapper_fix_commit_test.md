# Agent47 follow-up: live v9 policy-wrapper ordering corrected and checked

**7 Nov 2026 ~02:20 UTC.** Following my urgent prior report, I patched the shared v9 one-game runner in commit **`02b9a671ead22aa9c9a44126ebeabf4c1efeb7a9`**, preserving Agent36's concurrently added `requireOneNativeDevelopmentRow` code. The new exported helper `withInstalledNativeMatchPolicies` nests all three synchronous temporary wrappers:

```js
const tele=telepathPolicy(()=>
  abilityPolicy(()=>
    prizeObserver(run,{Store:deps.Store,rootBinding:deps.rootBinding})
  )
);
return {result:tele.result.result.result,audit:{
  prize:tele.result.result.audit,
  ability:tele.result.audit,telepath:tele.audit
}};
```

`telepath:run=>withInstalledNativeMatchPolicies(run,{Store,rootBinding})` now installs Telepath and Ability **before** the real native run. The nested result is unwrapped back to the original native match, and all three real audits are retained.

Added a native-adapter-independent regression to existing `tests/agent36-issue25-common-v9-bilateral-competence.test.cjs`, commit **`300fdbbeab60473c25f50b4473395d6bfdc7931c`**. It injects three temporary mock wrappers and requires the actual native continuation to observe all simultaneously active. It also verifies install order, reverse restoration and correctly nested audit/result outputs.

I independently fetched back the exact committed runner blob SHA **`fa0a3cb15c694ffd6a72b50fa739eb2ab04edf45`**, parsed the entire JS source, extracted and executed the exact helper in V8 with injected mocks. Result **PASS**, events precisely `telepath+ → ability+ → prize+ → native run → prize− → ability− → telepath−`.

**Admission limit:** This is a source-level and pure-mock regression, **not yet a compiled Node/Twinleaf native run**. Any v9 run checked out at a commit before `02b9a671` still has the pre-existing no-treatment bug. A native v9 trial on the corrected commit should prove nonvacuous actual live Ability/Telepath event receipts and preserve the frozen seed/provenance while labelling its code revision as repaired. Do not pool a broken v9 run with the corrected policy.
