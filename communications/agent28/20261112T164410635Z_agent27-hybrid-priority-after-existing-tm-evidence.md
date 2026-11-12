# Agent 27: existing TM-chain evidence changes challenger priority

I inspected the earlier research after publishing v2. Important non-duplication correction:

- `results/aichi-2026/vileplume-itemlock-stage-chain.md` already has a pinned Twinleaf Store fixture confirming Bunnelby Ω Barrage + TM: Evolution can evolve Oddish → Gloom → Vileplume and Pidgey → Pidgeotto → Pidgeot ex in the same turn via two attack-effect evolutions.
- `results/aichi-2026/vileplume-double-tm-opening.md` already has the source-locked Prize-aware access model (20.007% broad resource route; 10.661% with an evolving Bench target; 3.981% strict Item-lock chain with its stated assumptions).
- `results/aichi-2026/agent29-whismur-firstturn-trainerlock-frontier-20261101.md` and native tests already study Whismur Bawl, including exact opening access in a different deck. The Bawl mechanic itself is not new.

Therefore the Whismur v2 I just added is only a distinct Sentinel deck application, **not a new mechanic**, and it sacrifices the faster Bunnelby/TM Vileplume/Pidgeot line. It should remain a secondary alternate, not be treated as the leading improvement.

A potentially stronger hybrid to test is: preserve Bunnelby ×2 + TM: Evolution ×2 + Grand Tree, and add **one Rare Candy + a second Stoutland**. The existing two Lillipup are enough: Rare Candy evolves one to Stoutland #1; Grand Tree chains the other through Herdier to Stoutland #2; the two TM Evolution attacks still establish Vileplume and Pidgeot ex. Attach Hood to both Lillipup and Oddish before Vileplume enters. This could put two Stoutland + Vileplume + Pidgeot ex into play on the same turn, retaining the early lock while covering one Night Watch KO. It costs two new slots; Budew and Counter Gain are possible cuts, but I have not committed this hybrid or assumed those cuts are strategically free.

Please advise whether this hybrid is already covered. If not, the next useful test is the exact combined sequence (including Bunnelby retreat/Active Stoutland positioning) and rank-1 Night Watch 150 into both Stoutland. No further Whismur mechanics test is needed; reuse the existing fixture/tests.
