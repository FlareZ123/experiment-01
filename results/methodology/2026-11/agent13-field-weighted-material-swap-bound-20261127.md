# Field-weighted upper bound before paying for a material deck swap

**Agent 13 · 27 November 2026**

## Question

When a fixed 60 has a real but narrow structural failure, how much evidence is required before changing a card and paying opportunity cost in every other matchup?

The New Moon rank-15 dual-Vileplume / both-Dusclops-Prized state exposed a general mistake: comparing a **within-matchup configuration probability** directly to the project's **field-level target**.

Those are different denominators.

## Conservative upper-bound rule

For a proposed card change intended to repair failure event `E` in matchup family `m`, the maximum possible improvement in an aggregate field win rate is bounded by:

`field weight of m × P(E | m, admission conditions) × maximum loss severity repaired`.

For multiple affected matchup families, sum the terms:

`max aggregate gain <= Σ_m w_m × P(E_m | m) × s_m`,

where:
- `w_m` is the benchmark weight assigned to that matchup/family;
- `P(E_m | m)` is the probability the repair-relevant event is reached under the chosen admission/setup conditioning;
- `s_m` is at most 1 for a binary game loss/win repair and should be lower when the event is not always fatal or the new card does not always solve it.

This is deliberately an **optimistic bound for the proposed change**. It assumes every occurrence of the event is currently lost and every occurrence is repaired by the new card when `s_m = 1`.

If even that optimistic bound is small, the card change needs unusually low cross-family opportunity cost to be justified.

## New Moon example: both Dusclops Prized

New Moon v1 has two Dusclops and 17 Basic Pokémon.

Unconditional probability that both specific Dusclops are among the six Prize cards:

`P(E) = (6/60) × (5/59) = 0.0084745763 = 0.8474576%`.

Because a competitive game requires a valid opening Basic, the cleaner setup-conditioned value is:

`P(valid opening) = 1 - C(43,7)/C(60,7) = 91.6562567%`.

Given both Dusclops are in Prizes, the seven-card hand is sampled from 58 remaining cards containing all 17 Basics:

`P(valid opening | E) = 1 - C(41,7)/C(58,7) = 92.5228209%`.

Therefore:

`P(E | valid opening) = P(E) × P(valid opening | E) / P(valid opening)`

`= 0.8554699%`.

This is the relevant **configuration probability**, not a field failure rate.

### Equal-weight 32-rank thought experiment

If:
- rank 15 has weight `1/32`;
- every valid-opening game with both Dusclops Prized reaches the fatal BUS+AOR lock;
- the proposed replacement repairs every one of those games;

then the absolute aggregate improvement is bounded by:

`0.8554699% / 32 = 0.0267334 percentage points`.

### Equal-weight authenticated-29 thought experiment

Using only the currently authenticated 29 exact source lists:

`0.8554699% / 29 = 0.0294990 percentage points`.

These are **not win-rate estimates**. They are intentionally generous ceilings on what that one repaired configuration can contribute under those specific equal-weight conventions.

In reality the gain is lower if:
- rank 15 does not always establish the dual lock;
- New Moon prevents or breaks it through another line;
- both-Dusclops-Prized is not fatal every time;
- the added card is not always drawn/searchable in time;
- the added card itself creates losses elsewhere.

## Opportunity cost must use the same field denominator

A proposed swap should not be justified by saying:

> `0.855% > 0.5%, therefore fix it.`

That compares a one-matchup state probability with a field target.

Instead compare:

1. the **maximum field-weighted gain** from repairing the target failure; against
2. the **field-weighted loss / option-value reduction** caused by removing the current slot.

The second quantity is often harder to estimate. Use bounds and qualitative cross-family roles rather than pretending precision.

For the New Moon Sky Field #2 debate, direct valid-opening visibility of any own Stadium falls from 38.8285% with four own Stadiums to 30.5779% with three, and by the first mandatory draw from 43.4453% to 34.5075%. Those percentages are **not themselves win-rate losses**, but they show that the removed slot affects many states across several families rather than only rank 15.

Agent1's independent review identified concrete cross-family roles for Sky Field #2: neutral replacement of hostile Stadiums when Path would self-lock, Grand Tree / Silent Lab / Temple replacement, rank-2 Full Moon Rondo / board-cap thresholds, and emergency board construction. That broad option value is exactly what the narrow-event upper bound must be compared against.

## Multi-family repair cards

A card can still be justified even when no single failure event has a large field-weighted bound.

If the same addition independently repairs several distinct high-severity states, sum their non-overlapping contribution bounds. This is why a card such as Guzma remained worth preserving as a challenger hypothesis: it can address rank-15 Item-lock switching, Snorlax Block, some protected-Active states, and ahead-on-Prizes gust states.

But do not double-count overlapping events. If two failure labels describe the same game state or one is nested inside another, use the union probability rather than summing both.

## When exact probability is unavailable

Use the hierarchy:

1. exact combinatorics when the event is purely card-location/setup based;
2. empirical actor-visible frequency from competent policy traces when sequencing matters;
3. conservative analytic upper bounds when only partial reachability is known;
4. qualitative role analysis for opportunity costs that cannot yet be estimated;
5. never substitute a raw access probability for a game-loss probability.

## Decision rule

Before a material fixed-60 change, require a memo or trace that states:

- which source matchup families the card repairs;
- the event/state that currently fails;
- the benchmark weight convention being used;
- the best available reachability/frequency estimate or upper bound;
- whether the failure is actually fatal under competent current policy;
- whether the new card always solves it when drawn/available;
- the cross-family roles lost by the cut;
- the strongest known alternative that changes policy rather than the list.

Then classify the proposal:

- **Reject / defer:** optimistic field-weighted gain is already tiny compared with obvious broad role loss.
- **Policy-first:** failure is real but reachability or current-policy competence is unresolved.
- **Material challenger:** the same card repairs several independent high-severity states or the target failure is frequent/decisive enough that opportunity cost plausibly pays.
- **Promote:** only after competent-policy evidence shows the challenger improves the fixed-list objective without a larger cross-family regression.

## Relation to the New Moon decision

This method explains the corrected state of the repository:

- retain exact New Moon Lockbreaker v1 as the preferred fixed 60;
- use Agent1's 101-case actor-visible contract to measure whether current-policy failures are frequent and decisive;
- preserve Agent13's Sky→Guzma v2 as a material challenger with explicit reopen criteria;
- do not promote the challenger from the raw both-Dusclops-Prized percentage alone.

The method is reusable for other fixed-60 swaps and prize-collapse arguments.

No competitive matchup, field win rate, or 99.5% claim is created by this calculation.