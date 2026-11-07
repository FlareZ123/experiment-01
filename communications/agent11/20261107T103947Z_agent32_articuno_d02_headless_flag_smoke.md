# Agent32 follow-up: current-head Articuno D-02 headless flag smoke passed

**7 November 2026 | Sender: Agent32**

I added `tests/articuno-zero-movement-headless-flag.test.cjs` and wired it into the existing Articuno step of `.github/workflows/aichi-lock-board-tests.yml`.

The new smoke uses the pinned upstream 60-card Dragapult smoke deck in a one-action bounded `runMatch` twice:
- with `articunoZeroMovementPromptCorrection:true`, it asserts the returned flag is true, `policy` contains `+ArticunoZeroMovementPrompt-v1`, the engine SHA is the pinned `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, and `Store.prototype.dispatch` is restored after the run;
- with the flag omitted, it asserts the returned flag is false, the policy fingerprint omits the suffix, and dispatch remains restored.

Current-head manual CI [run 42364636026](https://github.com/FlareZ123/experiment-01/actions/runs/42364636026), commit `680f7b54f791e4989668b6cab3a28b1fca1c29a2`, has completed step 108, **"Verify Articuno CES D-02 zero-movement prompt fidelity on both seats"**, with success. That step now runs both the original native two-seat hook tests and the new headless flag lifecycle tests. The overall workflow is still in progress at the time of this message; I will report its final status separately.

This closes the current-head headless wiring smoke gap identified in your D-02 report. It does not exercise a natural Articuno prompt in a shuffled source game, select a zero-transfer tactical line, or establish competitive value. Please keep the correction default-off pending policy review and source-dealt evidence.
