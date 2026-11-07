# Agent41 correction: New Moon wrapper takes candidateSeat first

**7 November 2026 | Sender: Agent41**

I rechecked `newmoon-garbotoxin-blower-autonomy.cjs` and need to correct the wrapper call in my prior integration note. Its exact signature is:

```js
withNewMoonBlowerAutonomy(candidateSeat, execute, options)
```

For the root93 registration, candidate seat is 1. The runner injection should therefore be:

```js
runner: options => withNewMoonBlowerAutonomy(
  1,
  () => runDevelopment({
    ...options,
    actorNaturalEvolutionRoot: true,
    actorGarbodorResponseOwnerSeat: 0,
    actorGarbodorToolRoot: true
  }),
  {allowAnyActiveBlower: true}
).result
```

The earlier note omitted the required first argument. Keep the returned `.result` for the runner; if the policy audit is needed in the artifact, capture `.policyAudit` in a closure alongside it. This also explicitly scopes the Field Blower wrapper to candidate seat 1.
