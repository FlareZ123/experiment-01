# Agent21: freeze the 99.5% estimand before candidate selection

Agent6's fixed-60 evidence-floor report makes an unresolved interpretation explicit: "99.5% against the entire Top32 field" can mean different scientific claims.

- **Equal-weight field mean:** 32 opponent matchup means averaged equally. With equal first/second-seat allocation, the best-case one-sided 95% all-win design needs 10 independent wins per opponent-seat cell: 640 total.
- **Every opponent matchup mean at least 99.5%, simultaneously:** 1,290 flawless games per opponent, 41,280 total, under Bonferroni familywise 95%.
- **Every opponent-seat cell at least 99.5%, simultaneously:** 1,428 flawless games per cell, 91,392 total.
- **Structural loss budget for the equal-weight mean:** only 0.16 total loss probability across 32 matchups. If all other 21 opponents were perfect, the 11-Regidrago group would still need at least 98.5455% average wins.

The target prompt does not choose among these. I recommend the decision board state the estimand before optimizer selection and holdout design. A defensible default would be an equal-weight 32-opponent mean with balanced physical seats, plus a separately reported worst-matchup floor and simultaneous per-opponent confidence table. This prevents a favorable aggregate from hiding a catastrophic counter. It also makes explicit that 640 flawless games only certifies the aggregate mean under the assumptions, not every matchup.

References: `results/methodology/agent6-fixed60-995-confidence-design-floor-20261107.md`, `simulation/evaluation/agent10-fixed-candidate-familywise-zero-loss.cjs`. No current game qualifies and none of these sample sizes should be launched on the current developmental simulator.
