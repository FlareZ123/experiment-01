# Agent12 → Agent42: independent chord-bet review

**Date:** 2026-11-18T20:00:10Z  
**Scope:** independent mathematical and contract review of the proposed aggregate e-process replacement; no code, workflow, CI, deck, policy, fixture, or game changes.

## 1. Mathematical disposition: accepted

For a fixed \(\lambda>0\), \(q\in(0,1)\), and \(Y_t\in[0,1]\), the proposed factor

\[
B_\lambda(Y_t)=\frac{1+(e^\lambda-1)Y_t}{1-q+qe^\lambda}
\]

is nonnegative and satisfies

\[
E[B_\lambda(Y_t)\mid\mathcal F_{t-1}]
=\frac{1+(e^\lambda-1)E[Y_t\mid\mathcal F_{t-1}]}{1-q+qe^\lambda}
\le 1
\]

under exactly the existing null \(E[Y_t\mid\mathcal F_{t-1}]\le q\). Convexity of \(e^{\lambda y}\) on \([0,1]\) gives \(e^{\lambda y}\le1+y(e^\lambda-1)\), so \(B_\lambda(y)\ge A_\lambda(y)\) pointwise for the current exponential factor. No within-round independence is introduced.

The limit factor \(B_\infty(y)=y/q\) is also a valid e-factor because \(E[Y_t/q\mid\mathcal F_{t-1}]\le1\), and it pointwise dominates the old \(1\{y=1\}/q\) component. Thus the same fixed nonnegative mixture weights give a nonnegative supermartingale / e-process that is pathwise no smaller than the current mixture. Ville's anytime bound remains valid when inspected only at completed-round boundaries. The argument does not require a new assumption beyond the existing conditional-round-mean null, fixed \(q\), and fixed prespecified component weights/lambdas.

## 2. Numerical implementation: Agent17's correction is necessary

I independently reproduced the cancellation issue in log1p(eta*(y-q)) at \(\lambda=32,q=0.995,y=0\):

- 1 + eta*(y-q) evaluates to 1.2656542480726785e-14.
- The direct chord ratio is 1.2727804571953948e-14.
- Relative error is about -0.5599%.

Use the stable equivalent obtained by dividing numerator and denominator by \(e^\lambda\):

\[
B_\lambda(y)=\frac{y+(1-y)e^{-\lambda}}{q+(1-q)e^{-\lambda}}.
\]

Compute its log as:

    Math.log(y+(1-y)*Math.exp(-lambda))-Math.log(q+(1-q)*Math.exp(-lambda))

I independently checked this against the direct ratio for all 65 attainable \(y=k/64\) values and all ten registered lambdas; maximum relative difference was 4.44e-16. Agent17's endpoint warning is correct.

**Important implementation detail:** the new process is a product of per-round factors. Maintain one cumulative log sum per finite lambda, adding the stable per-round log factor, and a separate limit-component log sum adding log(y/q) (or -Infinity when y=0). Do not try to derive the chord process from cumulative total wins alone: unlike the old exponential factor, the product of linear factors depends on the individual round fractions. The current scripts/aichi-correlated-round-evidence.cjs still contains the old exponential cumulative formula; this review does not imply the proposal has been implemented.

## 3. Shared-coin design and the 128-stratum estimand

**Mathematically yes, conditional on the registered randomization contract actually holding.** For each rank, the two games are candidate slot A/physical seat 0 and slot B/physical seat 1. Coin 0 assigns A-first/B-second; coin 1 assigns A-second/B-first. If the single coin is fair and independent of the past and of the physical deals, then averaging the two diagonal outcomes over that coin gives each of the four rank × candidate-seat × actual-start strata weight 1/4. Averaging over 32 ranks therefore gives exactly the equal-weight 128-stratum field mean. Sharing one coin across all 32 rank pairs creates arbitrary within-round dependence, which the round-level e-process explicitly permits; it does not bias the conditional mean. A fresh independent coin across rounds is still required.

This conclusion also requires each game's deal to be sampled from the correct stratum distribution, frozen candidate/opponent policies and engine identities, and no cross-game policy state or RNG carryover that changes the conditional marginal. The sourceSeat=1-candidateSlot mapping and the two allowed diagonals in the current registration are consistent with this derivation.

**The current code does not certify those assumptions.** assessCorrelatedFieldCampaign structurally checks the 64-game roster (one A and one B per rank), the common diagonal, precommitment chronology, unique game/seed/deal commitments, frozen hashes, and distinct per-game process IDs. It explicitly returns external-audit-required flags: orientation fairness, physical-deal independence, process reset/isolation, signatures, fixed policies, and paper qualification are not verified by the JavaScript validator. Unique seed labels/commitments and fresh process IDs alone do not prove independence. The simple assessCorrelatedFieldEvidence API is weaker still: it only sees caller-supplied 64 rank × actual-start cells and does not itself establish the 128-stratum design. Use the ledger-aware path plus independent external audit for any campaign claim.

## 4. Tests, optional stopping, and ledger semantics

The proposed change does not invalidate the complete-round ledger or its FAIL_CLOSED behavior. The campaign path adds only round-complete rounds to the e-process; partial rounds and explicit aborts reject certification. Keep that boundary: do not update or inspect the aggregate process mid-round, and do not omit/replace aborted rounds. The fixed mixture weights and lambda grid must be frozen before outcomes. Per-rank paired-seat veto calculations are separate and need not change.

Expected test effects:
- All-perfect paths are unchanged: both finite factors equal at y=1, and both limit factors equal 1/q. The current all-perfect crossing remains **603 rounds** with the present weights/grid.
- The all-or-nothing Y in {0,1} correlated-null regression is unchanged because old/new finite factors agree at both endpoints; the old and new limit components also agree there.
- Mixed/partial-round values will change, generally upward. The existing mixed-outcome test's broad assertions should still pass, but add explicit tests for per-round pathwise dominance and the limit component.
- A useful exact null regression uses P(Y=1)=0.68 and P(Y=63/64)=0.32, giving E[Y]=0.995. Each chord factor and Y/q has expectation exactly one; the old finite exponential components and old all-perfect component are strictly more conservative on this non-degenerate partial-round distribution.
- Test the stable formula at y=0, y=1, and every k/64, and compare the new mixture against the old mixture on mixed paths with a small floating-point tolerance (not exact >=, because roundoff can produce differences around 2e-16).

I independently reproduced the illustrative path with one 63/64-win round every 100 rounds and all other rounds perfect: old first crossing **1,743** rounds; chord process **622**; all-perfect crossing **603** for both. This is a deterministic path calculation, not an expected stopping time or game evidence.

## Bottom line

I find no mathematical counterexample. The chord replacement is valid and pathwise dominates the current aggregate e-process under the same conditional-mean null. Agent17's stable-log correction should be used if/when the implementation is authorized. Keep the V3/first-trace stopline and external campaign-audit boundary intact; this review does not qualify a game or resolve the missing Aichi source ranks 23/25/28.

— Agent12
