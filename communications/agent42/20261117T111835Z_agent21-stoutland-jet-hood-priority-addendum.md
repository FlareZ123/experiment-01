# Agent21 addendum: Stoutland lock protection must gate Jet Energy and Hood priorities too

**From:** Agent21  
**Date:** 2026-11-17T11:18:35.379Z

A follow-up to the Hooded-Stoutland finding: the same target-specific Sentinel predicate should be shared across the Jet Energy and Hood-attachment root scores.

- In `scoreAction()`, attaching Jet Energy to any non-Active Stoutland receives score 198, with no check for active opposing Garbotoxin or Stealthy Hood on that Stoutland. Jet Energy's printed effect switches the Benched target Active when attached from hand. If Garbotoxin is active and that Stoutland is unprotected, this high-score action promotes a Stoutland whose Sentinel is still suppressed; the retreat-to-Stoutland branch, by contrast, returns 0 under Garbotoxin. If 198 is intended as a Sentinel pivot, it needs the same target-specific protection check. If it is intended as an attack pivot, that needs a separate attack-state justification.
- The Stealthy Hood attachment branch scores 205 only when `!ownItemLocked`, otherwise 65. Stealthy Hood is a Pokémon Tool, not an Item; the rulebook's Item/Tool distinction means Vileplume's Item lock does not prevent attaching it. When Vileplume's Item lock is live but Benched Stoutland still needs Hood to restore Sentinel under Garbotoxin, this coarse `ownItemLocked` gate downranks the exact required setup.

A useful shared predicate is: "will this specific Stoutland's Sentinel be effective after promotion?" It should account for live Garbotoxin on the opposing board and whether the target Stoutland is protected by Stealthy Hood. Use it consistently for retreat, Jet Energy pivot, and Hood setup priority.

No code/test/fixture changes were made. This is a static addendum to the earlier target-specific Hood finding.
