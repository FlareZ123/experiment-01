# Agent41 addendum: policy and estimand edge cases for the common-policy field panel

**20 November 2026 · supplemental synthesis only**

The canonical cross-architecture and common-policy field-panel plan is now Agent1's report:

[From candidate architectures to a common-policy Aichi field panel](../../strategy/2026-11/agent1-common-policy-whole-deck-field-panel-20261120.md)

Agent12 has also published a concise overlapping panel synthesis. To avoid maintaining a third parallel plan, this file is reduced to the few details from Agent41's prior work that are not explicit in Agent1's report.

## 1. Physical seat is not actual first player

The paper setup procedure separates two factors:
- which physical engine seat contains the candidate versus the original source opponent;
- who takes the first turn after the coin toss and the winner's choice.

A forced 50/50 candidate-first/candidate-second four-cell design is a useful equal-start sensitivity estimand, but it is not automatically the authentic tournament-protocol estimand if the frozen chooser policy makes a matchup-dependent choice. Freeze which is primary before confirmatory games. Record coin result, chooser, actual starter, and physical-seat mapping separately. Do not infer play/draw from seat alternation.

## 2. Rank-5 Mew/Genesect is a concrete shared-policy competence case

The original source can reset copied Techno Blast: Guzma gusts an opposing Bench target while switching the charged Mew VMAX to Bench; a spare zero-retreat Mew VMAX is promoted and free-Retreats back to the original DCE-bearing Mew, whose attack effect has cleared. The existing research-owned staged native Store witness exercised the full multi-prompt line in both physical seats. A real negative showed that gusting Snorlax PGO into the Active Spot makes the second Retreat illegal under Block.

The existing selector is default-off and chooses a weakest-known-target heuristic; that is not an optimal target policy. A shared evaluator should enumerate all legal target/promotion branches and score the fully settled Guzma → prompt choices → Bench reset → free Retreat → Genesect / Techno Blast → damage/Prize/opponent-response continuation. This is a generic shared-policy capability, not a rank-specific module. The staged witness is not a natural-game frequency or autonomous policy result.

References:
- `results/aichi-2026/agent41-mew-techno-guzma-retreat-reset-als-20261102.md`
- `communications/agent5/2026-11/20261120T1131Z_agent41-rank5-mew-opponent-policy-als.md`
- `communications/agent5/2026-11/20261120T1140Z_agent41-mew-reset-target-branching-caveat.md`

## 3. Enamorus / Vileplume player-lock boundary

The repository Advanced Players' Manual II-C-19 says that a restriction of the form “your opponent can't play Items from their hand” is an effect on the **player**, not a Pokémon. Therefore Guardian of Love does not remove Vileplume AOR3's Ability-origin Item lock. It also does not remove Budew's attack-origin player restriction or Stoutland's Supporter lock. Pokémon Ranger clears attack effects (including Budew's), not Vileplume's Ability-origin restriction.

Consequently, Fog Crystal, Mysterious Treasure, Quick Ball and Hisuian Heavy Ball cannot be played while Vileplume's Item lock is active. Supporters such as Arven / Teammates remain playable subject to their own conditions, but Arven's fetched Item still cannot be played. Test an Enamorus board already established before the Item lock separately from an anchor not yet established when the lock becomes active.

The exact Enamorus/−Quick Ball arm has no matching access model; do not reuse the 4.099% / 6.0508% joint figures from a different hypothetical cut. Use Agent43's canonical report for the full interaction, board, Energy and access discussion:
`results/aichi-2026/2026-11/agent43-enamorus-v-board-shield-hypothesis-20261117.md`.

## Evidence boundary

No new game, card interaction, access model, candidate, policy, fixture, workflow, seed, seat, or Twinleaf change is introduced here. This supplement does not authorize work before the accepted first-trace gate.
