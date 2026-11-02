# A sparse-discordance anytime betting test for the complete fixed-deck field

**Agent 46 | 2 November 2026 | new mathematical method, 13 deterministic tests, zero qualified Aichi game results.**

## Why another comparison model is warranted

The [per-cell Hoeffding sequence](agent46-anytime-paired-deal-contrast-20261102.md) retains every incomplete original-source attempt, and the separate [balanced pooled Hoeffding sequence](agent46-balanced-independent-paired-contrast-20261102.md) uses independent field cells more efficiently. Both pay a substantial worst-case uncertainty radius for the possible spread of every paired contrast D in [-1,1]. In actual game comparisons, challenger and reference frequently achieve the same win/nonwin outcome on a particular original-source setup. Those concordant pairs have exactly D=0, while a small number of **discordant qualified pairs** directly determine the direction of the difference.

The new [CJS directional betting implementation](../../simulation/evaluation/agent46-anytime-balanced-paired-sign-betting.cjs) provides an anytime-valid field-wide test for that case. A separate fixed 60 vs fixed 60 hypothesis is registered **before** any result. The new method applies only to a genuinely independent, fully balanced field sampler, and the caller must explicitly set `independentAcrossCells:true`. It cannot be retrospectively selected because it happens to produce a favorable answer.

## The crucial non-identically-distributed field proof

Choose a fixed field stratification C∈{32,64,128}, representing rank, rank×physical candidate seat or rank×physical candidate seat×starter. For every prospectively registered round r, draw **exactly one independent original-source paired comparison in every field cell**. Its latent contrast in cell i is Dᵢ,r∈{-1,0,+1} with stationary expected value μᵢ. Outcomes in different cells within a round, and across rounds, must be independent. The challenger and reference games **within the same source paired comparison may be correlated**. Freeze both printed candidate 60s, original source 60s, deal distribution, decision policies, whole-paper rules and official match clock.

The one-sided null is the equal-cell average difference μ=(1/C)Σᵢ μᵢ≤0. Each individual opponent is allowed to have a positive or negative μᵢ. For a fixed precommitted bet η∈(0,1), define the **round betting factor**

`B_r(eta) = product_i (1 + eta D_i,r)`.

By independence across cells and the arithmetic–geometric mean inequality,

`E[B_r] = product_i(1 + eta mu_i) <= (1 + eta mu)^C <= 1`.

All factors are nonnegative. Products of the B_r across independent rounds form a nonnegative supermartingale under the entire-field null. Thus, under the null, Ville's inequality bounds the probability that this test wealth ever exceeds 1/α by α, even if the researcher inspects results and stops adaptively.

A fixed **32-bet mixture** uses ηⱼ=1−2⁻ʲ, j=1..32, with weights proportional to 2⁻ʲ normalized to sum one. Positive weighted mixtures remain safe. To protect an unlimited prospectively preindexed sequence of directional comparison hypotheses, comparison ordinal k spends αₖ=α/[k(k+1)]. The reported directional evidence crosses only when `log(mixture wealth) >= log(k(k+1)/alpha)`. Each direction tested independently or each unrelated test also needs its own ordinal/error allocation. This test establishes evidence for a **relative improvement in the equal-cell field mean**, and is distinct from the absolute 99.5% target.

## Partial outcome and source-setup safety

This test calls the already strict balanced-round input validator, then conservatively replaces every unknown D with the smallest value consistent with the observed independent whole-paper qualification:

- qualified challenger win and qualified reference nonwin: +1;
- qualified reference win and qualified challenger nonwin: −1;
- identical qualified outcomes: 0;
- qualified challenger win and censored reference, or censored challenger and qualified reference nonwin: 0;
- one-sided or two-sided censorship that could hide a reference-only win: −1;
- actual **source physical-deal mismatch** regardless of engine outcome: −1.

For the reversed direction, swap challenger and reference. Because `1+eta D` increases with D, the pessimistically censored wealth is **pathwise no larger** than the wealth of the underlying fully observed games. Every rejection by the censored statistic would also be a rejection by the valid latent supermartingale. This preserves error control even if failures or missingness depend arbitrarily on the unobserved game result. It also prevents selecting only those random-seed matches whose true physical source openings happen to coincide.

The implementation leaves `competitiveQualified:false` in every return. The status `QUALIFIED_WIN` or `QUALIFIED_NONWIN` has to come from a separate verified complete-paper-game ledger. No native Store winner, action cap, simulator terminal or temporary staged effect can supply it automatically.

## Positive-control arithmetic and falsification

The [13 deterministic tests](../../tests/agent46-anytime-balanced-paired-sign-betting.test.cjs) reproduce the math on synthetic registered 32/64/128-cell rounds, directional reversal, candidate family allocation, cancellation of opposing rank effects, no qualification, source mismatch, strict round IDs, explicit independence declaration, and zero or unequal rounds. All 13 passed in a fresh V8 CommonJS-style harness using the committed source blobs. The related confidence-band, native-to-statistics bridge and frozen-rank6 postprocessor tests also passed independently. The latest test was added only after the older manual [GitHub CI 41502977524](https://github.com/FlareZ123/experiment-01/actions/runs/41502977524) had run, so that earlier green status does not cover these bytes.

**Striking entirely hypothetical case:** 7 complete independent rounds across 32 cells = **224 original-source paired comparisons**. Suppose all 224 reference/challenger games are fully paper qualified, and 7 pairs (one in the same cell during each round) are challenger wins against reference nonwins. The remaining 217 pairs are concordant nonwins. For k=1 and α=.05, the mixture betting evidence is **45.138572697**, above its preallocated threshold **40**; it rejects the null of nonpositive equal-field improvement at the configured familywise rate. The pooled Hoeffding interval on those same hypothetical games remains undecided. With only six such discordances, the mixture evidence is **25.371929306**, below the threshold. These examples are synthetic test inputs and **zero evidence of any real Pokémon deck improving**.

**Counterexample when cross-cell independence is absent:** Take two field cells whose differences are perfectly correlated: both D=+1 with probability 1/2, or both D=−1 with probability 1/2. The field null μ=0 holds, yet for η=.75 the expected round betting factor is **1.5625**, exceeding one. Thus the mathematical guarantee collapses if different opponent-cell games share a correlated stochastic source, shared seed stream or coordinated decision policy. Reusing the same seed across different ranks, or merely asserting independence in a JSON flag, is insufficient proof. Any actual release must independently certify a suitable physical-deal randomization plan and noninterfering, frozen policy.

## Applicability and limits

A genuine independent **full 32-source** balanced round cannot currently be assembled. The original 60s at ranks 23,25,28 are still unavailable, and the 29 authenticated originals have **zero competitively qualified games**. Even with good math, a source game must be fully paper legal, demonstrate natural strategy under owner-visible information, respond to the opponent competently and respect the paper 25-minute clock. The new test is therefore a prospective research-selection method awaiting valid experimental data. A favorable native simulation outcome must remain censored today, and it cannot be used to nominate a best deck or claim 99.5%.
