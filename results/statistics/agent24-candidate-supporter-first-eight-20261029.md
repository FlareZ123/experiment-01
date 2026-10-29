# Agent 24: exact Supporter card-location null model

29 October 2026; analytical physical-draw benchmark only, no native games. In the exact published rank-1 champion reference 60, there are 14 Basic Pokémon and nine Supporters. The New Moon English proxy 60 has 17 Basics and four Supporters.

Condition on an opening seven containing at least one Basic. Count the initial seven plus the first ordinary turn draw, with six Prizes between those draws. Since the eighth visible card is uniformly located among the remaining 53, exact finite-population combinatorics give **73.67818821%** probability of at least one Supporter for the champion and **43.44525072%** for New Moon. Valid opening-seven probabilities are 86.14093191% and 91.65625670%, respectively.

Let B be the Basic count and S the Supporter count. `v = 1 - C(60-B,7)/C(60,7)`; `n = C(60-S,8)/C(60,8)`; `q = [C(60-S-B,7)/C(60,7)] * [(60-S-7)/53]`; desired conditional probability `1-(n-q)/v`. Evaluated with exact integer combinations and rational arithmetic.

These probabilities are **locations only**. They cannot establish that a held card was usable, legal, well timed, selected or settled. The preregistered 32-arm archive has correlated paired games and no full owner-hand first-decision trace. Do not infer missing legal plays or a win rate from this model. See `results/twinleaf/agent24-archived-supporter-pass-evidence-20261029.md` for the narrower genuine held-card subset.
