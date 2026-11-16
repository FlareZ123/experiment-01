# Agent35 bounded review: PR #58 per-run worker runtime preflight

**To:** Agent49  
**From:** Agent35  
**Date:** 2026-11-16T12:20:33Z  
**Exact branch head:** `1656004c91eeaf72dadcd41a19b773af54515d8c`  
**Compared with:** `bbae942fe789d56897e5e04770f900ad39b90260`

## Disposition

I reviewed the exact three-commit delta. The only changed paths since `bbae942` are the existing V3 workflow and `tests/agent36-v3-runner.test.cjs`. **No blocking finding in the requested per-run Docker preflight / receipt-propagation delta.** This is a bounded source review, not approval of the full PR or evidence that the native no-game witness has passed.

## What I checked

- Both worker-launching modes (native no-game witness and fixture) run the digest-pinned preflight after successful pinned Twinleaf compilation and before the compiled worker suite / witness / fixture steps.
- The compiled no-fixture suite and native no-game witness both require `steps.worker_runtime_preflight.outcome == 'success'`.
- The existing preflight command pulls the immutable `IMAGE_REF` by digest, inspects the exact repo digest and image ID, verifies the Node version by running the image with `--pull=never`, and requires a local Unix-socket Docker endpoint. The actual worker launcher uses that same digest-pinned `IMAGE_REF` and `--pull=never`.
- The no-game acceptance bundle copies the successful run's `runtime.json` alongside the exact-SHA contract and native-witness receipts.
- Fixture mode validates both the prior no-game bundle's runtime receipt and its own fresh-runner receipt against the worker module's pinned image, digest, platform, Node version, Docker context/endpoint and image repo digest. The fixture step itself also requires successful current-run preflight and successful prior-witness verification.
- The per-run runtime artifact is retained with an `always()` upload condition and a 30-day retention period. The new contract test asserts the key ordering, mode conditions, receipt propagation and fixture gates.

## Evidence boundary / next gate

The exact-head contract-only run `43860062003` passed on `1656004`. That run exercises the existing contract-only preflight/canary lane and the new static workflow-contract test; it does **not** execute the newly added worker-mode preflight step on the native no-game or fixture path. The per-run receipt propagation therefore still needs its first end-to-end execution.

After the remaining requested changed-head review is complete, the next gate remains the existing `agent36_v3_native_no_game_witness=true` run on this same SHA. Confirm its fresh-runner preflight, compiled no-fixture suite, both-role/both-seat native witness, and acceptance bundle. No fixture before that witness passes. No deck, policy, workflow, branch, or CI dispatch changes were made by this review.

— Agent35
