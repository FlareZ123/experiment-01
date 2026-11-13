# A fixed-deck objective contract for full-field optimization

**Agent 5 | 13 November 2026 | methodological proposal, not a performance result.** This note makes the phrase '99.5% against the entire Aichi Open League Top 32' operational without allowing an aggregate score to conceal weak or missing matchups.

The candidate is one immutable 60-card list across every opponent identity: no opponent-specific substitutions, sideboard swaps, or list changes. Freeze one candidate-policy implementation and information boundary across the field; it may adapt to legal observations and public matchup context, but not to hidden opponent information or post-result tuning. If the benchmark uses distinct opponent policies, freeze one rank-specific policy per `field_entry_id` in a digest-bound opponent bundle, and apply that same policy consistently across both candidate seats and both first-player strata. No policy may change by trial or observed outcome.

## 1. Keep three different claims separate

1. **Equal-weight field-average game win rate:** the average game win probability against the 32 distinct opponent lists, giving each opponent equal weight unless a different tournament-population weighting is explicitly justified.
2. **Per-opponent matchup rate:** the win probability against each particular list. A high field average does not imply every matchup is strong.
3. **Worst-opponent floor:** the minimum matchup rate across the field. This is the robust guard against a candidate that farms favorable opponents while remaining exploitable by one archetype.

The 99.5% target is ambiguous unless the intended quantifier is declared: `field average >= 0.995` is materially weaker than `every opponent >= 0.995`. Report both. Do not silently turn one into the other or choose weights after seeing results.

## 2. Stable opponent identity is not tournament placement

Use two distinct keys: `field_entry_id` identifies one tournament entrant (official player/registration identity when verified; otherwise a provisional source-row key), while `deck_identity_sha256` hashes the multiset of canonical functional card identities and counts in that entrant's 60-card list. Multiple entrants may share a deck hash but must remain separate Top32 matchup entries; do not collapse them. Keep exact source-print identity (`source_print_identity_sha256`), Twinleaf registered-60 input hash, runtime deck hash, player identity, Limitless/source row, and official final placement as separate fields. The source row is not automatically a verified final bracket placement. The current Aichi source work shows that the [official Open League runner-up deck code](https://www.pokemon-card.com/deck/confirm.html/deckID/FVkbFV-S0oL2k-VvFvkF) has the same 60 card identities and counts as Limitless source row 2; the [PokeKameshi result page](https://pokekameshi.com/cl2026aichidec-extra/) identifies it as Otaro's list, while the Otaro↔Takahiro Ando player-name/registration join remains unproven. Rank28's qualifier-stage post still cannot be joined to a final source row by matching numerals (see the [missing-rank cross-check](../../aichi-2026/2026-11/agent39-missing-rank-archetype-crosscheck-20261113.md)).

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

For the literal 99.5% **field-average** target, a defensible default is: first require full-field coverage and valid evidence; then maximize the equal-weight field-mean lower confidence bound. Keep every per-opponent rate and the worst-opponent floor visible as non-compensatory diagnostics so a weak matchup cannot be hidden. If the benchmark instead adopts the stronger 99.5%-for-every-opponent target, make the minimum simultaneous opponent lower bound the primary objective. If candidates trade field mean against worst-case strength, publish the Pareto frontier rather than changing the objective after seeing which deck wins. No deck should be nominated on an aggregate computed from a subset.

## 5. Confidence and holdout discipline

Use the repository's [simultaneous 128-stratum confidence design](../../statistics/agent12-simultaneous-128-stratum-matchup-confidence-20261107.md), but keep its two estimands distinct. For the **equal-weight field mean**, five all-win games in each of the 128 cells (640 total) give a conservative 95% lower bound of **99.5330106%**. If allowing at most one nonwin across the entire 128-cell field-mean sample, an exact heterogeneous-stratum test requires eight games per cell (1,024 total; 7/cell fails), as derived in the [field-mean one-nonwin result](../../statistics/agent5-exact-field-mean-one-loss-bound-20261113.md). That can still conceal a weak individual matchup. For a simultaneous 95% guarantee that **every one of the 32 opponent means** exceeds 99.5%, the all-win floor is 323 games per cell (41,344 total), giving a 99.5011349% lower bound per opponent. If allowing one nonwin per opponent, the generic heterogeneous Chernoff-KL design requires 486 games per cell (62,208 total); a sharper exact four-stratum test now proves that **436 games per cell (55,808 total)** suffice when each opponent has at most one nonwin ([exact one-nonwin design](../../statistics/agent5-exact-one-loss-balanced-matchup-bound-20261113.md)). A separate exact two-nonwin derivation (534 games per cell) is under independent adversarial review ([combined one/two-nonwin result](../../statistics/agent5-exact-one-loss-balanced-matchup-bound-20261113.md)); until accepted and integrated into the validator, retain the existing 602-per-cell KL design for two nonwins. For three or more nonwins, retain the generic KL method. These are fixed-sample design calculations, not observed evidence, and assume independently sampled paper-qualified games under frozen candidate, policies, field, engine and adjudication. Do not substitute point estimates, independent per-cell intervals, or a large total sample concentrated in a few matchups for the declared evidence.

Separate optimization seeds from confirmatory seeds. The candidate deck and policy must be frozen before confirmatory games begin; any card, policy, rules, simulator, or opponent-list change invalidates the affected holdout. Avoid optional stopping: predeclare sample size or a sequential confidence procedure with its error control.

Game win rate is not match win rate or tournament placement. Define win/loss/draw and incomplete-game handling before running. Preserve every attempted game; report completed-game fraction and do not silently drop games that failed, timed out, or were censored.

## 6. What the current Aichi evidence permits

The current benchmark does not permit a Top32 score: 29 source rows have published 60-card identities, but five contain Japan-only promo identities incompatible with unchanged international Expanded and three lists remain unavailable. The 24 identity-normalized Expanded-legal lists are a **diagnostic subset only**. A score over those 24 must be labelled `24-rank diagnostic field`, use their stable list hashes/source-row identifiers, and must not be projected to 32 or described as the full Top32.

Likewise, the official event's Open League is a one-day Swiss-plus-top32-single-elimination event; the separate Master League schedule is not its format. Source row numbers are not proof of final bracket placement. Preserve these caveats in any matchup table.

## 7. Evidence boundary

This is an objective and reporting contract, not a statistical result. It does not select a deck, prescribe a particular optimizer, establish a 99.5% win rate, or authorize new simulation work before the owner-only native integration gates. It is intended to make later deck comparisons honest, comparable, and robust to one favorable subset or a mislabeled opponent row.