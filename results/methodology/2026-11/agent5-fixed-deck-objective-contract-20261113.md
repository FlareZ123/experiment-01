# A fixed-deck objective contract for full-field optimization

**Agent 5 | 13 November 2026 | methodological proposal, not a performance result.** This note makes the phrase '99.5% against the entire Aichi Open League Top 32' operational without allowing an aggregate score to conceal weak or missing matchups.

The candidate is one immutable 60-card list across every opponent identity: no opponent-specific substitutions, sideboard swaps, or list changes. A fixed policy may adapt to the acting player's legal observations and known public matchup context, but the policy version and information boundary must also be frozen before confirmatory evaluation.

## 1. Keep three different claims separate

1. **Equal-weight field-average game win rate:** the average game win probability against the 32 distinct opponent lists, giving each opponent equal weight unless a different tournament-population weighting is explicitly justified.
2. **Per-opponent matchup rate:** the win probability against each particular list. A high field average does not imply every matchup is strong.
3. **Worst-opponent floor:** the minimum matchup rate across the field. This is the robust guard against a candidate that farms favorable opponents while remaining exploitable by one archetype.

The 99.5% target is ambiguous unless the intended quantifier is declared: `field average >= 0.995` is materially weaker than `every opponent >= 0.995`. Report both. Do not silently turn one into the other or choose weights after seeing results.

## 2. Stable opponent identity is not tournament placement

Use an immutable opponent key derived from the canonical 60-card identity list, with player identity and source references as separate metadata. Keep the Limitless/source row as a source-row label only; it is not a verified final bracket placement. The current Aichi source work shows that the [official Open League runner-up deck code](https://www.pokemon-card.com/deck/confirm.html/deckID/FVkbFV-S0oL2k-VvFvkF) has the same 60 card identities and counts as Limitless source row 2; the [PokeKameshi result page](https://pokekameshi.com/cl2026aichidec-extra/) identifies it as Otaro's list, while the Otaro↔Takahiro Ando player-name/registration join remains unproven. Rank28's qualifier-stage post still cannot be joined to a final source row by matching numerals (see the [missing-rank cross-check](../../aichi-2026/2026-11/agent39-missing-rank-archetype-crosscheck-20261113.md)).

Do not aggregate by rank label until the source-to-player-to-final-placement join is proven. A decklist's identity hash should survive a change in display name, rank label, or source ordering.

## 3. Four execution strata per opponent

For each opponent list `i`, distinguish:

- candidate occupies engine seat A versus seat B;
- candidate actually goes first versus opponent actually goes first.

Let `p[i,s,f]` be the game win probability for opponent `i`, candidate seat `s`, and actual first-player order `f`. The matchup rate is a predeclared weighted average over the four cells; use equal weights `1/4` unless a verified tournament rule justifies otherwise:

`p[i] = (p[i,A,candidate-first] + p[i,A,opponent-first] + p[i,B,candidate-first] + p[i,B,opponent-first]) / 4`.

Report the four cells as well as `p[i]`. A seat-balanced seed schedule is not automatically first-player-balanced: record the actual first turn from the game engine and report observed coverage. Never infer first-player order from candidate engine seat.

## 4. Field aggregation and robust selection

For `N` verified opponent identities and declared weights `w[i]` summing to one:

`P_field = sum_i w[i] * p[i]`.

Default to `w[i] = 1/N` for the fixed Top32 benchmark. Do not weight an opponent more heavily merely because it was simulated more often. If tournament-population weights are later introduced, publish the source and report the equal-weight result alongside them.

Also report:

- `P_worst = min_i p[i]`;
- the full sorted matchup vector, not only the minimum;
- the number of opponents with adequate sample coverage;
- uncertainty for each matchup and for the field aggregate;
- the number and disposition of unfinished, invalid, or censored games.

A defensible selection rule is lexicographic: first require full-field coverage and valid game evidence; then maximize the simultaneous lower bound on the worst matchup; then maximize the equal-weight field-average lower bound. If this is too conservative for the declared 99.5% *average* target, present the Pareto frontier instead of changing the rule after seeing which deck wins. No deck should be nominated on an aggregate computed from a subset.

## 5. Confidence and holdout discipline

Use the repository's [simultaneous 128-stratum confidence design](../../statistics/agent12-simultaneous-128-stratum-matchup-confidence-20261107.md), but keep its two estimands distinct. For the **equal-weight field mean**, five all-win games in each of the 128 cells (640 total) give a conservative 95% lower bound of **99.5330106%**. That can still conceal a weak individual matchup. For a simultaneous 95% guarantee that **every one of the 32 opponent means** exceeds 99.5%, the all-win floor is 323 games per cell (41,344 total), giving a 99.5011349% lower bound per opponent; one nonwin per opponent requires 486 games per cell (62,208 total). These are fixed-sample design calculations, not observed evidence, and assume independently sampled paper-qualified games under frozen candidate, policies, field, engine and adjudication. Do not substitute point estimates, independent per-cell intervals, or a large total sample concentrated in a few matchups for the declared evidence.

Separate optimization seeds from confirmatory seeds. The candidate deck and policy must be frozen before confirmatory games begin; any card, policy, rules, simulator, or opponent-list change invalidates the affected holdout. Avoid optional stopping: predeclare sample size or a sequential confidence procedure with its error control.

Game win rate is not match win rate or tournament placement. Define win/loss/draw and incomplete-game handling before running. Preserve every attempted game; report completed-game fraction and do not silently drop games that failed, timed out, or were censored.

## 6. What the current Aichi evidence permits

The current benchmark does not permit a Top32 score: 29 source rows have published 60-card identities, but five contain Japan-only promo identities incompatible with unchanged international Expanded and three lists remain unavailable. The 24 identity-normalized Expanded-legal lists are a **diagnostic subset only**. A score over those 24 must be labelled `24-rank diagnostic field`, use their stable list hashes/source-row identifiers, and must not be projected to 32 or described as the full Top32.

Likewise, the official event's Open League is a one-day Swiss-plus-top32-single-elimination event; the separate Master League schedule is not its format. Source row numbers are not proof of final bracket placement. Preserve these caveats in any matchup table.

## 7. Evidence boundary

This is an objective and reporting contract, not a statistical result. It does not select a deck, prescribe a particular optimizer, establish a 99.5% win rate, or authorize new simulation work before the owner-only native integration gates. It is intended to make later deck comparisons honest, comparable, and robust to one favorable subset or a mislabeled opponent row.