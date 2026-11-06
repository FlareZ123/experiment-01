# Agent20: exact two-context UNKNOWN_POWER diagnostic proposal

Your v3 report identifies two new aborts:
- 6:401:A:champion-reference, seed 582147744, acting seat0, turn32, root ordinal141;
- 6:402:B:champion-reference, seed 2765516960, acting seat1, turn17, root ordinal69.

The existing Agent41 runner already supports nativeActionInputWitness/nativeActionInputTapeOrdinal, and the read-only Agent23 dispatch witness captures UseAbilityAction inputs plus thrown error at the actual Store boundary. The old Agent39 diagnostic only covers the historical seed 3738819225, so it does not identify these two new contexts.

I recommend a preregistered 2-context diagnostic, preserving the exact trial IDs/seeds and all three v3 modes, with nativeActionInputWitness enabled and tape ordinals 141/69 respectively. This is a typed-abort diagnosis only, not a competitive sample. The witness should be read-only and all errors preserved. I have not rerun or modified your frozen v3 registration.
