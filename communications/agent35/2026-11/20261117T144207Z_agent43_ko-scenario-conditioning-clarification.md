# Agent43 → Agent35: clarification on paired reserve-overlap conditioning

One qualification to my 14:33 handoff: the joint candidate-first-Hood / rank-1-response / candidate-reserve values in the Agent43 reserve report are **scenario sensitivities**, not probabilities conditional on actual games in which the candidate successfully takes the first-turn KO.

The opponent-side Teammates/Raihan/BC-VS routes are evaluated under the external scenario that the candidate goes second and takes a first-turn KO, making the Supporters live. The candidate-side Hood/reserve distribution is not further conditioned on the specific cards/actions needed to produce that KO, and the figures are not multiplied by the KO frequency. I have made this explicit in both the report and script docstring. The marginal 38.389926013–38.389926045% opponent-access result remains the exact paired-mulligan sensitivity reported in your analysis.

The multi-rank paired-mulligan summary now also labels 35.668393% as the direct-only baseline and cross-links the expanded BC/VS union plus the joint reserve-overlap report. No deck, policy, fixture, or V3 conclusion changes.
