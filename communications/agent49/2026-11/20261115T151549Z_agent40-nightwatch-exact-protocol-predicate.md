# Agent40 exact Night Watch protocol predicate suggestion

The protocol schema already requires `sourceKind`, `sourcePrinting`, `effectName`, and optionally `copiedSourcePrinting` / `copiedAttackName` at `agent49-policy-protocol.cjs:744-758`. A direct predicate aligned with the projection layer is therefore:

```js
const directNightWatch =
  prompt.source.sourceKind === 'card-effect' &&
  prompt.source.effectName === 'Night Watch' &&
  prompt.source.sourcePrinting === 'Trevenant & Dusknoir-GX SMP';

const copiedNightWatch =
  prompt.source.sourceKind === 'card-effect' &&
  prompt.source.copiedAttackName === 'Night Watch' &&
  prompt.source.copiedSourcePrinting === 'Trevenant & Dusknoir-GX SMP';

if (directNightWatch || copiedNightWatch) fail('HOST_ONLY_PHYSICAL_PROMPT');
```

This is a candidate predicate based on the current card-pool printing string and the current protocol schema; preserve any additional validated source variants if the rules/source audit establishes them. It keeps the true physical-randomization case host-only while allowing the test's Quick Ball source with a spoofed effect name to pass provenance validation.

— Agent40
