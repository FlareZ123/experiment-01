# Exact one-/two-nonwin i.i.d. bounds integrated into the 32-matchup evaluator

**Agent 12 · 13 November 2026 · independent review and evaluator integration.** These are conditional confidence methods, not game evidence, a deck recommendation, or a 99.5% performance claim.

## Decision and current evaluator behavior

Agent5's exact one- and two-nonwin derivations were independently checked and integrated into \`scripts/agent12-simultaneous-matchup-kl-bound.cjs\` as opt-in statistical branches. The structural \`validateFieldLedger()\` remains unchanged.

| Observed nonwins for one opponent | Sampling model | Games per stratum | Games/opponent | Total across 32 | Bound method |
|---:|---|---:|---:|---:|---|
| 0 | independent Bernoulli, possibly heterogeneous | **323** | 1,292 | 41,344 | exact all-win AM-GM |
| 1 | i.i.d. within each stratum | **436** | 1,744 | 55,808 | exact one-nonwin |
| 1 | independent, not necessarily identically distributed | **486** | 1,944 | 62,208 | heterogeneous Chernoff-KL |
| 2 | i.i.d. within each stratum | **534** | 2,136 | 68,352 | exact two-nonwin |
| 2 | independent, not necessarily identically distributed | **602** | 2,408 | 77,056 | heterogeneous Chernoff-KL |
| 3+ | any supported heterogeneous independent model | use existing KL design | — | — | heterogeneous Chernoff-KL |

Exact one-/two-nonwin branches activate only when the request declares \`stratumSamplingModel: 'iid-bernoulli-v1'\`, the opponent has exactly one or two nonwins, and the corresponding proof/inversion interval applies. The evaluator reports this as \`samplingModelDeclaration: 'iid-bernoulli-v1 (caller assertion; external audit required)'\`. Otherwise it reports the heterogeneous-independent-Bernoulli default and retains KL. All-win inference does not need the i.i.d. declaration. Three or more nonwins never use these exact branches.

The model declaration is currently a caller assertion; the validator does not cryptographically bind the string into the opaque registration digest. It must be present in the preregistration and independently audited. Do not use the exact branches if within-stratum game probabilities may vary, games share a common deal/seed cluster, sampling is selected after outcomes, or the four strata are not equally sampled. The broader heterogeneous KL method remains the safe default.

## One-nonwin proof and threshold

For four equally weighted candidate-seat × first-player-seat strata, let \(q_j=1-p_j\), \(Q=\sum_jq_j\), and let each stratum contain \(n\) independent i.i.d. games. For \(X\), total nonwins,

\[
G_1(q)=\Pr(X\le1)
=\prod_{j=1}^4(1-q_j)^n
\left(1+n\sum_{j=1}^4\frac{q_j}{1-q_j}\right).
\]

Under the null mean win rate at most 0.995, \(Q\ge0.02\). Monotonicity puts the maximum on \(Q=0.02\). Writing \(C=1+n\sum_jq_j/(1-q_j)\) and \(u_j=(1-q_j)^{-1}\), the Hessian of \(\log G_1\) is negative semidefinite when \(C\ge2\max_j u_j\). Since \(C\ge1+nQ\) and \(u_j\le(1-Q)^{-1}\), it suffices that \(1+nQ\ge2/(1-Q)\), which holds for \(n\ge53\). Symmetric concavity makes \(q_j=0.005\) least favourable. The exact p-value is therefore \(\Pr\{\mathrm{Binomial}(4n,0.005)\le1\}\).

With Bonferroni \(\alpha/32=0.0015625\), 435/cell fails (p=0.0015881270033271668; inverted lower bound 0.9949896284466906) and 436/cell passes (p=0.0015598130329003142; lower bound 0.9950010946446439).

## Two-nonwin proof and threshold

Let \(r_j=q_j/(1-q_j)\), \(R=\sum_jr_j\), and \(S_2=\sum_jr_j^2\). The exact probability of at most two nonwins is

\[
G_2(q)=\prod_{j=1}^4(1-q_j)^n H,
\qquad
H=1+nR+\frac{n^2}{2}R^2-\frac n2S_2.
\]

On the null boundary \(Q=0.02\), \(r_j\le r_{\max}=Q/(1-Q)\), \(R\ge R_{\min}=Q/(1-Q/4)\), and \(S_2\le R^2\), so

\[
H\ge1+nR+\frac{n(n-1)}2R^2.
\]

For \(f(r)=(1+nR-r)(1+r)^2\), \(f'(r)=(1+r)(1+2nR-3r)\). The difference between two coordinate derivatives of \(\log G_2\) is

\[
n(r_i-r_j)\left(-1+\frac{\xi_{ij}}H\right),
\]

where \(\xi_{ij}\) is a mean-value value of \(f'\). The bound \(f'(r)\le(1+r_{\max})(1+2nR)\) reduces Schur-concavity to \(D(R)\ge0\), where

\[
D(R)=-r_{\max}-nR(1+2r_{\max})
+\frac{n(n-1)}2R^2.
\]

For \(n\ge106\), \(D'(R)=n((n-1)R-(1+2r_{\max}))\ge0\) for \(R\ge R_{\min}\), and \(D(R_{\min})\ge0\) (0.010401200959159418 at \(n=106\), increasing thereafter). Thus \(H\ge f'(r)\), the Schur criterion holds, and symmetry makes the equal-stratum point \(q_j=0.005\) least favourable. The exact p-value is \(\Pr\{\mathrm{Binomial}(4n,0.005)\le2\}\).

At 95% familywise confidence, 533/cell fails (p=0.0015781239019163312; inverted lower bound 0.9949944036749971) and 534/cell passes (p=0.001552073004243888; lower bound 0.9950037583795005). The sufficient Schur-concavity threshold \(n\ge106\) is well below the 534/cell sample threshold.

## Regression and reproducibility

- Evaluator: \`scripts/agent12-simultaneous-matchup-kl-bound.cjs\`. It exports exact one-/two-loss inversion helpers and reports \`boundMethod\` per rank (\`all-win-exact\`, \`exact-one-loss-iid\`, \`exact-two-loss-iid\`, or \`heterogeneous-kl\`).
- Tests: \`tests/agent12-simultaneous-matchup-kl-bound.test.cjs\` covers 435/436 and 533/534 boundaries, the i.i.d. opt-in declaration, no-declaration KL fallback, and KL fallback for three nonwins.
- Independent Node 22.16.0 checks reproduced both exact lower-bound inversions and the 435/436 and 533/534 boundaries. An isolated evaluator harness with a stubbed structural validator confirmed one-loss/two-loss branch selection, the exact-vs-KL fallback, and the three-nonwin fallback.
- The repository's manual statistical workflow has **not** been dispatched. Do not claim CI success. Agent5's standalone design source, tests, and report remain intact.

## Scope and benchmark status

The structural ledger still requires all 32 original source identities, all 128 balanced rank/seat/first-player strata, frozen candidate/policy/engine/adjudication identities, unique trial/deal/receipt identifiers, and paper-qualified outcomes. External paper legality, deal independence, within-stratum i.i.d. sampling when opted in, and adjudication remain unverified caller/auditor responsibilities.

The Aichi benchmark remains 29/32 authenticated source lists, five unchanged Japanese-Extra-incompatible lists, three unavailable lists, zero original-source paper-admitted opponents, no selected final 60-card deck, zero competitively qualified games, and no demonstrated 99.5% result. These changes improve only conditional evidence efficiency; they add no game or matchup evidence.
