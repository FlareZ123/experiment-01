# V3 actor-policy input receipt: missing trace layer

## Why this exists

The native fixture trace now separates:
1. `fullStateBefore/After`: complete offline analyst state;
2. `actorObservationBefore`: the base owner-visible observation;
3. prompt resolver context: the pending prompt and the actor's resolution surface.

Those are not yet a complete record of what the root policy consumed.

In `simulation/twinleaf/agent34-actor-only-root-policy.cjs`, the wrapper first calls `observe(state, seat)` to obtain `baseView`, then adds derived actor/public information (for example Copycat history, Ranger/Budew effects, owner-turn receipts and funded-tool observations), constructs `rootOptions`, and finally calls:

```js
chooseActorRootIntent(view, catalog, rootOptions)
```

Consequently, `actorObservationBefore` is a valid base observation but is not necessarily equal to the final `view` supplied to the decision function. The offline full-state snapshot cannot be used as a substitute: it includes information the actor policy must not receive.

## Proposed receipt

Capture the exact final decision inputs immediately before `chooseActorRootIntent`:

```js
{
  schema: 'aichi-actor-policy-input-receipt-v1',
  source: 'agent34-before-chooseActorRootIntent',
  visibility: 'actor-visible-only',
  decisionKey: {
    role: 'candidate-or-opponent',
    seat: 'bottom-or-top',
    turn: 0,
    phase: 'player-turn',
    perSeatRootOrdinal: 0
  },
  baseObservationSha256: '...',
  view: { /* detached JSON-safe final view */ },
  rootOptions: { /* detached JSON-safe options */ },
  catalogSha256: '...',
  policyModuleSha256: '...',
  receiptSha256: '...'
}
```

The numbers above are schema examples, not fixture results.

Requirements:

- Snapshot the exact `view` and `rootOptions` objects passed to the chooser, not a separately reconstructed approximation.
- Detach them into JSON-safe data before recording. Never retain the mutable Twinleaf state, live card instances, closures, or object references.
- Keep the base observation digest so reviewers can distinguish base observation from wrapper-derived policy input.
- Pin the catalog and policy code separately; a digest of the static catalog is sufficient if the catalog is immutable for the run.
- Use a stable per-seat decision ordinal or a WeakMap-backed action receipt to join the receipt to its `decisionTrace` row. Do not join only on card names, action names, or turn number.
- The observer callback must return `undefined` and must not mutate the view, options, state, action, policy audit counters used for decisions, or control flow.
- Do not include opponent hand/deck/prize contents or any other hidden opponent state. The receipt should contain only the acting policy's own hand/state and public information that was actually supplied to it.
- Store the receipt in the encrypted full-state artifact. The public artifact should expose only the encrypted envelope and public hashes.
- Keep prompt-resolver inputs separately typed; do not represent a prompt resolution as a root-policy input receipt.

## Minimum tests

1. The receipt is emitted at the actual chooser boundary and snapshots the exact `view` and `rootOptions` passed to the chooser.
2. The observer is behaviorally inert: it returns no decision value and does not change the selected intent/action.
3. The detached receipt remains unchanged if the original view/options are subsequently mutated.
4. The receipt contains the acting player's own hand and public opponent information but no opponent-private hand/deck/prize data.
5. A two-seat fixture produces correctly separated candidate/opponent receipts with stable join keys.
6. The receipt digest and policy/catalog pins are reproducible under the same source and input.

Until this layer is captured and audited, keep the existing `whole-policy information safety not certified` qualification. This is an evidence-completeness requirement, not proof of an information leak.
