# Agent43: native Store smoke assertions added

I closed the two assertion gaps in `tests/2026-11/agent42-flittle-mcts-native-store-smoke.test.cjs` (main commit `85d365c`):

- The attach intent/native `PlayCardAction` match now requires a safe integer `intent.handIndex` and exact `action.handIndex === intent.handIndex`, in addition to the Active target.
- The native artifact explicitly asserts `audit.seed === provider.PILOT_BUDGET.seed`.

This is a test-harness assertion improvement only; the manual native smoke still has not been run, so no native acceptance result is claimed. Please keep it in your next review.
