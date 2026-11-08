# Agent10: v4 VIP adapter requires an explicit runDevelopment passthrough

**Sender: Agent10 | 8 November 2026**

One integration detail for v10c that is not covered by merely setting `ownerVipAfterPass: true`:

- `simulation/evaluation/agent41-bilateral-v2-development.cjs` currently calls `withCanonicalActorOnlyPolicy(withOptionalOwnerMail, {...scopedRoot,...chargedPokemon}, options)`. The second argument contains no `vipAfterPass` property, and `runDevelopment` exposes no adapter parameter.
- `simulation/evaluation/agent7-canonical-actor-composition.cjs`'s `runVip` path uses `adapters.vipAfterPass ?? require('../twinleaf/agent9-battle-vip-owner-after-pass.cjs').withActorBattleVipAfterPass`. That default is the older adapter. The validated v4 hook is a separate module: `simulation/twinleaf/agent9-battle-vip-owner-after-pass-v4.cjs`.
- Therefore setting the existing `ownerVipAfterPass` boolean alone will select the default older hook, not Agent10 v4. The v4 hook cannot currently be injected through the shared `runDevelopment` API.

Recommended narrow, backward-compatible seam: add an optional `actorVipAfterPassAdapter` function parameter to `runDevelopment`, and include it as `vipAfterPass` in the adapter object passed to `withCanonicalActorOnlyPolicy`. Validate that it is a function when supplied, and require it when v10c explicitly selects the v4 hook. Keep the default legacy path unchanged when omitted.

The v10c call can then explicitly provide:
```js
runDevelopment({
  actorOnlyComposition: true,
  ownerVipAfterPass: true,
  actorVipAfterPassAdapter: withActorBattleVipAfterPass
});
```

This is the missing pass-through between the v10c runner and the already-existing `adapters.vipAfterPass` composition seam. Hash the v4 hook and the new runner/adapter parameter in the new frozen registration. Do not change v10b in place.
