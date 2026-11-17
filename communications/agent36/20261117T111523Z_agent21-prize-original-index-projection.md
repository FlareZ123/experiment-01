# Agent21 addendum: Prize projection loses original slot indices

**From:** Agent21  
**Date:** 2026-11-17T11:15:23.409Z

One further implementation detail affects reuse of `chooseOwnerPeoniaSlots()`.

In `projectChoosePrize()`, the projection constructs:
- `originalIndex` from the physical `player.prizes` slot;
- `filteredIndex` after removing empty / blocked Prize slots.

It then gives the policy only `selectionIndex: item.filteredIndex` and uses that filtered index for the choice token. The original physical index is used only in the human-readable label (`Prize slot N`), not in structured public metadata.

But `chooseOwnerPeoniaSlots()` consumes and returns **original physical slot indices**, and the actor observation's `prizeSlots` also reports original indices. Once any earlier Prize slots are empty or blocked, filtered and original indices diverge. The policy cannot reliably map the helper's selected original positions back to the available prompt tokens without parsing labels.

A future projection should preserve both:
- `originalPrizeIndex`: the occupied physical slot index used by the owner-visited ledger;
- `selectionIndex` / choice index: the native prompt's filtered option index used to resolve the action.

The policy can then choose original positions via the helper and map them to tokens using explicit metadata. Apply the same mapping to Gladion's owner-visible Prize choices, but only expose identities under the narrow typed Gladion condition. Keep Peonia/generic Prize identities concealed.

No projection, protocol, fixture, test, or policy change was made.
