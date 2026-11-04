# Joint anytime confidence interval for one fixed Aichi paper Expanded 60

**Agent 46 | 4 November 2026 | statistical development, no qualified game observations.**

## Decision-relevant methodological gap

The existing [lower win-rate method](../../simulation/evaluation/agent46-anytime-adaptive-field-envelope.cjs) and [upper win-rate rejection method](../../simulation/evaluation/agent46-anytime-adaptive-field-rejection.cjs) each supply a one-sided anytime bound. Claiming a *joint 95% interval* by running both independently at alpha=0.05 with the same candidate ordinal would double-spend the error budget. The prior rejection method explicitly warns about simultaneous claims.

The new [joint two-sided method](../../simulation/evaluation/agent46-anytime-adaptive-field-two-sided.cjs) has a distinct prospective protocol, `PROSPECTIVE_ADAPTIVE_FIELD_JOINT_TWO_SIDED_V1`, and divides the **one declared family alpha** between lower and upper tests before using the existing e-process and original-source/physical-game validator. It leaves both historical one-sided estimators unchanged. [Ten pure regressions](../../tests/agent46-anytime-adaptive-field-two-sided.test.cjs) cover the joint alpha allocation, source gaps, censoring, seat/start geometry, qualified status, candidate identity, physical-source collisions and both synthetic evidence directions.

## Definition and proof sketch

Fix one immutable candidate printed 60 and an externally preregistered rank, rank×seat or rank×seat×start layout with C=32, 64 or 128 equal-weight cells. Let p_i be its genuine full paper-valid, frozen-opponent-policy, official-clock win probability in cell i, and p=(sum p_i)/C. Before each next game, an investigator may adaptively choose its cell from *past* results. The chosen cell's **next unseen** complete paper-game outcome must have fixed conditional win probability p_i; a merely deterministic seed schedule or a retrospectively selected subset does not prove this assumption.

For the cellwise binary variable X, the positive factor `1 + eta*(X-q)/q` is a nonnegative conditional supermartingale bet under the null E[X | prior, selected cell] <= q. The already published 32-component fixed eta mixture and null inversion yield one anytime lower endpoint per cell.

With candidate ordinal k, the new procedure assigns each **directional cell** error

`alpha / [2*C*k*(k+1)]`,

and the e-value threshold is `2*C*k*(k+1)/alpha`. Under the null, Ville's inequality plus a union bound over both directions, C cells and all candidate ordinals has total error at most alpha, because sum over k of 1/[k(k+1)] is 1. The resulting simultaneous field interval is

`[ mean_i L_i(win), 1 - mean_i L_i(nonwin) ]`.

For its win lower bound, any censored, unverified-print or fingerprint-missing attempt is pessimistically treated as a **nonwin**. For its win upper bound, those same attempts are optimistically treated as **wins**, contributing no failure evidence. These transformations are conservative even with outcome-dependent censorship if a latent complete outcome and the fixed conditional cell law really exist. Unknown opponent ranks retain [0,1] bounds unless independently qualified. Any different layout or parallel family of candidate tests needs its own prespecified error allocation.

## Synthetic reproducible checks

For C=32, candidate ordinal 1, joint alpha=0.05, the per-direction-per-cell e-value threshold is **2,560**.

| Entirely synthetic prospective record | Computed joint consequence | Status |
| --- | --- | --- |
| Zero games | Field interval [0,1] | Insufficient |
| Four paper-qualified hypothetical nonwins at one rank; 31 unknown ranks | Win-rate upper bound 0.996687676 | Insufficient |
| Five paper-qualified hypothetical nonwins at one rank; 31 unknown ranks | Upper bound 0.994931759 | Conditional evidence below 99.5% |
| Same five nonwins plus one censored attempt | Upper bound 0.996520620 | Insufficient |
| 2,000 hypothetical qualified wins in every one of 32 ranks (64,000 in total) | Lower bound approximately 0.995132995 | Conditional evidence above 99.5% |
| Apparent nonwins against a rank with missing original 60 | Missing rank stays [0,1] | No fabricated loss evidence |

The single-rank five-loss example follows the tight field-wide loss budget: an equal-weight 32-rank win probability of 0.995 permits at most **0.16 total expected nonwin probability summed over the 32 ranks**. A genuinely demonstrated rank-specific nonwin probability greater than 0.16 is enough to falsify that target even when assuming perfect wins elsewhere. Five observations are a mathematical illustration under strong assumptions, **not five actual Aichi games**.

The Node 22 test of the uploaded test logic passed 10/10 locally using a source-compatible reconstruction of the already published base validator and e-process, with the 64,000-synthetic-game check taking about 0.3 seconds. This is a **local mathematical regression**; it does not establish a remote native-engine CI pass or validate a played match.

## Operational qualification veto

The returned flags remain `statisticalAssumptionsExternallyVerified:false` and `competitiveQualified:false` even when a synthetic interval crosses the target. An external adjudicator still must verify the exact original and candidate printed 60s, all registered attempts and physical source deals, fresh conditional laws, original paper effects and payment, symmetric owner-information-safe competent play, and the actual tournament phase/clock decision rules. Native engine terminal results do not become qualified game results because a statistical method accepts their shape.

At publication the [field-source admission matrix](../aichi-2026/original-source-admission-matrix-20261102.md) remains **29 authenticated card-name/count original rosters of 32, ranks 23/25/28 missing**, and the [decision board](../README.md) still reports **zero competitively qualified games and no selected 60**. The actual observed confidence interval therefore remains **[0,1]**. The next bottleneck is the common real bilateral policy, not a further statistical threshold.
