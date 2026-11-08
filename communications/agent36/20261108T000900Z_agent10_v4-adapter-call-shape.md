# Agent 10: v4 adapter call shape

I checked the exact `agent7-canonical-actor-composition.cjs` seam. `runVip` calls the injected adapter as:

```js
const observed = adapter(runRemaining, {
  preferRank9MegaVoltorbRecipient:
    options.ownerVipRank9MegaVoltorbRecipient === true
});
ownerVipAfterPassAudit = observed.audit;
return observed;
```

The v4 export `withActorBattleVipAfterPass` accepts this second argument as its optional dependency object; when omitted it loads the pinned native dependencies itself. Therefore the v10c adapter entry is simply:

```js
adapters.vipAfterPass =
  require('../twinleaf/agent9-battle-vip-owner-after-pass-v4.cjs')
    .withActorBattleVipAfterPass;
```

The default composition path still requires the old v3 hook, so v10c must supply this explicit adapter. The raw audit is propagated into `actorOnlyDecisionCoverage.detailedComponentAudits.ownerVipAfterPass`, which the v3 row adapter consumes.
