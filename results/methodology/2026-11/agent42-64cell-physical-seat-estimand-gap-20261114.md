# Agent42: 64-cell anytime evidence does not automatically cover the 128-stratum field mean

**14 November 2026 · Methodological review only.** No deck, policy, or competitive game result is produced.

## Question

Can the existing 64-cell equal-rank/equal-start anytime or correlation-robust evidence process certify the current 128-stratum field mean, which separately balances candidate physical seat and actual first-player seat?

## Finding

**Not without an additional physical-seat sampling assumption, a different block definition, or an independently validated proof that physical-seat effects are absent for the full tested environment.**

The current 128-stratum estimand is

P = (1/128) Σ_{r=1}^{32} Σ_{s∈{A,B}} Σ_{f∈{first,second}} p_{r,s,f}.

The existing 64-cell validator in `scripts/aichi-anytime-field-evidence.cjs` covers only `(rank, startingSeat)`. It requires `candidateEngineSlot` and verifies the actual first-player identity against that slot, but its uniqueness key is only `rank + ':' + startingSeat`. It does not require both candidate physical slots within a cell or across a complete round. `scripts/aichi-correlated-round-evidence.cjs` inherits this validator and treats the mean of those 64 outcomes as its round observation.

The current synthetic fixture in `tests/aichi-correlated-round-evidence.test.cjs` sets `candidateEngineSlot: 'A'` for all 64 games and is accepted. This is legal under the current validator.

The existing `Agent37` fair-orientation pair method is related but distinct: it already prevents deterministic-diagonal bias for a per-rank 84% hard-matchup rejection test. It does not automatically repair the 64-cell aggregate validator, because that validator does not require the two-game per-rank pair or its orientation coin, and the Agent37 per-rank e-process is not the aggregate field-mean e-process. Reuse the pairing gate only as an input-contract component; retain the aggregate process's own field-mean proof and threshold.

## Counterexample

Let every rank and actual-start context have:

- p(r,A,f) = 1.00 when the candidate occupies engine slot A;
- p(r,B,f) = 0.98 when the candidate occupies engine slot B.

Then the equal 128-stratum field mean is

P = (1.00 + 0.98)/2 = 0.99,

which is below the 0.995 null boundary.

But a complete 64-cell stream that always assigns the candidate to slot A has 64/64 wins in every round. Under the current correlation-robust mixture weights and lambda grid, the first all-perfect crossing occurs at round 603 (38,592 A-only wins); the existing 610-round test is a sufficient demonstration, not the minimum. The process's mathematical guarantee is not broken: the conditional-round-mean premise is satisfied for the A-only stream. What fails is the inference that this premise follows from the 128-stratum null when candidate physical seat is not sampled.

This is a design/estimand mismatch, not a claim that Twinleaf actually has a seat asymmetry. The 64-cell process remains valid for its narrower rank × actual-start estimand when that is the intended target.

## Resolutions

1. **Use one round-level fair-orientation coin across all 32 rank pairs.** There is already a related pair construction in `simulation/evaluation/agent37-aichi-995-paired-seat-rejection.cjs` and `results/statistics/agent37-aichi-995-anytime-paired-seat-rejection-20261105.md`: for each rank, a complete two-game pair contains one game in each original-source physical seat (equivalently, each candidate physical seat, because the two players occupy opposite slots) and one game with the candidate actually first and one with the candidate actually second. For an aggregate 64-game block, a **single fresh fair coin for the entire round** is sufficient: coin 0 assigns (A,first)+(B,second) for every rank; coin 1 assigns (A,second)+(B,first) for every rank. Generate it in the trusted experiment host from a dedicated entropy source separate from the physical game seed and worker policy RNG, before any game in the round. Only realized seat assignments are visible to policies; the randomizer and its seed are not passed into workers. Complete all 32 pairs regardless of earlier outcomes and check the e-process only after the full round.

   Agent37's module is a **rank-specific hard-matchup rejection test**, not a drop-in field-mean test. Its pair construction/orientation contract is related prior art, but the aggregate process needs its own round-level coin receipt and field-mean proof. One pair per rank still yields 64 games per block. A shared round coin intentionally correlates the pair orientations across ranks; that is harmless for the existing correlation-robust e-process, which permits arbitrary dependence among all games within a complete round. Independent fair coins per rank would also preserve the expectation, but are not required.

**Why a round-level fair orientation preserves the 128-cell mean.** Write p(r,s,f) for the win probability in rank r, candidate physical slot s, and actual-start status f. Let C_t be the shared fair coin for round t. If C_t=0, rank r samples (A,first)+(B,second); if C_t=1, it samples (A,second)+(B,first). For the 64-game round mean Y(t),

`E[Y(t) | F_(t-1)] = (1/2)(1/64) Σ_r [p(r,A,first)+p(r,B,second)] + (1/2)(1/64) Σ_r [p(r,A,second)+p(r,B,first)] = P.`

The result uses linearity of expectation only; it does not require independence between games in a pair or among ranks within a round. It does require the round coin to be genuinely fair and independent of prior completed rounds, to be drawn before any game in its round and kept separate from physical/policy RNG streams, all 32 rank pairs to complete regardless of earlier outcomes, the e-process to be checked only after the full round, and the fixed-stratum probabilities to remain stable.

For any `lambda > 0`, convexity gives `exp(lambda*y) <= 1-y+y*exp(lambda)` for `0 <= y <= 1`. Thus under `P <= q`, the round-level process

`M(t,lambda) = exp(lambda * Σ_{u<=t} Y(u)) / (1-q+q*exp(lambda))^t`

is a nonnegative supermartingale. The all-perfect-round component `1{Y(1)=...=Y(t)=1}/q^t` is also a supermartingale because `Pr(Y(t)=1 | past) <= E[Y(t)|past] <= q`. A fixed convex mixture therefore supplies an anytime-valid aggregate test. This is the existing correlation-robust e-process's proof, with the new round-level fair orientation supplying the missing 128-stratum conditional-mean identity. It is not the independent-game 64-cell anytime formula, and it does not inherit Agent37's per-rank threshold.

**Required admission tests for this design:**

- Every round contains exactly 64 games: exactly two per rank, with one candidate physical slot A and one B, and one candidate-actual-first and one candidate-actual-second.
- A single round-level orientation bit is present and identical for all 32 rank pairs.
- For bit 0, every rank maps A→first and B→second; for bit 1, every rank maps A→second and B→first.
- Reject missing/duplicate ranks, duplicate game IDs or physical seeds, wrong first-player mapping, inconsistent orientation bits, partial rounds, and any round whose receipt does not bind the orientation draw to the host-side entropy source.
- Record the draw before any game in the round; never choose or revise it after seeing an outcome. The host-side orientation RNG must be separate from physical shuffle and worker policy RNG. External audit must validate fairness/independence; a self-asserted `orientationCoin` field is not proof.

2. **Pair rounds into a 128-stratum block.** Combine two 64-cell rounds so that every (rank, candidate slot, actual-start) cell appears exactly once. Apply the correlation-robust e-process to the 128-game block mean. This removes the need to assume away or randomize physical-seat effects, at the cost of a larger block and a new validator/test contract.

3. **Prove physical-seat invariance.** If an independent audit establishes that the pinned engine, research hooks, policies, and all relevant action/prompt paths are invariant under swapping physical player slots for the complete opponent field, the 64-cell estimand can coincide with the 128-stratum mean. A few mirrored fixtures or a source-seat-only smoke are not a field-wide symmetry proof.

4. **Retain a separate 64-cell estimand.** Keep the existing code unchanged but explicitly state that it estimates the equal-weight rank × actual-start mean under its own conditional-round-mean assumption. Do not use it as a certificate for the current 128-stratum seat-balanced nomination gate.

The fixed-sample 128-stratum methods already include candidate physical seat and avoid this specific coverage gap. They retain their own stronger independence/i.i.d. assumptions and do not replace the correlation-robust method.

## Related simulator-fidelity evidence

The repository's [Twinleaf turn-zero shuffle-stream seat-symmetry audit](../twinleaf-setup-shuffle-seat-symmetry-audit-20261106.md) found protocol-sensitive opening/mulligan outcomes in one same-seed rank4/rank1 cohort (legacy shared stream 8/0 mulligans by physical seat versus 6/7 under the Agent26 per-seat setup adapter). A separate identical-rank4 control did **not** reproduce a general seat0-only bias, and neither shuffle protocol was proven to match paper shuffling. This is not evidence of a general seat-dependent win rate. It does show that the pinned simulator's physical shuffle protocol can alter physical openings, so a field-wide seat-invariance assumption must be demonstrated rather than inferred from symmetric paper rules.

The existing Agent15 and Agent37 paired-seat rejection analyzers also show that the repository already has complete-pair methods that tolerate within-pair dependence. Those are per-rank hard-matchup rejection tools, not aggregate 99.5% field-mean certificates. Their pair/orientation admission logic is reusable; their per-rank threshold/e-process is not a substitute for the aggregate round-mean test.

## Reproduction and scope

Reviewed:
- [`scripts/aichi-anytime-field-evidence.cjs`](../../../scripts/aichi-anytime-field-evidence.cjs) — 64-cell validator and `rank:startingSeat` uniqueness key;
- [`scripts/aichi-correlated-round-evidence.cjs`](../../../scripts/aichi-correlated-round-evidence.cjs) — inherited validation and round-mean e-process;
- [`tests/aichi-correlated-round-evidence.test.cjs`](../../../tests/aichi-correlated-round-evidence.test.cjs) — accepted synthetic all-slot-A round;
- [Agent12's 128-stratum definition](../../statistics/agent12-exact-balanced-field-all-win-bound-20261107.md) — current 128-stratum definition;
- [repository rules](../../../README.md), [results decision board](../../README.md), and [statistics index](../../statistics/README.md) — current field-evidence and nomination requirements;
- [Agent8's original 64-cell anytime report](../../statistics/anytime-field-aggregate.md) and [Agent37's 64-cell correlation-robust report](../../statistics/correlation-robust-field-rounds.md) — the two 64-cell estimands reviewed here;
- [Agent37's fair-orientation paired-seat analyzer](../../../simulation/evaluation/agent37-aichi-995-paired-seat-rejection.cjs) and [paired-seat report](../../statistics/agent37-aichi-995-anytime-paired-seat-rejection-20261105.md) — related per-rank hard-veto design, not a drop-in aggregate certificate.

I sent the issue and proposed resolutions to Agent37 and Agent12 in their mailboxes on 14 November 2026. No implementation or workflow changes were made pending their review.

## Confidence

- **High:** the current 64-cell validator keys coverage by rank × actual-start and accepts the synthetic all-slot-A fixture.
- **High:** the stated A/B counterexample separates the 64-cell conditional mean from the 128-stratum field mean.
- **High, conditional on design assumptions:** the fair-orientation pair identity and aggregate round-mean e-process derivation are mathematically valid when the coin is genuinely fair, policies/probabilities are stable, and complete rounds are sampled as specified.
- **Unknown:** whether the pinned engine has a systematic physical-seat win-rate effect. The setup-shuffle audit is protocol-sensitive opening evidence, not a field-wide seat-effect estimate.

**Limits:** This analysis establishes only that the current 64-cell validator does not enforce the physical-seat randomization/balance needed to identify the 128-stratum estimand. It does not determine which estimand the repository should ultimately adopt, nor does it provide any evidence about a candidate deck's win rate. The benchmark still has no selected final 60 and zero competitively qualified games.
