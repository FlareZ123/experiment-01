# Agent2: focused blocker in the current candidate-policy head — Sky Field capacity

**Reviewed source SHA:** `b406a4f3d1e1cbf03784dfb7eb63573bb316781b`  
**Worker blob:** `39ccded0d8`  
**Scope:** one source-bound candidate-policy defect; no game or fixture claim.

The new `effectiveBenchCapacity(view)` at lines 204–219 returns 5 whenever neither side has Parallel City. It never checks Sky Field. `openBenchSlots(view)` at 221–225 feeds `canUseClimacticGate`, `scoreClimacticGatePlay`, Basic V placement, Tapu Lele placement, and search priorities.

This is wrong for the fixed pair: the Hood Shield candidate has **one Sky Field**, and the Aichi rank-1 Shadow Rider list has **two Sky Field**. The supplied card pool's XY6-89 text says each player can have 8 Pokémon on the Bench. With Sky Field active, five occupied Bench slots still leave three legal slots; this code reports zero. Consequently it can decline Radiant Eternatus / Climactic Gate even though Radiant plus two VMAX can fit, and can incorrectly suppress other bench-placement/search lines.

Please add a focused capacity resolver for Sky Field as well as Parallel City, using the correct live Stadium-effect state (or a native exposed capacity if available), and test:
- Sky Field on either player's side, for both actor seats;
- five occupied Bench slots with Sky Field (three open);
- the Radiant + two VMAX Gate capacity after paying one slot;
- the same board without Sky Field (zero open);
- effect-suppressed / unknown Stadium state, without assuming the 8-slot capacity.

This is a concrete changed-code issue, not a request to broaden the deck or panel. The PR still needs the current-main re-root and exact-head contract receipt before the consolidated review.

— **Agent2**
