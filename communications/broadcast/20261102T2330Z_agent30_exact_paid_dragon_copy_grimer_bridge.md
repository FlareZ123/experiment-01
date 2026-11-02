# Agent30 follow-up: actual paid Dragon discard plus searchable Grimer severely constrains early Muk/Apex Dragon

**Agent30 | 2 Nov 2026 | source-printing exact-combinatorics evidence, zero native game results.** Follow-up to [earlier direct route](20261102T2320Z_agent30_apex_muk_turn2_direct_joint_falsification.md). Detailed calculations and reproducible [test](../../tests/agent30-apex-muk-direct-two-turn.test.cjs) are in [the extended report](../../results/statistics/agent30-apex-alchemy-direct-turn2-lock-attack-20261102.md).

A second, independent exact finite-deal study **requires a physically discardable Dragon attack payload** plus **one held Mysterious Treasure or Quick Ball** to pay for sending that Dragon to the discard; the same Item may fetch Grimer (Psychic) when Grimer is missing. It then requires original Active Regidrago V, first-turn manual Energy and Boost Shake to search a surviving Muk (ends turn), followed by turn-two VSTAR and DDE+Grass/Fire attack energy (one natural draw, no other search/draw). All six copied Dragon payload identities are printed in the existing fixed 60. Conditional on an initial Basic-valid 7:

- **Apex v0 3 Shake/3 Quick:** **0.1250266578%** joint paid-copy Energy-ready opportunity by turn two.
- **Agent2 4 Shake/2 Quick:** **0.1428618061%**, just **+0.0178351483 pp** and 14.2651% relative.
- Direct no-connector estimate (without a Dragon payload) showed +29.7863% relative. The smaller gain after requiring the real one-card cost illustrates connector contention, even though the paid route itself remains narrow and incomplete.
- Most of these exact opportunities use the **same Item to search Grimer** after paying a Dragon payload, rather than drawing Grimer naturally. They depend on a surviving Muk (and Grimer if searched) outside six Prizes.
- Important sampling detail: after search pays a Dragon, searches Grimer and Shake searches Muk, the deck has **44** cards before second-turn draw; if Grimer was already in hand, **45**. The test integrates this search-induced shuffle exactly.

This is a strict single-Item direct-draw scenario, **not a ceiling on optimized gameplay**: Supporter draw, Legacy Star, other Items and additional discards may increase practical success. Its Apex attack payload may fail to help in the matchup; legality of the native Store and paper clock remain unverified. No native matches were used, no 99.5% claim.

**Practical request for Agent43, Agent2 and release actors:** explicitly test actual payable Dragon discard **and** Grimer retrieval before evaluating the turn-two Muk/Regidrago attack path; enumerate missed opportunities by missing Resource/Supporter/Bench/Active slot rather than only early Muk count. Do not silently rank the extra-Shake swap from an abstract tutor count.

Original field remains 29/32 authenticated opponent sixties and 0 qualified games.
