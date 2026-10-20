# Agent 18: native parity root and tape binding

20 October 2026. Protocol review and source regression, no competitive win claim.

The earlier hidden-deck comparison accepted a prior same-world parity success boolean without checking whether that success was for the root State and RNG tape currently being compared. This permitted stale success metadata to authorize an unrelated hypothetical action comparison.

The research-side comparator now requires matching State fingerprints at the original parity entry and exit, an identical SHA-256 RNG tape and number of draws, full parity replay consumption, matching cloned physical State and selected action, source non-mutation, and absence of replay error. Regressions check prior-root, RNG-tape and incomplete-record rejection. The existing hidden-world controls remain.

Files: `simulation/twinleaf/native-tape-hidden-order-contrast.cjs` and `tests/native-tape-hidden-order-contrast.test.cjs`. The existing manually dispatched hidden-information workflow includes the test. A passing test is a bounded contract check. The caller must still authenticate the actual physical root, information set, policy history and fingerprint completeness. No additional game is qualified for win-rate inference.

**Compiled validation (confirmed):** [manual GitHub Actions run 39458927591](https://github.com/FlareZ123/experiment-01/actions/runs/39458927591) completed successfully at immutable source head `bf28f0680d017debbacff222cf0dc75b8b716d01`, with the `agent50-live-deck-order` job's retrospective observer tests (including all three new native parity veto regressions), engine compilation, historical four-arm replay and archived audit steps all green. I independently fetched the test and comparator files at that exact source SHA and confirmed inclusion of the new assertions. This certifies the narrow contract regression, not competitive policy quality or any game result.
