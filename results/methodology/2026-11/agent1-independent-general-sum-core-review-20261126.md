# Independent review: general-sum MCTS core semantics

**Reviewer:** Agent1  
**Date:** 2026-11-26  
**Scope:** focused source/test review of the general-sum win-probability core proposed in PR #77. This is not a review of the complete Twinleaf adapter or a playing-strength result.

## Exact reviewed revision

The reviewed source and test blobs were:

- `simulation/twinleaf/2026-11/agent5-information-set-mcts.cjs` — `967b8c01076936e0d04abbf508e9802209952601`
- `tests/2026-11/agent5-general-sum-search.test.cjs` — `08b324cead3877d8851cff2f1a264ebd42fbd5a2`

Both blobs are identical at the tested code/test head `cf07589585a634bac0742b5565d5bc0f781415c2` and PR #77 head `d29bfed81d1d062fc4b6b8ae7cc354a0f18f723f`. The repository records exact-head native-search-only run [45817935923](https://github.com/FlareZ123/experiment-01/actions/runs/45817935923) as passing on `cf075895`. The reviewed code therefore matches the code exercised by that run.

## Findings

### 1. Per-node backup matches the declared objective

In seat-win-probability mode, `backpropagateWinProbabilities(path, values)` adds `values[step.seat]` to each selected action's statistic. Nodes are keyed by physical seat and actor-observation hash, and PUCT reads the node's acting-seat mean. Thus a seat-0 node maximizes estimated (P(\text{seat 0 wins})), while a seat-1 node maximizes (P(\text{seat 1 wins})). There is no inappropriate zero-sum sign inversion in this mode.

A terminal seat win maps to `[1,0]` or `[0,1]`; an adjudicated draw or adjudicated no-winner maps to `[0,0]`. This is the right utility vector for the stated estimand of game-win probability with draws/no-winners counted as non-wins. It is not a tournament-points utility, where a draw could have a different value.

### 2. Fixed-opponent best response is distinct from two-sided PUCT

When `opponentActionPolicy` is configured, only the non-root physical seat bypasses PUCT. The root seat continues to search; the non-root seat uses the frozen policy. The policy receives a deep-frozen actor observation, sorted legal action keys, seat, and isolated deterministic RNG. A per-rollout information-set cache avoids changing a behavioral action if the same opponent information set is revisited.

The audit distinguishes `root-best-response-fixed-opponent-policy` from `two-sided-puct` and records the fixed policy identity/protocol. This is a meaningful distinction: two-sided PUCT models both players selecting against their own win probability, while fixed-opponent mode evaluates a root best response against a specified policy.

### 3. Typed terminal outcomes are strict at the core boundary

The validator requires a plain data object with exact enumerable data fields. Seat wins require winner seat 0 or 1. Adjudicated draw/no-winner outcomes require a versioned rule ID, nonblank reason, and evidence ID. Bare payoff vectors, raw `NONE`, unresolved, invalid, aborted, and unknown classes are rejected.

The distinct no-winner class is retained in the rollout receipt even though it maps to `[0,0]`. The remaining trust boundary is external and correctly explicit: the core validates attestation shape; it cannot establish whether the event adjudicator's evidence actually justifies the classification.

### 4. Tests exercise the key perspective seams

The regression suite includes:
- a draw-heavy counterexample that distinguishes (P(\text{win})) from (P(\text{win})-P(\text{loss}));
- an opponent-node test in which seat 1 chooses according to its own win probability;
- a root-seat symmetry test for both physical root seats;
- a fixed-opponent cross-seat test that exercises both root seats, actor-relative redeterminization, and the requirement that the fixed policy is called only for the non-root seat;
- rejection of unclassified terminal states and preservation of the distinct no-winner receipt.

The root-seat symmetry fixture is deliberately small and does not, by itself, prove full two-sided play. The separate opponent-node and fixed-opponent cross-seat tests cover the relevant non-root perspective.

## Non-blocking limitations

1. **PUCT value-scale calibration remains open.** Legacy zero-sum Q values lie in ([-1,1]); the new seat-win-probability Q values lie in ([0,1]). Keeping the same default (c_{puct}=1.4) changes the exploration/exploitation ratio. Under the affine equivalence (Q_{old}=2P(\text{win})-1), preserving the old relative scale would imply approximately halving (c_{puct}). This is a mathematical scale relation, not an empirical recommendation: do not hard-code 0.7 without a credible game/policy loop and sensitivity evidence.

2. The suite tests the distinct no-winner receipt in a rollout, but does not add the analogous adjudicated-draw receipt assertion in a full rollout. The shared normalization path and draw-vector mapping are tested, so this is a narrow coverage improvement rather than a semantic blocker.

3. The core's strict shape validation does not prove external evidence provenance, paper-rules adjudication, actor-observation completeness, legal-action completeness, or policy competence. Those remain adapter/experiment responsibilities.

4. PR #77 is a historical core-only draft whose branch has diverged from current main. Do not merge its accumulated branch wholesale. Preserve the reviewed core semantics through the focused current-main transplant described in the Agent12/Agent5 handoff; this review does not certify PR #78's full adapter.

## Disposition

**No correctness blocker found in the reviewed general-sum core semantics or its focused regression suite.** Preserve the per-seat win-probability objective and typed terminal contract. Keep (c_{puct}) calibration, event-adjudicator evidence, complete actor history, native prompt continuation, and the K0/K1 adapter bridge as explicit unresolved gates.

This review is code/methodology evidence only. It establishes no complete game, no Aichi Top 32 matchup result, no policy-competence result, no deck nomination, and no win-rate estimate.
