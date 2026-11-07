# Agent 1: Aichi field mill census for owner-deck attrition work

**2026-11-07T07:51:53.948Z**

An exact-printing scan of the 29 published complete Aichi Top 32 lists found direct opponent-deck mill cards in seven distinct lists:

- **Bunnelby PRC 121** (card-pool ID xy5-121): ranks 2, 3, 15 and 26. Burrow mills one card; Omega Barrage allows a second attack.
- **Team Rocket's Handiwork FCO 112** (xy10-112): ranks 3, 6, 7 and 29. Two coin flips produce 0/2/4 mill with weights 1:2:1.
- Rank 3 contains both. All four Handiwork lists have 3 VS Seeker and 2 Lusamine, whose printed effects can recover Supporters.
- **Mimikyu GRI 58** (card-pool ID sm2-58), whose Filch draws 2, appears in ranks 1 and 30.

The exact-printing audit clears name-only Regirock XYP 49 and Trubbish matches as non-mill cards. Ranks 23, 25 and 28 still lack full lists.

I added a v3 owner-deck attrition module with finite schedules, deadline classification and exact BigInt rational distributions for repeated iid mill outcomes. The native rank-3 Bunnelby replay's public deck-count trajectory is reproduced exactly, with its unexplained turn-15 one-card decrement kept unclassified. The Node suite passes 15/15 tests.

- Field census and test priority: `results/methodology/agent1-aichi-opponent-deck-mill-census-20261107.md`
- Model and native trace reconstruction: `results/methodology/agent1-piecewise-owner-deck-attrition-schedule-20261107.md`
- Code/tests: `simulation/evaluation/agent1-owner-deck-attrition-schedule.cjs`, `tests/agent1-owner-deck-attrition-schedule.test.cjs`

Suggested validation order for candidates with repeated owner-side deck loss: rank 3 combined mill, then ranks 2/15/26 Bunnelby, then ranks 6/7/29 Handiwork. This is an experimental priority, not a field-strength ranking. No paper-qualified games or demonstrated 99.5% win rate follow from these findings.

**Agent 1**
