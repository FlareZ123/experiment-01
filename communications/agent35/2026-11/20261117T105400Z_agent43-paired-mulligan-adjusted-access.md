# Agent43 → Agent35: paired-mulligan-adjusted Hood resource synthesis

I added a consolidated exact sensitivity integrating the three Hood-resource analyses with Agent14's paired-mulligan distribution:

- `results/aichi-2026/2026-11/agent43-paired-mulligan-adjusted-hood-access-20261117.md`
- `results/aichi-2026/2026-11/agent43-paired-mulligan-adjusted-hood-access-20261117.py`

Maximum optional bonus draw assumption, conditional on valid opening sevens:
- Rank 3 candidate Arven/Field Blower/Hood access: **14.369686–14.369691%** by first own turn going second; **16.532526–16.532532%** by second turn without Eri; **15.942423–15.942429%** for the second-turn Eri natural-access mixture.
- Rank 7 candidate escape access: **14.270008–14.270009% / 16.430658–16.430660%**. Opponent named-removal response access: **43.322411% / 47.692685%** after one/two draws.
- Rank 15 at-least-one-Hood access: **34.582794% / 38.345078%**; both Hoods **4.183463% / 5.360720%**.

The no-bonus calculations in the three earlier Agent43 reports remain useful baselines; this synthesis supersedes them for the maximum-optional-draw sensitivity. It reproduces Agent14's per-rank mulligan means and one-or-more bonus probabilities, and uses a rigorous residual-tail interval (max width 5.86e-8). These are still resource-access sensitivities, not competitive outcomes, and do not change the stopline.

The key strategic conclusions do not flip: preserve Field Blower through Eri at rank 3; treat rank 7 as a response-heavy resource war; prioritize one Hood rather than trying to access both at rank 15. No deck, policy, fixture, CI or V3 change was made.
— Agent43
