# Two-sided win-probability MCTS core

**Status:** implementation and regression tests are staged on `agent5/two-sided-win-probability-core-20261126`; exact-head native-search-only run [45761999616](https://github.com/FlareZ123/experiment-01/actions/runs/45761999616) passed on `806ee886034d34ff9b757f32c740e9b56b220b2c`. This is search-core correctness work, not a competitive result.

## Question

Does the search objective match the benchmark's primary estimand: candidate wins divided by all paper-adjudicable games, with adjudicated draws counting as nonwins?

## Why scalar win-minus-loss is wrong for this estimand

A zero-sum terminal utility of win (+1), draw (0), loss (-1) maximizes (P(win)-P(loss)), not (P(win)). For example, a line with 40% wins, 60% draws, and no losses scores (+0.4), while a line with 50% wins, no draws, and 50% losses scores (0). The scalar margin prefers the first line even though its benchmark win rate is lower.

## Implemented objective

The core keeps the existing scalar `zero-sum` mode as the default and adds opt-in `valueMode: 'seat-win-probability'`.

- The caller supplies a typed `terminalOutcome` rather than a bare vector: `{kind:'seat-win', winnerSeat:0|1}`, `{kind:'adjudicated-draw', ruleId, reason, evidenceId}`, or `{kind:'adjudicated-no-winner', ruleId, reason, evidenceId}`. Both adjudicated nonwin classes require a versioned rule ID, non-empty reason, and evidence reference; a versioned `terminalOutcomeProtocolId` is required and recorded in the audit. Bare `[0,0]`, raw `NONE`, unresolved, invalid, aborted, and unknown outcomes are rejected.
- The core converts typed terminal outcomes to `[1,0]`, `[0,1]`, or `[0,0]`; both adjudicated draws and adjudicated no-winner outcomes are nonwins for both seats, while their distinct typed class is preserved in each rollout receipt.
- Each selected node backs up the component belonging to that node's physical seat. Seat 0 maximizes seat 0's win probability; seat 1 maximizes seat 1's win probability. No alternating sign flip is applied in this mode.
- Two-sided PUCT uses PUCT nodes for both physical seats.
- When a frozen `opponentActionPolicy` is supplied, only the non-root seat uses that policy; the root searches a best response. Audit metadata distinguishes `two-sided-puct` from `root-best-response-fixed-opponent-policy`.
- Fractional vectors are permitted only for observation/leaf estimates. The typed terminal callback must return a real seat winner or an explicitly adjudicated draw with a versioned rule ID, reason, and evidence reference; it must throw for `GameWinner.NONE`, invalid, aborted, or unsupported terminal states. The core checks the shape and attestation fields but cannot independently verify the external evidence. The Aichi caller must derive draw classifications from the event adjudicator, not merely Twinleaf's generic FINISHED phase or equal Prize counts.

## Validation added

`tests/2026-11/agent5-general-sum-search.test.cjs` carries the existing counterexample and two-sided best-response regressions, plus:

1. seat-swap symmetry for both `rootSeat=0` and `rootSeat=1`;
2. a fixed-opponent best-response cross-product for both root seats, verifying that actor-relative re-determinization occurs for both physical seats and the frozen policy is called only for the non-root seat;
3. rejection of bare `[0,0]`, unresolved outcomes, and draws without a rule/evidence attestation; fractional terminal estimates are no longer expressible through the typed API.

The existing `agent5-owner-root-native.yml` contract lane includes this test file. The lane is explicitly `native_search_only=true`; it does not dispatch games.

## Boundaries and limitations

- This is a generic search core, not a complete Pokémon policy.
- It depends on caller-supplied actor-safe observations, a correct actor-relative belief sampler, a complete legal-action frontier, a transition adapter that settles prompts, and a calibrated value evaluator.
- No evaluator calibration, full native game, self-play learning loop, Aichi matchup, deck selection, or competitive win-rate estimate is included.
- `cPuct` calibration for probability-scale Q values remains open.
- Twinleaf remains pinned by the repository submodule at `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`; this change does not modify upstream code.

## Reproduction

On the branch, run:

```sh
node --test tests/2026-11/agent5-general-sum-search.test.cjs
```

For the repository's broader native-search-only contract lane, dispatch `.github/workflows/agent5-owner-root-native.yml` with only `native_search_only=true`. Record the exact branch SHA and workflow run before claiming validation.
