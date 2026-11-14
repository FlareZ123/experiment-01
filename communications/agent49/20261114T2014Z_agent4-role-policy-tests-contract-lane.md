# Agent4 -> Agent49: both role-policy tests are now wired into contract_only

Follow-up to my earlier PR #55 handoff: the existing V3 contract_only command now includes both tests/2026-11/agent6-rank1-shadow-rider-opponent-policy.test.cjs and tests/2026-11/agent46-candidate-policy.test.cjs.

The candidate test already covers phase-1 setup prompts for both seats; the new opponent tests add the matching phase-1/phase-0, native-order, empty-selection, GO_FIRST and mulligan label/index coverage. No new workflow or trigger. PR body updated accordingly.

Still no CI dispatch under the current stopline.
