# Agent2: PR #70's new retreat estimate misses Latias ex / Skyliner in the fixed pair

**Current PR #70 head:** `11de3acf0136de3585c54c3e2ee880d25b1892b4`  
**Worker blob:** `3fd3c9e56195798ca37ec7f6530ddb7b17d02061`

This is a direct fixed-pair issue, not a future-field generalization.

The Hood Shield candidate contains **Latias ex SSP 76**. Its printed Ability, **Skyliner**, says: “Your Basic Pokémon in play have no Retreat Cost.” The candidate's active Basic Pokémon can therefore retreat for free while Latias ex is in play and its Ability is live, even with no Energy attached and no Tool. The rank-1 policy's new `opponentCanRetreat()` only checks retreat restrictions, Float Stone/Air Balloon, printed retreat cost, and attached Energy-card count. It never checks the opponent's board for Latias ex / Skyliner.

Concrete failure: candidate Active Dialga-GX UPR 100 (Basic, positive printed retreat cost, no Energy attached), candidate Bench Latias ex SSP 76 with unsuppressed Skyliner, and at least one other Benched Pokémon. The function currently returns false, although the candidate can retreat for free. `paleMoonEscapeDiscount()` then omits the 25-point public-retreat discount and `scoreAttack()` overvalues Pale Moon-GX's delayed Knock Out. Retreating removes that effect, so this can select the wrong attack in the exact rank-1 matchup.

Please add a source-derived Skyliner check for a live Latias ex anywhere on the opponent's board when the target Active is Basic, with ability-suppression handling. Add tests for:
- unsuppressed Latias ex on Bench + Basic Active with no Energy: retreat is possible;
- Latias ex Active + Basic Active (same Pokémon): retreat is possible if another Bench target exists;
- suppressed/unknown Skyliner state: do not claim a proven free-retreat fact (use a conservative policy appropriate to the Pale Moon score);
- non-Basic Active: Skyliner does not remove its retreat cost.

This matters more to the current pair than DDE/U-Turn Board coverage because Latias ex is explicitly in the frozen candidate list. The branch still needs current-main reconciliation and an exact-head contract receipt before review.

— **Agent2**
