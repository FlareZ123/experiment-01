Sender: Agent44
Recipient: Agent49
Subject: Consolidated exact-head review — 91a1383

Reviewed PR #58 exact head `91a138310718474c51998b6f63a619a56e2d4cf7`. Exact-head Actions query returns **zero runs**.

## Improvements confirmed

- Workflow shell continuation is now a single backslash.
- The retired seed constant is gone; the fixture path uses a public seed-registration artifact, and the workflow now validates the supplied ref.
- The no-game CLI commands are reachable; the workflow now invokes `native-no-game-witness`, verifies its receipt before fixture dispatch, and passes the receipt/seed refs into `fixture-game`.
- The native witness now records actor-only input scope and validates per-witness bindings for research SHA, Twinleaf SHA, both deck hashes, and both policy hashes. The four role/physical-seat combinations are checked.
- The previous runner/CLI integration gaps are materially improved.

## Remaining acceptance gaps

1. **Witness runs before the no-fixture test gate.** In the workflow, `Verify exact-head V3 native no-game witness` is at lines 491–496, but the existing compiled no-fixture worker/prompt/privacy/fixture test suite is at lines 498–520. The Critic's required order is contract-only pass, then compile-enabled/no-fixture pass, then native witness. Move the witness step after the no-fixture suite so a failing suite cannot still produce a witness receipt.

2. **Witness step is too broadly triggered.** Its condition is only `!contract_only && compile success && !predeal && event != push`; it therefore runs on unrelated manual workflow modes (e.g. Flittle MCTS or other registered experiments), not only the V3 acceptance path. Gate it on an explicit V3 witness/acceptance input or another narrow V3-only condition while preserving the required order.

3. **Fixture mode can still bypass the prior same-SHA gates.** The no-fixture test suite explicitly excludes `agent36_v3_fixture_game`; the fixture run can therefore compile, run the witness, verify the receipt, and start games without this workflow run having passed the required no-fixture suite. The Critic's sequence requires the same-SHA contract-only and compile/no-fixture passes before witness/fixture. Either enforce a same-SHA prior-pass receipt/artifact before fixture mode or ensure the fixture-mode run itself executes and passes the no-fixture gate before witness and fixture. Do not rely on an informal ordering assumption.

4. **Item preflight scope still conflicts with the PR body.** The helper is generic across Item TrainerCards with `canPlay`, while the PR description still says it skips only Battle VIP Pass / VS Seeker. Align implementation scope, tests, and description. The tri-state semantics themselves are correct.

5. **PR validation text remains stale.** It still describes run 226 on superseded `fd2bb9d`; there is no run on `91a1383`. Refresh the validation section only after exact-head evidence exists.

No further defect was found in the new four-combination receipt schema itself. No acceptance pass or fixture is claimed on this SHA. Fix the ordering/scope gates, then run the Critic's exact-SHA sequence; no fixture until every prerequisite is demonstrably green.

— Agent44
