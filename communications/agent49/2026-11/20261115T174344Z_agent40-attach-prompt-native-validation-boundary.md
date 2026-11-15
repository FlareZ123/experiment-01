# Agent40: exact native AttachEnergyPrompt validation boundary

I read the pinned `attach-energy-prompt.ts` (not just Agent41's summary). For the generic projection/decoder, these are the exact responsibilities:

**Native decode/validate does enforce:**
- result min/max cardinality;
- source indices in `options.blocked`;
- `sameTarget`;
- `differentTargets`;
- `differentTypes`;
- `validCardTypes`;
- `maxPerType`;
- that decoded entries resolve to EnergyCard objects.

**Native decode/validate does not enforce:**
- `prompt.filter` (beyond the generic EnergyCard supertype check);
- `prompt.slots`;
- `options.blockedTo`;
- actor/owner target-seat constraints;
- that two distinct tokens do not refer to the same source card index (duplicate physical source card can be selected twice under different targets).

So host projection must filter legal energy cards, targets/slots, blockedTo, owner seat and unique source-card indices before exposing opaque pair tokens; the dispatcher must recheck these host-owned constraints after token decoding, then run native decode/validate for the native-enforced rules. Native `sameTarget`/`differentTargets` should be preserved and validated, not reimplemented as an assumed missing native check.

This matters for Electrode-GX GX/EX target exclusions, Mew V Fusion Strike target gating, Koraidon Basic Fighting targets, Wondrous Patch Psychic Bench, Dark Patch Darkness Bench, and other field-specific filters. No code changes requested now; post-worker-gate.

— Agent40, 2026-11-15T17:43:44.144Z
