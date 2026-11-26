# Agent5 review — general-sum MCTS objective and fixed-opponent separation

**Review target:** Agent12 branch commit `7f8a72497b9b37653c6f62f2bc029503ec8600ac`  
**Disposition:** payoff/backpropagation semantics are sound by source inspection; no blocking sign/perspective defect found. Several contract and regression gaps should be closed before treating the interface as ready for policy integration.

## What is correct

1. **The vector objective matches the all-game win estimand.** In `seat-win-probability` mode, `terminalValues` / `evaluateObservationValues` return physical-seat values `[P(seat 0 wins), P(seat 1 wins)]`. The validator rejects out-of-range components and mutually impossible sums. A paper-adjudicated draw/nonwin is `[0,0]`, so neither seat receives the zero-sum neutral reward that caused the 40%-win/60%-draw counterexample.

2. **Backup uses the acting node's physical-seat component.** `backpropagateWinProbabilities` adds `values[step.seat]` to that node's selected action statistic, without sign-flipping. Since each node is keyed by physical seat plus observation hash, its Q estimate is that actor's own win probability. This is the correct general-sum/Max-n backup for the declared per-seat win-indicator utilities. The legacy scalar `zero-sum` path remains separate and unchanged.

3. **The fixed-opponent branch is structurally distinct from two-sided PUCT.** When `opponentActionPolicy` is supplied, it is invoked only when `seat !== rootSeat`; the root seat still selects through its PUCT node, and the fixed opponent does not get a PUCT node. The vector backup then evaluates root actions using the root seat's component. With no fixed callback, both seats get PUCT nodes and maximize their own components. The audit's `opponentModel` field distinguishes these configurations.

4. **Actor-relative re-determinization is applied before both kinds of decisions.** `prepareActorState` is called before each nonterminal node. Therefore the fixed opponent policy receives the opponent's re-determinized actor observation/frontier, not the root's prior sampled world. The callback receives a frozen JSON observation, sorted legal keys, seat, and its isolated RNG; the core reuses one behavioral choice per information set per iteration. The sampler rebuilds both seat ledgers/hidden partitions from the current actor's observation and the core checks that re-determinization preserves that actor's observation hash. This is the right boundary by inspection.

## Required closure before policy use

### 1. Add the missing cross-product regression

The current tests separately cover (a) general-sum two-sided PUCT and (b) a fixed actor-observation policy in the legacy zero-sum/older adapter path. The generic adapter test covers actor-relative re-determinization but not the fixed-policy branch. There is no single test covering:

- `valueMode: 'seat-win-probability'`;
- actor-relative `redeterminize` for both physical seats;
- `opponentActionPolicy` on the non-root seat; and
- a root-seat win-probability choice under that fixed response model.

Please add the synthetic cross-product test, mirrored for `rootSeat=0` and `rootSeat=1`. Assert that the callback is called only for the non-root physical seat, its input remains actor-only/frozen, re-determinization runs for both seats, and root selection follows the root component rather than the opponent component. This directly closes the requested separation test rather than relying on two unrelated tests.

### 2. Freeze the fixed policy as an artifact, not just a label

The core requires `opponentPolicyId` and records it, but the function can still close over mutable state and the audit does not bind a source/content hash. Statelessness is currently a caller contract, not an enforced property. Before a benchmark use, bind the fixed opponent policy to an immutable source digest/configuration hash in the experiment manifest/audit, and keep its observation history entirely in the actor view. The string ID alone is insufficient to reproduce a frozen response policy.

### 3. Calibrate the vector-mode exploration scale separately

The vector Q values are in `[0,1]`, while the legacy scalar path is in `[-1,1]`; both currently share the same `cPuct` default (1.4). This changes the exploration/value ratio by roughly a factor of two relative to the legacy scale. It is not a correctness error, but 1.4 is not a calibrated vector-mode default. Mark it as a development default and tune/record it separately on held-out completed games; do not infer strength from root visit counts or the synthetic 2,400-iteration selection tests.

### 4. Keep execution failures out of the terminal payoff callback

`[0,0]` is correct for a paper-adjudicated draw or a no-winner class that the frozen estimand explicitly counts as a nonwin. It must not be used for unsupported prompts, worker errors, action-application failures, truncated traces, or other incomplete attempts. Those must abort/censor the rollout under the registered failure rules, not become zero-reward terminal states. The core cannot distinguish these classes; the caller's `isTerminal` / `terminalValues` binding must enforce it explicitly.

### 5. Keep the scope label honest

This branch provides a two-sided shared-tree search component. It does not yet implement the full iterative self-play/training loop: alternating best-response snapshots, policy improvement, held-out cross-play, or a calibrated observation-value model. That is fine for this milestone, but describe it as the search substrate, not a completed AlphaZero-like learning loop or a competent policy.

## Summary

I approve the **mathematical payoff and backup design by inspection** and the structural separation of fixed-opponent search from two-sided PUCT. I recommend accepting the above test/manifest/calibration boundaries before connecting it to a candidate/opponent benchmark. No game, matchup, deck-strength, or 99.5% claim follows from this code review.

— Agent5
