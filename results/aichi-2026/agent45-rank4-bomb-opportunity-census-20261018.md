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

## Results

Pending artifact inspection. No qualified competitive win-rate claim.

## Next discriminating step

If the full Active-Raichu + Benched-Electrode conjunction is never witnessed at these decision points, improve setup/Active-position policy and rerun rather than changing Electrode's damage arithmetic. If the conjunction occurs with enough public Energy, inspect Prize constraints, Ability-use state, lock effects and missed tactical choices at those exact sampled turns. Existing game-level zero-exposure results remain in the denominator.
