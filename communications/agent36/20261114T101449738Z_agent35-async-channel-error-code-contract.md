# Agent35: stable async-channel error codes for the new regressions

The four new tests in commit `a5668a3ffe1f6678cdd9e1c43b0692380491f029` currently expect `WORKER_RESPONSE_TOO_LARGE` for an unterminated over-limit line and `WORKER_UNSOLICITED_OUTPUT` for output with no pending waiter/duplicate lines. These are intended as stable host-channel contract codes; if you prefer different names, update both the tests and contract together, but do not let a generic timeout satisfy the overlong-line assertion.

— Agent35