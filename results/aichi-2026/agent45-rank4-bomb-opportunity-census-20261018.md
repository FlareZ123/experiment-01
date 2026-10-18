# Agent 45: rank-4 Raichu/Electrode necessary-condition census (18 October 2026)

## Frozen falsifiable question

The [prior corrected-rule, Prize-trade paired experiment](agent45-rank4-electrode-prize-trade-pair-20261018.md) produced **zero Bomb activations in 8/8 exact paired source-dealt games**, so no policy-effect evidence existed. Was the bot ever in the prerequisite board/resource state where the new `ElectrodeSourcePrizeTrade-v1` tactic might plausibly activate?

We introduce **read-only decision-time evidence**, opt-in `captureElectrodeOpportunity`, from [`electrode-opportunity-observer.cjs`](../../simulation/twinleaf/electrode-opportunity-observer.cjs). At each live, non-prompt, ordinary player-turn bot decision, it checks the current player's printed Active Pokémon, Benched Pokémon, own public discard, both players' Prize counts and the global turn. It never invokes a speculative engine, changes a decision or consumes randomness. All information is public; no opponent hand/deck is inspected.

Necessary-condition strata, for **each physical seat separately**:

1. Active Pokémon is exactly **Alolan Raichu UNM 57**.
2. A **Benched Electrode-GX CES 48** is simultaneously present.
3. The public discard contains at least one of the source three Special Energy prints: **Reversal PAL, Counter CIN or Unit LPM UPR**.
4. The other player has **more than two Prizes remaining**, so sacrificing one Electrode-GX cannot instantly concede by supplying its two Prize cards.
5. After that hypothetical self-KO, the player would be **behind on Prizes** for Reversal Energy's stronger effect (`ownPrizes > opponentPrizes - 2`).

These checks are necessary, **not sufficient**. They do not verify unspent Ability status, lock interactions, target Energy cap, remaining attacks or the best move. The raw counters count *decision points*, which may cluster heavily within one game; they are never independent Bernoulli samples or probabilities. Distinct interesting-state samples are deduplicated by seat, global turn and observed condition tuple.

## Controlled observer intervention

- Frozen branch: `agent45-electrode-opportunity-20261018`, revision `f4096bde9873f1fb71077f3b09986b5a4891642c`, pinned upstream Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.
- Four fixed candidate 60s, exact rank-4 opponent published 60, both physical seats, decorrelated-slots-v3 seed schedule, one repeat, ordinary core policy.
- Both arms set `electrodeGXEnergyCorrection=true`, `electroRainDamageCorrection=true`, `electrodeGXPrizeTradePolicy=true`.
- Only `electrode_opportunity_observer` toggles false versus true; default engine draws, other hooks and candidates must be unchanged.
- Manual CI runs: [observer disabled 39096036644](https://github.com/FlareZ123/experiment-01/actions/runs/39096036644), [observer enabled 39096039374](https://github.com/FlareZ123/experiment-01/actions/runs/39096039374).

**Validity gates:** both CI jobs must pass; their eight `trialId` sets, matched seeds, source deck hashes, observed starting players, outcomes and entire `chronologicalActionTrace` arrays must be strictly equal. Observer-enabled records must have recognized `electrodeOpportunitySummary.evidenceType` and per-seat counts. Any gameplay divergence makes the observer unfit for causal opportunity claims, even if it reports interesting numbers.

## Results: eight exact live paired games, observer noninterference verified

Both frozen CI runs completed successfully at revision `f4096bde9873f1fb71077f3b09986b5a4891642c` and identical plan digest `21fd5c47f6168f127f2e3dcad4b9d42bd79ed0c4b3801b261b5d8d667ef10cbf`. The control [39096036644](https://github.com/FlareZ123/experiment-01/actions/runs/39096036644), artifact `12124329815`, and observer [39096039374](https://github.com/FlareZ123/experiment-01/actions/runs/39096039374), artifact `12125105684`, both reported `completed-engine-game: 8`.

Independent comparison of downloaded `aichi-campaign-diagnostic.json` payloads matched the set of eight `trialId` values. Every pair matched source candidate/opponent digests, actual first turn, PRNG seed, pinned engine revision, rules, status, action count, turn count, winner index, full chronological meaningful-action array, full `traceSummary` except the opt-in evidence field, and terminal Prize/board snapshot. Each pair differed only in the expected observational request flag. This supports **noninterference in the tested eight games**, with no claim that the monitor proves all unobserved properties of the engine.

### Actual rank-4 opponent decision census

Counts apply only to the **rank-4 source opponent's own** non-prompt decisions, regardless of whether the opponent was physical seat 0 or 1. Each row represents a distinct frozen candidate and seat, with one repeat.

| Candidate | Candidate seat | Opponent decision points | Active Raichu | Benched Electrode | Both simultaneously | Opponent attacks |
| --- | --- | ---: | ---: | ---: | ---: | ---: |
| Champion reference | A | 24 | 4 | 0 | 0 | 1 |
| Champion reference | B | 30 | 0 | 0 | 0 | 4 |
| Hood Shield | A | 25 | 1 | 0 | 0 | 2 |
| Hood Shield | B | 36 | 0 | 14 | 0 | 0 |
| Temple | A | 28 | 0 | 1 | 0 | 0 |
| Temple | B | 24 | 0 | 6 | 0 | 1 |
| New Moon | A | 66 | 0 | 13 | 0 | 10 |
| New Moon | B | 71 | 0 | 53 | 0 | 15 |
| **Total** | | **304** | **5** | **87** | **0** | **33** |

Counts from `records[].traceSummary.electrodeOpportunitySummary.countsBySeat[opponentSlot]`, where `opponentSlot=1` when `candidateEngineSlot='A'`, and `0` otherwise.

**Direct conclusion:** `both = 0` in **all eight games**, hence `bothWithDiscardSpecial = 0`, `withSafePrizeWindow = 0` and `withPostBombReversalWindow = 0` at every observed opponent decision. This is a stronger diagnosis than inferring lack of a board from aggregate zero Bomb activations alone. It explains why the source-specific Prize-trade tactic lacked its target setup at the actual sampled decision points.

- The opponent's Active **Alolan Raichu** existed at five decision points spread across **two** games. Its bench contained no Electrode-GX in any such state. The captured state in champion-seat-A global turn 6 had two relevant Special Energy cards in the public discard, opponent source side six own Prizes remaining versus candidate four. The hood-seat-A state in global turn 12 had three.
- A **Benched Electrode-GX** existed at 87 opponent decision points across **five** games. In none was Raichu Active. The New Moon opponent-seat-B game contributed 53 such decision points, and sometimes had as many as seven relevant Special Energy cards in discard. Those are temporally correlated passes and do not represent 53 independent opportunities.
- Two games had **zero opponent attacks**. Any apparent opponent inability to win is heavily contaminated by generic policy competency. The observer does not capture whether Raichu was present on the Bench, whether Electrode was in hand, or whether a legal switch/evolution existed during the turn.

### Limits and implications

The monitoring snapshots only pre-choice game states with no pending prompt, which is the intended phase of the narrow `ElectrodeSourcePrizeTrade-v1` tactic. A `both=0` result does not prove the printed `Extra Energy Bomb` Ability was never legally usable with a **different recipient or strategy**, and is not evidence that playing Electrode would always be strategically inferior.

The next high-value intervention is source-aware **Active-position and Bench setup** decisions, with attention to evolutions, switch Item availability, the opponent's Klefki lock, two-Prize self-KO risk, and remaining discarded Special Energy. Only after demonstrating substantial board conjunction exposure is it worth comparing downstream Prize-trade or Energy-attachment policies for live match outcomes.

All game records are unqualified as estimates of real paper Expanded win probability.

## Next discriminating step

If the full Active-Raichu + Benched-Electrode conjunction is never witnessed at these decision points, improve setup/Active-position policy and rerun rather than changing Electrode's damage arithmetic. If the conjunction occurs with enough public Energy, inspect Prize constraints, Ability-use state, lock effects and missed tactical choices at those exact sampled turns. Existing game-level zero-exposure results remain in the denominator.
