# Agent 1: piecewise owner-deck attrition schedules for voluntary draw decisions

**7 November 2026 | Exact deterministic scenario model.** This extends Agent 2's stationary owner-deck horizon formula to explicit per-turn opponent pressure. It supplies a reusable survival-budget component for future Mimikyu Filch policy work.

## Question

How many future owner turns can begin with a successful mandatory draw when the owner voluntarily draws cards and the opponent mills a changing number of cards each turn?

The stationary model assumes fixed voluntary draws and fixed opposing mill every turn. Native Aichi research contains both one-Burrow turns and a selected two-Burrow turn. A schedule model can preserve those differences without assuming that a single observed burst repeats forever.

## Printed-card and field evidence

The supplied English card pool identifies:

- Mimikyu GRI 58 (card-pool ID **sm2-58**), whose Filch attack draws 2 cards.
- Bunnelby PRC 121 (card-pool ID **xy5-121**), whose Burrow attack discards the top card of the opponent's deck. Its Omega Barrage Ancient Trait permits a second attack during the turn.

A programmatic scan of **results/aichi-2026/full-decklists.json** finds Bunnelby PRC 121 in ranks 2, 3, 15 and 26, and the Filch Mimikyu GRI 58 in ranks 1 and 30. This establishes direct name/count relevance across six of the 29 published complete decklists. Ranks 23, 25 and 28 have no full list. The source inventory preserves English display printings; exact Japanese historical printing provenance remains open.

The repository contains two relevant native observations:

- Agent 2's original rank-3 Burrow replay recorded 12 actual Burrow AttackAction dispatches. Each removed exactly one opposing deck card. The source owner declined the optional second attack in that natural trace. The separate ordinary next-turn draw was measured independently. See **results/methodology/agent2-original-rank3-bunnelby-native-burrow-terminal-20261104.md**.
- Agent 6's selected original rank-3/rank-1 counterline settled two Burrows in one turn after a paid retreat. The optional Omega Barrage prompt was offered and accepted, and the opponent answered with Night Watch. The winner and terminal turn remained unchanged. See **results/aichi-2026/2026-11/agent6-rank3-bunnelby-counterline-native-20261106.md**.

These observations ground one-card and two-card opponent-mill scenarios. Future attack frequency remains dependent on board state, payment, survival, restrictions and the opponent's decision policy.

## Model

New implementation: **simulation/evaluation/agent1-owner-deck-attrition-schedule.cjs**.

Each schedule row specifies:

- **ownerDraw**: cards voluntarily drawn by the owner during that owner turn.
- **opponentMill**: cards milled by the opponent before the next owner turn.

After both effects, the model applies the next mandatory owner draw. A future owner turn counts only when at least one card remains for that draw. A finite schedule can be followed by a stationary tail, such as repeated Filch, repeated Pass, one Burrow per opponent turn, or two Burrows per opponent turn.

The function returns a per-row public-count ledger, the number of future owner turns that start during the finite schedule, the tail horizon, and the combined horizon. It accepts only card counts and explicit scenario values.

For a stationary tail, the model reduces to Agent 2's closed form:

\[
H(D,f,m)=\left\lfloor\frac{D}{1+f+m}\right\rfloor
\]

Here D is the owner's deck count after the current mandatory draw, f is voluntary draw per owner turn, and m is opponent mill per opponent turn.

## Results

The following table uses stationary scenarios. Filch draws two cards, and Pass draws zero.

| Owner deck D | Opponent mill m/turn | Pass every turn | Filch once, then Pass | Repeat Filch |
|---:|---:|---:|---:|---:|
| 23 | 0 | 23 | 21 | 7 |
| 23 | 1 | 11 | 10 | 5 |
| 23 | 2 | 7 | 7 | 4 |
| 22 | 0 | 22 | 20 | 7 |
| 22 | 1 | 11 | 10 | 5 |
| 22 | 2 | 7 | 6 | 4 |
| 15 | 0 | 15 | 13 | 5 |
| 15 | 1 | 7 | 6 | 3 |
| 15 | 2 | 5 | 4 | 3 |
| 4 | 2 | 1 | 0 | 0 |

The deck counts 23 and 22 are the two first Filch-to-Pass divergence roots in Agent 1's original-rank-11 v15 experiment. The table treats opponent mill as a scenario input. The m=0 column is a no-mill comparison, while m=1 and m=2 represent one or two settled Burrows per opposing turn.

At D=23 and m=2, one Filch followed by Pass has the same whole-turn budget as passing immediately: seven future starts. Repeating Filch reduces the budget to four. This integer boundary illustrates why a single-action comparison can miss the cumulative cost of a repeated draw policy.

A piecewise schedule captures a short burst. At D=15, assume the opponent settles two Burrows during the current opposing turn and applies no further mill afterward:

| Owner policy after current root | Future owner turns that start |
|---|---:|
| Filch every future turn | 4 |
| Pass every future turn | 13 |
| Filch now, then Pass | 11 |

The schedule explicitly represents the observed two-Burrow capability while leaving future opponent actions open. The three values are conditional survival budgets. They do not evaluate the cards Filch could find, alternative attacks, Prize progress or the official match clock.

## Reproduction

- Implementation: **simulation/evaluation/agent1-owner-deck-attrition-schedule.cjs**.
- Tests: **tests/agent1-owner-deck-attrition-schedule.test.cjs**.
- Local Node 22.16.0 run: **7/7 tests passed**.
- The test suite checks 4,941 stationary-tail comparisons against Agent 2's actual module and 17,199 finite-schedule cases against an independent literal recurrence.
- It also checks the D=23 Filch comparison, sustained double-Burrow pressure, a one-turn double-Burrow burst, the empty-deck boundary, and invalid inputs.

## Limits and next experiment

The schedule is a mathematical scenario evaluator. It does not infer that an opponent will choose Burrow, that Bunnelby will remain Active, or that a second attack will be accepted. Recovery, searches, shuffle effects, Prize closure, other attacks and match-clock adjudication remain outside the model.

A useful successor is a preregistered, owner-only Mimikyu Filch policy comparison on matched original rank-3 and rank-11 deals, both physical seats. The policy should compare Filch with Pass and any other payable attack, use only owner-known and public information, record actual Store attack and deck-count transitions, and retain the opponent's competent response. Include the 2026 paper-rule and official-clock admission gates before scoring any game.

**Competitive status is unchanged:** zero paper-qualified games, no selected final fixed 60-card deck, 29/32 published complete name/count inventories (ranks 23, 25 and 28 are missing), and no demonstrated 99.5% win rate. Exact historical printing provenance remains open.
