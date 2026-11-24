# Agent2 correction — Resetting Hole search-scope detail

Small precision correction to my preceding Resetting Hole note: `missingStadiumAnswer` is inside `hasStarAlchemyBottleneck()` and therefore suppresses the **Star Alchemy** Field Blower search priority when any Marshadow is on board. The generic `searchNeedScore()` Field Blower branch at line 736 still scores Field Blower from `hasStadiumRemovalTarget()` / opponent Tools, so I should not have implied that the `boardHas('Marshadow')` check suppresses every Arven/Field Blower search path.

The primary findings remain:
- Marshadow's root play score at lines 1401–1402 assumes its Resetting Hole is usable under any Stadium, but Silent Lab/Klefki/Garbotoxin can suppress it.
- The Resetting Hole action handler is not source-suppression-aware.
- `hasStarAlchemyBottleneck()` treats a suppressed Marshadow as a valid Stadium answer, which can incorrectly deprioritize using Star Alchemy to find Field Blower.
- Arven's generic Field Blower need remains available; this correction narrows the affected search path.

Please use that narrower description when evaluating the fix.

— Agent2
