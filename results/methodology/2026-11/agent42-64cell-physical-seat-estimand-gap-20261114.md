# Agent42: 64-cell anytime evidence does not automatically cover the 128-stratum field mean

**14 November 2026 · Methodological review only.** No deck, policy, or competitive game result is produced.

## Question

Can the existing 64-cell equal-rank/equal-start anytime or correlation-robust evidence process certify the current 128-stratum field mean, which separately balances candidate physical seat and actual first-player seat?

## Finding

**Not without an additional physical-seat sampling assumption or a different block definition.**

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

But a complete 64-cell stream that always assigns the candidate to slot A has 64/64 wins in every round. The correlation-robust process can eventually cross its threshold because its actual conditional round mean is 1.00. The process's mathematical guarantee is not broken: the conditional-round-mean premise is satisfied for the A-only stream. What fails is the inference that this premise follows from the 128-stratum null when candidate physical seat is not sampled.

This is a design/estimand mismatch, not a claim that Twinleaf actually has a seat asymmetry. The 64-cell process remains valid for its narrower rank × actual-start estimand when that is the intended target.

## Resolutions

1. **Reuse a fair-orientation physical-seat pair per rank.** There is already a related design in `simulation/evaluation/agent37-aichi-995-paired-seat-rejection.cjs` and `results/statistics/agent37-aichi-995-anytime-paired-seat-rejection-20261105.md`: for each rank, a complete two-game pair contains one game in each physical candidate seat and one game with the candidate actually first and second; an independent fair orientation coin selects which of the two diagonals is sampled. That module is a **rank-specific hard-matchup rejection test**, not a drop-in field-mean test. However, its pair construction and orientation gate are directly reusable for the aggregate process. One such pair per rank yields 64 games per field block. If each rank's orientation coin is fair and independent of prior outcomes, then the expected pair win average is the equal mean over that rank's four physical-seat × actual-start cells, even with arbitrary within-pair outcome dependence. Averaging the 32 rank-pair means gives `E[Y_t | F_(t-1)] = P`. The 64-cell aggregate validator must therefore require the full per-rank pair shape and verify each recorded orientation receipt; the existing `rank:startingSeat` uniqueness check alone is insufficient. The coin's fairness/freshness remains an external audit requirement.

2. **Pair rounds into a 128-stratum block.** Combine two 64-cell rounds so that every (rank, candidate slot, actual-start) cell appears exactly once. Apply the correlation-robust e-process to the 128-game block mean. This removes the need to assume away or randomize physical-seat effects, at the cost of a larger block and a new validator/test contract.

3. **Retain a separate 64-cell estimand.** Keep the existing code unchanged but explicitly state that it estimates the equal-weight rank × actual-start mean under its own conditional-round-mean assumption. Do not use it as a certificate for the current 128-stratum seat-balanced nomination gate.

The fixed-sample 128-stratum methods already include candidate physical seat and avoid this specific coverage gap. They retain their own stronger independence/i.i.d. assumptions and do not replace the correlation-robust method.

## Reproduction and scope

Reviewed:
- `scripts/aichi-anytime-field-evidence.cjs` — 64-cell validator and `rank:startingSeat` uniqueness key;
- `scripts/aichi-correlated-round-evidence.cjs` — inherited validation and round-mean e-process;
- `tests/aichi-correlated-round-evidence.test.cjs` — accepted synthetic all-slot-A round;
- `results/statistics/agent12-exact-balanced-field-all-win-bound-20261107.md` — current 128-stratum definition;
- `README.md` and `results/statistics/README.md` — current field-evidence and nomination requirements.

I sent the issue and proposed resolutions to Agent37 and Agent12 in their mailboxes on 14 November 2026. No implementation or workflow changes were made pending their review.

**Limits:** This analysis establishes only that the current 64-cell validator does not enforce the physical-seat randomization/balance needed to identify the 128-stratum estimand. It does not determine which estimand the repository should ultimately adopt, nor does it provide any evidence about a candidate deck's win rate. The benchmark still has no selected final 60 and zero competitively qualified games.
