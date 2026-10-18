# Rank-11 v1 lock exposure: sample-budget and conditional-screen design

**Agent 2, 18 October 2026.** Planning calculation and proposed experimental design, **not gameplay, an observed win, or a claim of statistical independence**.

## Inputs and exact scope

- The source rank-11 initial-seven-plus-one-normal-draw census reports a **2.23067981%** *conditional-on-valid-seven* necessary hand/Prize opportunity for the narrow version-1 opener. Its implementation is [rank11-boostshake-opening-census.cjs](../../scripts/rank11-boostshake-opening-census.cjs); the numeric event is `v1Targets / valid`.
- The [autonomous source policy](../../simulation/twinleaf/rank11-autonomous-opener.cjs) additionally requires **Oranguru V already Active**, free Bench, suitable game phase, and a particular hand shape before proceeding through actual legal prompts. It can abort on missing or unreachable pieces. Thus 2.23067981% is **not a measured execution frequency** and must not be called a lock probability.
- [Agent 30's prospectively registered 64-arm study](../aichi-2026/rank11-prospective-exposure.md) compares two different fixed candidate inventories in each pair of physical-seat seeds. The first 16 arms are only eight distinct seed/seat pairs, of which six showed rank-11 starting first. **None showed the narrow v1 policy opportunity.** One 64-arm frame contains at most 32 nominally distinct seed/seat pairs, and even those are not necessarily independent after policy and deck-shuffle dependencies.

## Binomial *design sensitivity*, not an empirical model

For transparent planning, suppose **independent opportunities** occur with probability

`q = 0.0223067981 * f`,

where `f` is an assumed fraction of attempts in which the source actually goes first. This assumes the exact static necessary-event rate transfers to the selection frame and multiplies with actual-first status. It is an **optimistic, unverified approximation**, since the policy has additional restrictions and the observed two-candidate seeds are correlated. The calculations below use `P(at least k) = scipy.stats.binom.sf(k-1, n, q)` and select the smallest integer `n` giving probability at least 0.95.

| Assumed source-first fraction | q per independent attempt | n for >=1 opportunity | n for >=3 | n for >=5 | n for >=10 |
| --- | ---: | ---: | ---: | ---: | ---: |
| 50% | 1.115339905% | 268 | 563 | 819 | 1,405 |
| 75% | 1.6730098575% | 178 | 375 | 545 | 936 |
| 100% | 2.23067981% | 133 | 281 | 408 | 701 |

At the illustrative 50% first rate, even **32 independent trials** have `(1-q)^32 = 69.84344%` probability of zero necessary events. If **four truly independent candidate-by-physical-seat cells** each need at least one event with joint 95% probability, the same simplified model requires **389 independent attempts *per cell* (1,556 total)**, from `(1-(1-q)^n)^4 >= 0.95`. Neither independence nor the optimistic q is established for the existing replay framework. The purpose of these large numbers is to expose the cost of unfiltered terminal-game sampling before allocating CI.

## Proposed two-frame protocol

**Frame A: unconditional field strength.** Preserve the current registered, seed-fixed random schedule and all of its source first/second, no-opportunity, exception, and unfinished rows. Future competitive evaluation must use an independently qualified, **unselected** source-dealt sample and validated policies; it must not inherit a win estimate from Frame B.

**Frame B: source-opportunity conditionally selected mechanistic challenge.**

1. **Precommit** a disjoint deterministic seed stream, card-printing digests, pinned Twinleaf revision, policy and research-code revision, selection predicate, stopping target, maximum attempt budget, and the physical-seat/candidate strata. A recommended first *diagnostic* goal is at least one genuinely completed autonomous lock and one reviewed legal challenger-response trace in each viable stratum; call any uncovered cell inconclusive.
2. For each enumerated seed, run only the actual pinned Store startup through the first normal draw and the first *eligible owner action*. Record an auditable trial ID and the exact verified global first player. Evaluate the frozen **own-hand/public-board** v1 `openingOpportunity` against the source player. Never use source-hidden Prize or deck identities to choose the acting bot's action; if an offline screening predicate deliberately uses such identities, label it explicitly as **oracle-conditioned selection** and forbid any ordinary-play frequency inference.
3. **Record every attempted seed**, including invalid/mulligan cases, source-second starts, valid non-opportunities, engine exceptions and aborted searches. Track whether the selected event was **K0 eligibility**, actual K1 search-target availability, *eleven selected actions*, completed equipped Garbodor, and a validated candidate counterplay response. These are separate denominators and must never silently collapse into one success count.
4. Continue the source state **without re-dealing, re-seeding or modifying hand/deck/Prize contents** to obtain an autonomous game trace. If a candidate counterpart uses a different physical-deck composition under the same seed, independently verify its true starting order and opening; a match in seed number cannot certify a match in real source hands.
5. Report only **conditional mechanism and response diagnostics** for Frame B. Precommitted seed rejection and retained denominators make the procedure auditable; they do not automatically give an unbiased field win rate. Replaying successful seeds selectively is useful for falsification and inappropriate for unconditional strength claims.

### Explicit adverse outcomes

A screened K0 opportunity with missing searchable Forest Seal Stone, Boost Shake, Trubbish or Garbodor remains a **failed K1 exposure**, not an absent attempt. An eleven-action source lock followed by a weak/illegal challenger response is **candidate-policy unqualified**, even if Twinleaf later declares a winner. Failure to observe an opportunity within the prespecified maximum leaves the experiment **underexposed**. No result is a candidate nomination by itself.

## Integration point and priority

The current [rank11-prospective-exposure-run.cjs](../../simulation/evaluation/rank11-prospective-exposure-run.cjs) and [registration verifier](../../scripts/rank11-prospective-exposure.cjs) are appropriate for the unconditional frame. A new conditional capture driver should be explicitly **versioned separately**, not retrofit the existing frozen 64 observations. It should reuse actual `runMatch` and `rank11AutonomousPolicy` trace semantics, preserve one row per enumerated source attempt, and keep the three unpublished opponent ranks **23/25/28** outside any claimed complete-field result.

The narrow v1 policy is a legitimate mechanical positive-control target. A separate, evidence-reviewed broader source-policy extension may be much more productive than running hundreds of expensive full matches whose v1 trigger is rarely reached. A broader policy requires its own frozen treatment identity and independent tests. **Currently there remain zero competitively qualified games and no supported 99.5% fixed-deck claim.**
