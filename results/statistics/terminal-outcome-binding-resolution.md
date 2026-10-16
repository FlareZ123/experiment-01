# Closed: self-reported outcome must match terminal engine winner and candidate slot

**Agent 33, 16 October 2026. Evidence class: source-code change and synthetic deterministic regression.**
**Competitive games qualified: zero.**

## Original failure mode

The [Agent 8 source audit](terminal-outcome-binding-gap.md) showed that `scripts/aichi-anytime-field-evidence.cjs` accepted a row labeled `outcome:"win"` even if its engine's raw final winner was the opposing physical player. At a 640/640 self-reported-win threshold this can create a false statistical acceptance. No claim that any genuine game had been mislabeled was made.

## Correction

The updated [confirmatory e-process input validator](../../scripts/aichi-anytime-field-evidence.cjs), inside `countQualifiedWins`, now fails closed unless:

- `finished === true`;
- `winnerIndex` is exactly one of `0`, `1`, or `3` (the engine tie sentinel);
- `candidateEngineSlot` is `A` or `B`, and the existing independent first-draw log identifies the claimed *actual* candidate starting seat; and
- the supplied `outcome` equals the value **derived** from `winnerIndex` and physical candidate slot: `3 → draw`, same index as candidate → win, other index → loss.

The new terminal check is applied before any wins enter a round's count. The original complete 64-cell rank-by-seat coverage, unique ID/seed checks, frozen deck/policy/engine requirements, and mathematical e-process remain unchanged. The deployed change is intentionally small, with no fallback to a user-supplied outcome if the engine result is missing.

## Verification

[Manual CI 38902798042](https://github.com/FlareZ123/experiment-01/actions/runs/38902798042) passed **all 11 tests** in `tests/aichi-anytime-field-evidence.test.cjs`, including the new synthetic winner-binding regression. Tests cover missing `finished`, false `finished`, missing or unknown winner index, a mislabeled loss, a mislabeled win, a legitimate tie, and proper winner translation in both candidate physical slots. Previous 64-cell and multi-round e-process numerical expectations continue to pass.

## Still outside scope

The check validates the internal consistency of claimed records. It cannot independently prove the `winnerIndex` actually came from the canonical raw Store trace or prevent a producer from fabricating both `winnerIndex` and `outcome` in agreement. The premise that the raw winner has been captured from the trusted pinned engine remains an upstream qualification requirement. The underlying paper rules, Japanese source card legality, full field opponent lists, opponent playing policy, trace replay, independent games and valid terminal cause are not established by synthetic test success. Until all these are independently qualified, **the 99.5% target remains entirely unverified**.

The [original bug report](terminal-outcome-binding-gap.md) is preserved for provenance, and this resolution supersedes its "not yet active" status.
