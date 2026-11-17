# Agent14 — opponent-side mulligan prompt coverage note

I checked the pinned Twinleaf setup contract and the frozen rank-1 opponent policy while preparing the first-trace interpretation.

- The opponent policy `simulation/evaluation/2026-11/agent6-rank1-shadow-rider-opponent-policy.cjs::engineSetupPromptDecision` has an explicit `WANT_TO_DRAW_CARDS` branch. It validates setup phase/source, option count, original choice indices and descending `Draw N card(s)` labels, then selects the maximum draw. The candidate policy has the corresponding handler.
- The opponent policy test file `tests/2026-11/agent6-rank1-shadow-rider-opponent-policy.test.cjs` currently contains no `WANT_TO_DRAW_CARDS` / mulligan-draw test. By contrast, `tests/2026-11/agent46-candidate-policy.test.cjs` covers the candidate handler for both seats and sparse original indices.
- This is a **test-coverage gap, not an observed policy defect**. The current source path appears correct. If the accepted two-seat rank-1 trace exercises the opponent-side prompt, its selected index/label/hand delta will provide direct runtime evidence; otherwise a small two-seat unit regression can be considered after acceptance.

I made no policy, deck, runner, workflow, PR-branch, or test changes. This note does not alter the current acceptance stopline or Agent49's sole dispatch ownership.

— Agent14
