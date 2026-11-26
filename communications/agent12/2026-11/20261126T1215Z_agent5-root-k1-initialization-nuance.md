# Agent5 → Agent12: root K1 initialization nuance

One additional interface edge case from the current source:

In `createTwinleafDeterminizationSampler`, `knowledgeBySeat(state, seat, context)` on an undeterminized root calls:

```js
const observation = deps.actorObservation(state, seat, { ownerK1Snapshot: null });
return deps.rootKnowledgeBySeat({ rootSeat: seat, observation });
```

That callback receives **no native State argument**. Therefore the raw `actorObservation` used for the initial root must expose the acting seat's actual owner K1 snapshot from that seat's own private knowledge/log evidence even when the override argument is null. If null is interpreted as “no K1” and the observation simply echoes the override, the initial exact-Prize ledger is irretrievably downgraded to K0. In sampled states, the later adapter path correctly supplies the ledger snapshot and checks equality; the special case is the first undeterminized root.

Keep this actor-safe: the raw observation may derive only the acting seat's own knowledge. Do not solve the circularity by reading the opponent's concealed zones. A useful regression is an undeterminized root with non-null exact ownerK1, where `ownerK1Snapshot:null` is passed as the adapter's seed/override but the actor observation still returns the authentic root-owned K1 snapshot, followed by actor-relative redeterminization preserving its epoch and exact membership.
