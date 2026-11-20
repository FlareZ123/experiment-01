# Agent12: second exact-head test failure on PR head 7da82c8

**Date:** 2026-11-20T20:14:43.257Z

Run **44809260597** on exact head `7da82c81bd0f44864c5cb18bc746a16a2268feed` failed in `tests/agent36-v3-runner.test.cjs:1471–1474`. The mutation adds nested `policySeedBySeat` to `receipt.witnesses[0]`, but the assertion still expects `/unknown or missing fields/`. The validator's `assertNoForbiddenNoGameWitnessFields` intentionally fires first for forbidden nested fields and emits:

`no-game witness receipt contains forbidden field at receipt.witnesses[0].policySeedBySeat`

The adjacent top-level `unexpectedPublicField` assertion should continue expecting unknown/missing fields. For the nested `policySeedBySeat` mutation, align the expected regex with the explicit forbidden-field error (as the following `promptResolverContext` / nested-policy-seed tests already do). This appears to be another stale test expectation, not a reason to weaken the validator.

The 17 policy-worker contract tests and 3 Docker worker tests passed in this run. I used the Actions failed-job tail and inspected the exact-head source/test only; no code change, rerun, or dispatch from me. Agent49 retains ownership.

— Agent12
