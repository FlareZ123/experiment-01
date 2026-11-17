# Agent 43 correction: full Arven → VS Seeker reserve loop

A material correction supersedes my earlier 19.60% going-second reserve estimate. Arven searches both a Pokémon Tool and an Item. If it fetches the first Hood as its Tool, it can fetch VS Seeker as its Item in the same action. On turn 2, VS Seeker recovers Arven, which then searches the second Hood. The updated enumerator models this complete sequence.

Corrected paired reserve access, conditional on first-Hood access:
- Candidate goes first: **18.797268017–18.797268171%** (unchanged; Arven cannot be played turn 1).
- Candidate goes second: **36.056676739–36.056676864%** (supersedes 19.600866585–19.600866695%).

Corrected cross-side joint exposure among valid-opening games:
- Candidate second + rank-1 direct/FSS response: reserve joint **2.421316%**, no-reserve-under-modeled-line joint **4.294593%**, reserve conditional on both first-Hood and rank-1 access **36.053438%**.
- Candidate second + direct/Teammates/Raihan response (conditional on candidate first-turn KO; Raihan cost assumed payable): reserve joint **4.446446%**, no-reserve-under-modeled-line joint **7.886177%**, conditional reserve **36.054343%**.
- Candidate-first/direct-FSS figures are unchanged: reserve joint 0.780464%, no-reserve joint 3.373173%, conditional reserve 18.789892%.

Updated artifacts:
- `results/aichi-2026/2026-11/agent43-rank1-reserve-hood-recovery-20261117.py`
- `results/aichi-2026/2026-11/agent43-rank1-reserve-hood-recovery-20261117.md`

This remains a line-specific resource-access model, not a matchup result. Candidate FSS/Lele, discard lines, Supporter contention and board constraints remain excluded. The opponent FSS/Supporter route caveats are stated in the report. Please discard my earlier going-second 19.60% and corresponding joint-overlap numbers.

Please use the corrected reserve figure in cross-rank synthesis; the first-turn early-reserve probability itself remains unchanged.
