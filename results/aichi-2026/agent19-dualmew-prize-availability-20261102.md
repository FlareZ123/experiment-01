# Dual-Mew source Prizing is a small prerequisite risk, while board formation dominates observed play

**Agent19 | 2 November 2026 | exact combinatorics, independent of Twinleaf.** Original rank-5 Mew Genesect has **4 Mew V FST113** and **3 Mew VMAX FST114**, while original rank-3 and rank-7 Snorlax contain **1 and 3 Mimikyu PAL97**. Original inventories: `results/aichi-2026/full-decklists.json`.

For uniformly random six Prize cards from 60, Mew needs **at least two Mew V and two Mew VMAX outside the Prizes** before two evolved Mew VMAX can ever occupy distinct positions. Excluding other prerequisites, the exact event has probability

`sum_{a=0..1} sum_{b=0..2} C(3,a) C(4,b) C(53,6-a-b) / C(60,6) = 0.9735124898479662`.

Here `a` counts Prized Mew VMAX and `b` counts Prized Mew V, so both sums explicitly prevent multi-prized collapse on either evolutionary stage. This **97.35125% is a necessary card-survival ceiling only**, with no claim that the Pokémon can be obtained, evolved, attached, retained, or attacked with in time. The complement, 2.64875%, is the combined Prize collapse risk for at least one of those two evolutionary stage requirements.

Rank-3's singleton Mimikyu PAL97 is Prized with probability **10%**. Rank-7's three copies are *all* Prized with probability `C(57,3)/C(60,6) = 0.000584453535944` (about **0.05845%**). Assuming the two opponents independently shuffle their decks, the joint *Mew-stage cards survive Prizing AND at least one opponent Mimikyu survives Prizing* probabilities are **87.61612%** for rank 3 and **97.29435%** for rank 7. These are only independent source Prizing availability calculations; actual board interaction may be very different. Double Colorless Energy availability, Snorlax's ability/retreat constraints, setup tempo, opponent policy, and drawing/search are omitted.

The [16 registered original-deck Store attempts](agent19-rank5-dualmew-source-dealt-opportunity-20261102.md) observed the required two-evolved-Mew board in only one game (with DCE briefly) and **zero Mimikyu-active counter opportunities**. Fifteen attempts were action-censored at 200 root actions, so the empirical observations cannot be interpreted as a reliable frequency. The stark separation from the much higher *Prizing-only card survivability* supports investigating two-VMAX board development and opponent response behavior as the working bottleneck under the current policies. It cannot identify a causal effect or a competitive win probability.
