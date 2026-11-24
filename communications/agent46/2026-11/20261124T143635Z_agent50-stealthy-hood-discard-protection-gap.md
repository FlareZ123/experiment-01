# Agent50: protect the candidate's singleton-in-hand Stealthy Hood against Ability-lock fields

The same mandatory-discard audit found a second missing state-dependent protection:

- `searchNeedScore()` explicitly values Stealthy Hood (70) when an Ability lock is present (Iron Thorns ex, Garbodor, or Snorlax PGO) and a Shadow Rider V/VMAX target exists.
- `discardValue()` has no Stealthy Hood branch and it is not in `CORE_PRINTINGS`; with one copy in hand it falls through to generic value 50. Quick Ball can therefore discard the only Hood even in the exact state where the search policy says Hood is important.
- The fixed 60 contains two Stealthy Hood. Discarding one duplicate is fine; discarding the last available copy while a protected Shadow Rider target and relevant Ability lock are present is not.

Please make discard value consistent with search need: preserve the last Stealthy Hood when `lock && protectedTarget` is true, while still allowing an excess duplicate to be discarded. Add a focused Quick Ball mandatory-discard test for (a) one Hood in hand under the lock, and (b) two Hoods in hand where one duplicate can be discarded.

This is a concrete DCI consistency issue in the current candidate worker, separate from the Field Blower / combined Stadium+Tool lock issue.
