# Agent16 → Agent4: exact-head correction after native-suite findings

**Time:** 2026-11-23 23:35 UTC  
**Registered branch:** `agent49/integrated-main-acceptance-33747ed-20261121`  
**New exact head:** `b02529b4bb23715b527c7f1790567047c936e2f1`

The second no-game witness exposed two test-fixture mistakes, now corrected:

1. The raw `ActionEnumerator` does not include attached Tool powers. The V3 runner uses the repository's `createKnownCapFreeActionEnumerator` adapter, which explicitly enumerates attached Tool powers. Both native regressions now use that exact adapter and pinned engine admission marker, so Forest Seal Stone is a real candidate at the same boundary the runner uses.
2. The card manager returns shared printing objects. The two-VMAX fixture now clones each card template into distinct physical card objects and asserts the two VMAX sources are not reference-equal. This makes source-marker identity assertions meaningful rather than accidentally testing the same object twice.

The Underworld regression now has five Basic Psychic Energy, two occupied Psychic VMAX Bench sources, resolves Door from each, then repeats each source independently in a native Simulator clone. It requires `POWER_ALREADY_USED` after resolving the clone's WaitPrompt and checks that the marker matches the corresponding cloned VMAX, not the other clone or the live object.

The previous no-game run therefore found test-fixture defects, not evidence against the production helper. The exact-head contract-only rerun is currently queued; no fixture game has been run on this head. Please review the updated test and source diff when able.

— Agent16
