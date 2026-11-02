# Anytime matched-physical-deal deck comparison with censoring

**Agent 46 | 2 November 2026 | mathematical method, ten pure tests; zero actual qualified games.**

## Decision gap

The frozen rank-6 bilateral canary and physical-source deal audit create a useful experimental design: compare **one fixed challenger 60** against **one unchanged reference 60**, with identical authenticated original-source physical setups and independently executed game arms. A deck-ranking statistic must retain error, action-cap, paper-invalid and unverified attempts. Reporting only the subset of completed native wins would make failure-dependent selection look like an improvement.

The previous [anytime absolute field-win envelope](agent46-anytime-field-mean-censored-candidates-20261101.md) addresses a single fixed candidate's win rate. This separate [paired difference module](../../simulation/evaluation/agent46-anytime-paired-field-delta.cjs) directly estimates whether the challenger improves on the reference under matched original-source setups. This is potentially more powerful when paired outcomes are correlated, although the present conservative Hoeffding analysis does not exploit the covariance.

## Mathematical construction

Choose **one field estimand in advance**, with C=32 equal original ranks, C=64 rank × candidate physical seat cells, or C=128 rank × candidate physical seat × actual starting-order cells. Choose and freeze the reference, challenger, qualified-game protocol, paper-clock adjudication, identical two-player policy and deal generator. Give every prospective challenger-comparison hypothesis a permanent positive ordinal k.

For one registered source physical deal, let X be the challenger game's qualified win indicator and Y the reference game's qualified win indicator. The latent paired contrast D=X-Y belongs to [-1,1], including tied games as nonwins. If either arm is not independently certified as a complete competitive paper game, its indicator remains **unknown in [0,1]**. The recorded pair therefore provides a pathwise interval:

- challenger qualified win, reference qualified nonwin: D=[1,1];
- challenger qualified nonwin, reference qualified win: D=[-1,-1];
- challenger qualified win, reference censored: D=[0,1];
- challenger censored, reference qualified win: D=[-1,0];
- both censored: D=[-1,1].

Every registered paired deal, including failed arms, stays in the denominator. For cell i with n registered pairs, let a_n and b_n be the means of the pairwise lower and upper endpoints. The latent empirical mean is between a_n and b_n regardless of how censoring depends on outcomes.

Allocate a total two-sided familywise budget alpha across candidate comparison ordinal k, every cell i, and every time n>=1:

`delta(k,i,n) = alpha / [k(k+1) C n(n+1)]`.

Both reciprocal triangular series sum to one, so the sum of these budgets is alpha over any finite or countably infinite number of preregistered comparisons and repeated looks. The Hoeffding radius for random variables with range two is:

`epsilon(k,C,n) = sqrt(2 log(2 C k(k+1) n(n+1) / alpha) / n)`.

A cell interval is `[max(-1,a_n-epsilon), min(1,b_n+epsilon)]`; an untested cell is `[-1,1]`. Average all equal-weight cell endpoints to obtain the complete-field contrast envelope. Under independent iid **latent paired game draws within each prespecified cell** and stable game/policy conditions, the resulting field interval has simultaneous coverage at least 1-alpha over repeated looks and all candidate comparison ordinals. Censoring is arbitrary because its potential unknown values were conservatively retained.

**Statistical decision:** lower field contrast > 0 establishes a positive average challenger-reference difference under these assumptions. An upper field contrast < 0 establishes negative average difference. Either conclusion still requires independent external certification of the game inputs. This is a comparison statistic and alone cannot certify the challenger meets the separate **99.5% absolute win-rate target**.

## Reproducible implementation and example

- [CJS module](../../simulation/evaluation/agent46-anytime-paired-field-delta.cjs): exported `anytimePairedFieldDelta({candidateOrdinal,cells,alpha,targetDelta})`. Each cell contains full registered pairs with a unique pair ID, the two independently observed qualified/censored statuses, and matching source physical fingerprints. Duplicate pair IDs, missing fingerprints, unrecognized native-winner labels and invalid cell geometries fail closed. Crucially, **mismatched source fingerprints retain a full [-1,1] unknown pair** in the original registered denominator and increase `unmatchedPairs`; only actual matching deals may contribute an observed score.
- [Ten pure regressions](../../tests/agent46-anytime-paired-field-delta.test.cjs): empty field; fully censored field; one-sided censoring in both directions; positive, negative and tied hypothetical contrasts; candidate ordinal spending; 64/128 geometries; fingerprint mismatch retained as censored and duplicate-ID / unsupported-status rejection. Executed locally using Node's native test runner: **10/10 passed**.
- Included as a new step in the existing [manual-only global evidence workflow](../../.github/workflows/aichi-global-field-gate.yml), without any push-triggered workflow.
- As an **entirely hypothetical** positive-control fixture, 100 paired qualified challenger wins and reference nonwins in each of 32 cells gives 3,200 pairs. For k=1, alpha=0.05, the per-cell Hoeffding radius is approximately 0.584261 and the field lower contrast is approximately +0.415739. These figures are test arithmetic, **not Aichi game observations or evidence of a real deck being stronger**.

## Required use and limitations

1. Register all physical source deals **before** observing any outcomes. A pair has to share the *actual source physical setup*, not merely a seed. Both arms must be accounted for. Missing or errored arms are recorded as censored; a mismatched source fingerprint is kept as a full-range unknown contrast and counted separately, without deleting its registered pair.
2. The individual status `QUALIFIED_WIN` or `QUALIFIED_NONWIN` is an **external audit assertion**. This module cannot establish legal card costs, owner-information boundaries, adequate original-source policy, both-seat protocol, paper match clock or proper end-of-time adjudication. Hence its output explicitly sets `competitiveQualified:false`.
3. Replaying historically favorable deals, varying the reference, changing a deck midstream, or reusing old observational runs as a newly registered experiment invalidates the prospective inference. Selection of the 32/64/128-cell estimand after seeing results requires separate multiplicity control. Simultaneously consulting this paired method and the earlier absolute-win method for a single final claim also requires preregistered alpha allocation.
4. The estimator's target is an equal-weight field **difference**. A pairing scheme that changes the candidate's physical start/seat distribution, reweights opponent ranks, or changes the frozen policy creates a different estimand and needs a new registration. It is not yet wired into the canonical bilateral output schema. A strict producer should join the independent qualification ledger before assigning the two qualified labels.

## Actual empirical status

Original full lists for 29/32 opponents are authenticated; ranks 23, 25 and 28 still lack printed source sixties. The repository has **zero competitively qualified paper games and no established best fixed 60**. Accordingly no real Aichi result was input to this module, and no candidate deck has been promoted. The immediate useful next step is to connect this strict, registration-preserving comparison to the next **immutable two-player, owner-safe, paper-cost-verified cross-source release** once full-game qualification is available.
