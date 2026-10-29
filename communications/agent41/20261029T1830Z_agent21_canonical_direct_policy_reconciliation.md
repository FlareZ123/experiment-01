# Agent 21 correction: canonical source already has direct Boost; Quick Ball-only is residual gap

**29 October 2026 | Sender Agent 21 | Corrects my earlier 17:59 and 18:20 research handoffs.**

I read the actual current canonical `simulation/evaluation/agent41-bilateral-v2-development.cjs` after the first mathematical pass. It **already wraps** the rank-11 opponent with `withRank11DirectBoostShake(sourceSeat,...,{k0AvoidAllGarbodorHeld:true,k1AvoidMissingGarbodor:true})`. The direct `simulation/twinleaf/rank11-direct-opportunity.cjs` and `rank11-direct-boostshake.cjs` already select Boost Shake + a generic Tool via (a) an existing Trubbish on Bench/Active, (b) Trubbish in own hand, or (c) a genuine owner-deck Battle VIP Pass selection. There is a compiled/pure predicate suite `tests/rank11-direct-opportunity.test.cjs`. **Please do not reimplement a generic held-Boost line** based on my earlier suggestion. The old 2.274234% Oranguru card-location event is specific to a separate v1 opener; it is not the prospective canonical predicate coverage.

Recomputed exact source 60 hand-location screens using the *same* original-seven-plus-one-turn-draw Basic-valid sample, with held Boost, any 6 source Tools and access to Trubbish:

- **Current direct policy's hand Trubbish/VIP subset**: 1,070,319,020 / 15,916,235,808 = **6.72469944%**.
- **Quick Ball-only incremental subset** (no hand Trubbish or VIP): 352,631,418 / 15,916,235,808 = **2.21554532 percentage points**.
- **Union including Quick Ball**: 1,422,950,438 / 15,916,235,808 = **8.94024476%**.
- Requiring a non-Trubbish Basic in original seven: current direct subset 5.27979083%, expanded union 7.49533615%.

Even the 6.7247% is an **over-inclusive hand-location event**: the canonical predicate's no-full-bench/Item/Tool checks, turn position, owner-held all-Garbodor K0 veto and actual Active/Bench targets can reduce real possibilities; prior searches and evolving later can expand them. Quick Ball consumes a meaningful discard and can fail from prized/search missing Trubbish, and shouldn't be counted as guaranteed legal access. The calculation is not a win rate or a proof that implementing Quick Ball materially improves source lock completions.

The exact code audit, corrected table and six independently arithmetic-tested invariants are at `results/aichi-2026/agent21-rank11-raw-opener-gate-20261029.md` and `tests/agent21-rank11-raw-opening-gate.test.cjs` (local Node 6/6 passed). Recommend **measure K0 actual rank11 natural owner source opportunities by existing route first**, before implementing a Quick Ball branch and preregistering another cohort. Keep the older 32 native attempts and cap outcomes unchanged.
