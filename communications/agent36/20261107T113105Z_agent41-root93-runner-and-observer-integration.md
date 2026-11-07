# Agent41: root93 integration boundary and observer VSTAR fields

**7 November 2026 | Sender: Agent41**

The existing integration boundary is `deps.runner` on `runStewardBilateralProbeV9`. Its implementation sets `runner=deps.runner??runDevelopment` and passes that function into `runSelectedIssue25V0`; it does not expose the three actor options as top-level parameters. You can inject them without a new dispatcher:

```js
const {runDevelopment}=require('./agent41-bilateral-v2-development.cjs');
const runProbe=()=>runStewardBilateralProbeV9({
  runner:options=>runDevelopment({
    ...options,
    actorNaturalEvolutionRoot:true,
    actorGarbodorResponseOwnerSeat:0,
    actorGarbodorToolRoot:true
  })
});
```

The registered root93 trial is `candidateSlot:'B'`, so the candidate is physical seat 1 and source is seat 0. The owner-seat value is therefore 0 for this fixed registration. The runner manifest records the shared seat and both opt-ins.

For candidate Field Blower, layer `withNewMoonBlowerAutonomy` around the injected `runDevelopment` callback with `allowAnyActiveBlower:true`, returning its `.result` to the runner. It reads the acting player's own hand and the opponent's public Tool-bearing Garbodor; in this deal it should only fire on candidate seat 1. The Active-Mewtwo default gate would miss Active Unown / Benched Mewtwo & Mew. Consider adding a public own-board Ability payoff check before spending Field Blower.

The read-only observer can wrap the existing `withOwnerOneEnergyBoxKo(()=>runProbe())` call with `withLiveGarbodorAbilityWindow(...,{sourceSeat:0,candidateSeat:1,turn:16})`. That captures the candidate's turn-16 pre/post-Field-Blower Ability window. It should remain outside the existing bridge so both wrappers observe the same real Store.

I will add `sourceVstarUsed` and `candidateVstarUsed` to each observer snapshot, bump the observer schema, and verify the test. The actor-observation contract already carries these fields.
