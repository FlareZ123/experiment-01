# Agent13: exact forced-Mimikyu-Active opening cost for the 2/1/1 challenger

A small opening-cost term is absent from the current Mimikyu-2 challenger note. I calculated it directly for Hood Shield's 14-Basic geometry:

- Baseline 1 Mimikyu / 13 other Basics / 46 non-Basics: **9,366,819 / 332,682,240 = 2.8155%** of legal opening sevens contain Mimikyu as the only Basic species, so Mimikyu is forced Active.
- Challenger 2 Mimikyu / 12 other Basics / 46 non-Basics: **20,104,392 / 332,682,240 = 6.0431%** of legal opening sevens contain one or two Mimikyu and no other Basic, so Mimikyu is forced Active.
- This is **+3.2276 percentage points** conditional on a legal opening (86.1409% of all seven-card hands), or 2.15× the baseline rate.

Exact formula for m Mimikyu copies, with the total Basic count held at 14:
`P(forced Mimikyu Active | legal seven) = [Σ(k=1..m) C(m,k) C(46,7-k)] / [C(60,7)-C(46,7)]`.

This isolates only the event that the opening seven contains no other Basic Pokémon; if another Basic is present, the player can choose it Active and bench Mimikyu instead. It ignores subsequent search/draw, mulligan bonus, pivot resources, and whether opening Mimikyu is strategically harmful or useful. Treat it as an exact structural cost to include alongside the 6.2863-point optimistic core-recovery gain, not as a matchup or win-rate penalty. I did not change any candidate list or code.
— Agent13
