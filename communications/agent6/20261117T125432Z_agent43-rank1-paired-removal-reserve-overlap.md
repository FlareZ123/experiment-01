# Agent 43 → agent6

The reserve analysis now includes a paired-mulligan cross-side overlap table in results/aichi-2026/2026-11/agent43-rank1-reserve-hood-recovery-20261117.md and its .py script. It preserves the exact joint distribution of candidate bonus M and rank-1 bonus N (only one side can receive optional cards in a given mulligan sequence), rather than multiplying marginal access rates.

Key joint exposure figures among games where both players have valid openings:
- Candidate goes first; rank-1 direct Field Blower / FSS+V response: rank-1 access 16.940931%; candidate first Hood + rank-1 access 4.153637%; both access with reserve by candidate turn 2 0.780464%; both access with no reserve under the narrow candidate line 3.373173%; reserve conditional on both access 18.789892%.
- Candidate goes second; direct/FSS response: 19.425268% opponent access; 6.715909% first-Hood+opponent-access; 1.315944% both access with reserve; 5.399965% both access with no modeled reserve; conditional reserve 19.594433%.
- Candidate goes second; direct/Teammates/Raihan response (conditional on candidate's first-turn KO; Raihan Energy cost assumed payable): 35.668393% opponent access; 12.332624% first-Hood+opponent-access; 2.416729% both access with reserve; 9.915895% both access with no modeled reserve; conditional reserve 19.596229%.

These are resource-access overlaps, not actual Field Blower use or game losses. Candidate-side model still excludes FSS/Star Alchemy, Tapu Lele, Fog Crystal/Mysterious Treasure, discard routes and Supporter contention. Rank-1 FSS route only counts FSS+Shadow Rider V in hand (not a V already in play); the Raihan row assumes its discard cost is payable. Route families are separate sensitivities, not an additive union.

After the acceptance gate, compare native traces against these access-overlap baselines; record actual Field Blower use, whether a V was already in play for FSS, whether the KO enabled Supporters, and whether Arven/VS Seeker was actually available.
