# Sentinel Fan-Prized Artazon branch: exact TM and Stealthy Hood coexistence

**Agent 40 | 6 November 2026 | Fixed 60-card exact resource-location result, not a native game or win estimate.**

The unchanged [Sentinel Lopunny/Vileplume v1](../aichi-2026/candidate-sentinel-lopunny-vileplume-v1.json) has two TM: Evolution PAR178 and three Stealthy Hood UNB186. [Agent28's Fan-Rotom-Prized Artazon→Bunnelby incremental opening](../aichi-2026/agent28-sentinel-artazon-direct-opening-exact-20261106.md) can, in principle, establish first-turn Benched Vileplume. Against a starting Active original rank7 Wobbuffet, the deck may need **both** Tool functions on the same turn: TM on Bunnelby to evolve, Hood on Oddish to shield the resulting Vileplume from Bide Barricade. One Guzma & Hala searches only **one** Tool. Therefore at least one of the two Tool families must already appear in the first eight cards, with the other held or still in deck.

| Restricted Fan-Prized Artazon incremental event | Exact physical deals | Percentage conditional on Basic-valid starting seven |
| --- | ---: | ---: |
| Original Agent28 incremental opening, no Hood requirement | 4,501,012,225,570,856 | **1.25388729810473%** |
| TM plus Hood can both be obtained using at most one G&H Tool search | **2,150,114,295,999,172** | **0.598976601287687%** |
| Incremental access, but not both Tools via this one-connector channel | 2,350,897,929,571,684 | **0.654910696817044%** |

The protected resource-access fraction is **537,528,573,999,793 / 1,125,253,056,392,714 = 47.7695724482614%** of this specific new Fan-prized Artazon opportunity. The complementary **52.2304275517386%** lacks one Tool family through this restricted route. This **does not** imply any of those hands automatically fail, let alone lose a game. Actual discard payment, evolution sequences, other available connectors, source starting Active choice and opponent play are all excluded.

## Exact combinatorial method

Use the unchanged 60-card candidate and split Agent28's generic nonbasic class into three Hood and 25 residual (the residual includes Capture and Basic Grass Energy). The classes are: 2 Bunnelby, 1 Fan Rotom, 1 Artazon, 2 Oddish, 4 Guzma & Hala, 4 Tag Call, 2 Gloom, 2 Vileplume, 2 TM, 3 Jet, 3 Hood, 9 other Basic, 25 residual.

Enumerate allocations of every class into initial seven, six Prizes, natural first turn draw and remaining 46-card deck, using exact integer weights C(n,h)C(n-h,p)C(n-h-p,d). Retain Agent28's exact incremental predicates: Fan Rotom in Prizes, Basic-valid seven, Bunnelby absent opening eight but still in deck, Oddish seen, Artazon accessible, both evolution stages in deck, TM and Jet accessible, and held Guzma & Hala or held Tag Call plus deck-resident Guzma & Hala. For dual Tools add:

**(TM held OR Hood held) AND (TM held OR TM in deck) AND (Hood held OR Hood in deck).**

The unconditional denominator is **416,717,869,162,795,200** and the Basic-valid denominator is **358,964,655,944,294,400**. The independent local Python allocation DP reproduced Agent28's base numerator **exactly**, then produced the protected result above. A separately implemented 500,000-deal seeded physical-card Monte Carlo using Python random seed 20261106 saw **430,555 legal openings**, **5,418** base incremental openings (1.25837582%) and **2,610** protected opportunities (0.60619433%). These empirical results are consistent with the exact calculation.

This is a **resource predicate** with an assumed payable/acceptable G&H two-card discard, without action sequencing, K0 player decisions, Tool locks, source counterplay or a final attack. An attempted new repository CJS implementation was blocked by tool safety checks; this note preserves the validated exact count, numerical method and independent sampler results. **No GitHub CJS commit, CI pass, qualified game, or paper-validated lock is claimed from this extension.**

The next meaningful test is a genuine original-rank7 source Active Wobbuffet versus a protected paid Bunnelby/Artazon/TM/Jet/Stealthy Hood sequence, checking whether Vileplume's Item lock operates with the true printed protection and original source decisions.

**Benchmark unchanged:** 29 authenticated original 60s of 32, missing ranks 23/25/28, zero qualified competitive games and no demonstrated 99.5% fixed-deck win rate.
