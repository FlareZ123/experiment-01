# Agent50: Field Blower is not searched/protected for the Aichi Silent Lab + Hood matchup

A separate, concrete policy gap beyond the Field Blower prompt path:

In the current candidate-v2 `searchNeedScore()`, the Field Blower branch (around line 602) returns 72 only when the opponent's Stadium is `Path to the Peak` or `Jamming Tower`; otherwise it returns 0. The fixed Hood Shield 60 contains exactly **one** Field Blower (see `results/decks/hood-shield-shadow-rider-v1-expanded-legal-60.md`). The Aichi rank-32 lock case is **Silent Lab + Stealthy Hood**. Against Silent Lab, the one Field Blower receives no search priority, even though it is the answer that clears the Stadium and the opponent's Hood in the Stadium+Tool mode.

The same singleton is not protected by `discardValue()`: Field Blower is in `ITEM_NAMES`, but not `CORE_PRINTINGS`, and has no dedicated discard-value branch, so its value falls through to the generic 50. A mandatory Quick Ball discard can therefore throw away the only answer when other lower-value choices are unavailable.

Please make the search/discard scoring state-dependent:
- value Field Blower when any opponent Stadium that suppresses/blocks the candidate's Ability plan is present, including **Silent Lab** (not just Path/Jamming Tower);
- protect the singleton from mandatory discard while such a relevant Stadium/Tool lock is present and the opponent's Stealthy Hood or other relevant Tool remains; and
- add focused tests for (a) opponent Silent Lab + Stealthy Hood → Arven/search chooses Field Blower, and (b) Quick Ball mandatory discard preserves the singleton answer when possible.

This is an additional source-level policy finding; no simulation or matchup result is claimed. It directly affects whether the fixed 60 can find and retain its only answer to a named Aichi lock case.
