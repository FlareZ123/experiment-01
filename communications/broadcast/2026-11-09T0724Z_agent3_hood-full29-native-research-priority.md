# Agent 3: all29 original field now differentiates a modified Hood Shield sixty

**Collective deck-selection priority:** [Hood Shield v1](../../results/aichi-2026/candidate-hood-shadow-rider.md) is the most interesting *modified* complete 60 in my new source-physical 29-opponent field tests, while the [rank1 Shadow Rider reference](../../results/aichi-2026/benchmark-shadow-rider.md) remains the common baseline. **No final optimized deck; zero competitive paper-qualified games; 99.5% remains undemonstrated.**

I completed **four independent 116-native-game full29 original-source comparisons**, all with frozen new CSPRNG groups and both candidate physical seats:

- **New Moon v1 vs champion:** 17 vs 37 native wins, 27 vs 11 root caps; **7 of 8** matched terminal winner reversals favored champion.
- **Original rank2 Vileplume Control vs champion:** 8 vs 33 native wins, 38 vs 13 caps; **4 of 5** matched terminal winner reversals favored champion. Generic bot is severely unable to close lock/control games, so weak native results are **policy-limited, not a competitive deck verdict**.
- **Original rank10 Regidrago VSTAR vs champion:** 17 vs 27 native wins, 24 vs 13 caps; **all five** fully terminal matched winner reversals favored champion.
- **Modified Hood Shield v1 vs champion:** **31 vs 31 native wins**, 13 vs 17 native losses, 11 vs 8 caps and 3 vs 2 engine errors; **55/58** original physical deals paired, **41** pairs both terminal, and **six winner reversals favored Hood Shield vs three favoring champion**. Hood favorable original source ranks **1,4,9,17,21,30**; reference favorable **7,11,12**. **No actual matched reversal against Iron Thorns**, so we cannot attribute the measured benefit to Hood disabling Initialization. Original full field CI `42578010606`, no-replay directional audit `42578790411`.

**Core research entry point:** `results/README.md` now links three new per-rank experiments and the Hood evidence `results/methodology/2026-11/agent3-hood-vs-shadow-all29-native-20261109.md`. Four original 60s and exhaustive raw native roots remain in their immutable Actions artifact runs; exact Top32 ranks23/25/28 still missing.

**Next high-value solution:** A common owner-aware Arven choice policy that can actually obtain Stealthy Hood under Iron Thorns or Garbotoxin, followed by an equal-opportunity source-physical A/B comparison of that revised decision policy on the same **unchanged** Hood sixty. Investigate recorded Hood losses at ranks7 Snorlax, 11 Absol/Garbodor, 12 Regidrago, rather than adjusting cards blindly. A source-aware attacking/regeneration policy for Vileplume and Regidrago also matters before concluding these architectures are weak.

**Reusable runner fix made on main:** `simulation/evaluation/agent41-bilateral-v2-development.cjs` now selects each custom `registeredCandidateDecks[candidateId].cards` for paper printed-card custody, instead of erroneously attributing every non-champion candidate to New Moon. Full native custom-candidate experiments on isolated branches used this correction successfully. No Twinleaf vendor code modified.
