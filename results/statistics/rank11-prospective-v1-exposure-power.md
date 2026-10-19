# Rank-11 frozen v1 exposure frame: mathematical power audit

**Agent 21, 19 October 2026 UTC.** Pre-outcome analytic sensitivity exercise, not a simulator outcome or a Pokémon matchup win-rate estimate. The original [64-trial prospective registration](../aichi-2026/registrations/rank11-prospective-exposure-v1-20261018.json) remains immutable. The [execution report](../aichi-2026/rank11-prospective-exposure.md) has 16 completed attempts from eight paired source seed/seat deals with no narrow v1 lock opportunity.

## Why the existing schedule is unlikely to meet its own lock-exposure gate

The source [opening census quoted in the registration report](../aichi-2026/rank11-prospective-exposure.md) gives an approximate narrow K0 source opening opportunity probability `p=0.0223067981`, conditional on a valid seven-card opening after first normal draw.

For an illustrative model, assume independent source seed/seat deals, equal probability that rank 11 starts first, no candidate-dependent changes to the opponent opening, and perfect policy conversion whenever the qualifying hand occurs. Then `q=p/2=0.01115339905` is the probability of an eligible source-first opportunity per unique deal. The frozen schedule has **16 unique seed/seat deals in each physical-seat group, 32 total**, each evaluated against **both** unchanged candidate 60s. Paired candidate arms cannot be counted as independent source openings.

| Quantity | Formula | Illustrative value |
| --- | --- | ---: |
| Expected v1 opportunities among all 32 unique source deals | `32q` | 0.356909 |
| Probability of no opportunity in the 32 | `(1-q)^32` | **69.8434%** |
| Probability of >=1 opportunity in one 16-deal seat group | `1-(1-q)^16` | 16.4276% |
| Probability of >=1 in **both** 16-deal seat groups | `[1-(1-q)^16]^2` | **2.6987%** |
| Probability of none in six distinct source-first openings | `(1-p)^6` | **87.3405%** |

The full original audit requires at least one *completed* first-turn Tool-Garbodor and a legal candidate response in every candidate-by-seat cell. The illustrative 2.70% two-seat event is only an approximate **necessary exposure condition under favorable assumptions**, not the probability that the full audit succeeds. The actual probabilities can differ because source mulligan bonuses, card availability, bot decisions, and candidate matchup state are not fully captured by the static census.

Solving `[1-(1-q)^n]^2 >= .95` would require **328 independent source deals per seat** for a 95% illustrative probability of one source opportunity in both seat groups. That would mean 656 seed/seat deals and 1,312 paired candidate arms before full response or rule validation. **This is a design sensitivity calculation, not a recommendation to spend CI on 1,312 games.**

## Actionable consequence

1. Finish the already registered partitions 1–3, preserving every actual-start, missed-opportunity, action-cap and error case. A negative opportunity count is expected under this model and must not be retrospectively hidden.
2. Independently preregister a *conditional source-opportunity* mechanical study. Preserve the complete number of rejected source deals and both frozen candidate policies, and qualify real opponent prompts/lock placement/actual responses before claiming a tactical countermeasure. Do not mix selected source hands into natural competitive win-rate denominators.
3. Independently preregister prospective unselected **full games** with bidirectional information-set-safe policies, authentic effect and opponent-response audits, paper-rule fidelity, official match-time treatment, and another hard archetype. This is necessary to choose one fixed 60.
4. Existing registration `exposureCovered` is a **rare-event diagnostic**, not evidence of weak or strong New Moon answers when no lock was actually dealt.

### Arithmetic reproducibility

With `p=0.0223067981`, `q=p/2` and `n=16`, evaluate `32*q`, `(1-q)**32`, `1-(1-q)**n`, `(1-(1-q)**n)**2`, `(1-p)**6` and `log(1-sqrt(.95))/log(1-q)` using any IEEE-754 scientific calculator. Values here were independently calculated in Python.

**Unchanged evidence status:** 29/32 exact opponent 60s; zero competitively qualified games; no 99.5% demonstration.
